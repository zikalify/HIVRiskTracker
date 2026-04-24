const GENDERS = ['cis_male', 'cis_female', 'trans_male', 'trans_female', 'non_binary'];

function getEncounterPartnerGenders(encounters = []) {
    return (encounters || [])
        .map(enc => enc && enc.partnerGender)
        .filter(Boolean);
}

function getEffectiveHasSexWith(profile = {}, encounters = []) {
    const profileHasSexWith = profile.hasSexWith || [];
    const encounterPartnerGenders = getEncounterPartnerGenders(encounters);
    return [...new Set([...profileHasSexWith, ...encounterPartnerGenders])];
}

function isUserInMSMNetwork(uGender, effectiveHasSexWith = []) {
    const isUserMale = ['cis_male', 'trans_male'].includes(uGender);
    const isUserNonBinary = uGender === 'non_binary';
    const hasMalePartners = effectiveHasSexWith.some(p => ['cis_male', 'trans_male'].includes(p));
    if (isUserMale) return hasMalePartners;
    if (isUserNonBinary) return hasMalePartners;
    return false;
}

function isKeyPopulationEncounter(uGender, pGender) {
    if (!uGender || !pGender) return false;

    const isUserMale = ['cis_male', 'trans_male'].includes(uGender);
    const isUserNonBinary = uGender === 'non_binary';
    const isPartnerMale = ['cis_male', 'trans_male'].includes(pGender);
    const isUserTransWoman = uGender === 'trans_female';
    const isPartnerTransWoman = pGender === 'trans_female';

    if ((isUserMale || isUserNonBinary) && (isPartnerMale || isPartnerTransWoman)) return true;
    if (isUserTransWoman && (isPartnerMale || isPartnerTransWoman)) return true;
    return false;
}

function getProfileRiskFactors(profile, encounters) {
    const factors = [];
    const uGender = profile.gender;
    const effectiveHasSexWith = getEffectiveHasSexWith(profile, encounters);
    const isMSM = isUserInMSMNetwork(uGender, effectiveHasSexWith);
    const isTransWoman = uGender === 'trans_female';
    const isHeterosexualWomanAtRisk = uGender === 'cis_female' &&
        encounters.some(enc =>
            ['cis_male', 'trans_male'].includes(enc.partnerGender) &&
            isPenetrativeAct(enc.actType) &&
            enc.partnerStatus !== 'negative' &&
            enc.partnerStatus !== 'positive_undetectable' &&
            enc.condomUse !== 'yes'
        );

    if (isMSM) factors.push('msm');
    if (isTransWoman) factors.push('trans_woman');
    if (isHeterosexualWomanAtRisk) factors.push('heterosexual_woman_at_risk');
    if (profile.pwid) factors.push('pwid');
    if (profile.sti) factors.push('active_sti');
    if (profile.newPartners) factors.push('new_partners');

    return factors;
}

function deriveWhoFlags(profile, encounters) {
    const effectiveHasSexWith = getEffectiveHasSexWith(profile, encounters);
    const profileFactors = getProfileRiskFactors(profile, encounters);
    const isUserInKeyNetwork = effectiveHasSexWith.some(pg => isKeyPopulationEncounter(profile.gender, pg)) ||
        profile.gender.startsWith('trans_');
    const isPrEPCandidate =
        profileFactors.includes('msm') ||
        profileFactors.includes('trans_woman') ||
        profileFactors.includes('heterosexual_woman_at_risk') ||
        profileFactors.includes('pwid') ||
        profileFactors.includes('active_sti') ||
        profileFactors.includes('new_partners');

    return {
        effectiveHasSexWith,
        profileFactors,
        isMSMNetwork: isUserInMSMNetwork(profile.gender, effectiveHasSexWith),
        isUserInKeyNetwork,
        isPrEPCandidate
    };
}

function isPenetrativeAct(actType) {
    return ['receptive_anal', 'insertive_anal', 'receptive_vaginal', 'insertive_vaginal'].includes(actType);
}

function isAnalAct(actType) {
    return ['receptive_anal', 'insertive_anal'].includes(actType);
}

function isPartnerHivCovered(enc) {
    return enc.partnerStatus === 'negative' || enc.partnerStatus === 'positive_undetectable';
}

function hasPartnerStiRisk(enc) {
    return enc.partnerSti === 'yes';
}

function hasHigherRiskPartnerContext(enc) {
    return !isPartnerHivCovered(enc) || hasPartnerStiRisk(enc);
}

function hasHigherRiskSexualExposure(encounters = []) {
    return encounters.some(enc =>
        isPenetrativeAct(enc.actType) &&
        (enc.condomUse !== 'yes' || hasHigherRiskPartnerContext(enc))
    );
}

function isMeaningfulPostTestExposure(enc) {
    if (!enc) return false;
    if (enc.actType === 'shared_needles') return true;
    if (!isPenetrativeAct(enc.actType)) return false;

    const partnerStatusCovered = isPartnerHivCovered(enc) && !hasPartnerStiRisk(enc);
    if (partnerStatusCovered) return false;
    if (enc.condomUse === 'yes' && !hasPartnerStiRisk(enc)) return false;

    return true;
}

function getMeaningfulPostTestEncounters(testDate, encounters = []) {
    if (!testDate) return encounters.filter(isMeaningfulPostTestExposure);
    const cutoff = new Date(testDate).getTime();
    return encounters.filter(enc => new Date(enc.date).getTime() > cutoff && isMeaningfulPostTestExposure(enc));
}

function getLatestMeaningfulEncounterDate(encounters = []) {
    const meaningfulEncounters = encounters.filter(isMeaningfulPostTestExposure);
    if (!meaningfulEncounters.length) return null;
    return meaningfulEncounters
        .map(enc => new Date(enc.date))
        .sort((a, b) => b - a)[0];
}

function hasRecentIntimateExposure(encounters = [], days = 21) {
    const nowMs = Date.now();
    return encounters.some(enc => {
        if (enc.actType === 'shared_needles') return false;
        const daysSince = Math.floor((nowMs - new Date(enc.date).getTime()) / (1000 * 60 * 60 * 24));
        return daysSince <= days;
    });
}

function deriveExposureFlags(profile, encounters, tests = {}) {
    const whoFlags = deriveWhoFlags(profile, encounters);
    const hasHigherRiskSexualContext = hasHigherRiskSexualExposure(encounters);
    const latestHepB = tests.hep_b || null;
    const needleExposure = encounters.some(enc => enc.actType === 'shared_needles');
    const hasUnprotectedSexWithRisk = encounters.some(enc =>
        isPenetrativeAct(enc.actType) &&
        enc.condomUse !== 'yes' &&
        hasHigherRiskPartnerContext(enc)
    );
    const hasAnalSexWithRisk = encounters.some(enc =>
        isAnalAct(enc.actType) &&
        enc.condomUse !== 'yes' &&
        hasHigherRiskPartnerContext(enc)
    );
    const hasPenetrativeReceptiveRole = encounters.some(enc =>
        enc.actType === 'receptive_anal' || enc.actType === 'receptive_vaginal'
    );
    const latestResolvedStiDate = tests.latest_resolved_sti_date || null;
    const meaningfulPostTestEncounters = getMeaningfulPostTestEncounters(latestResolvedStiDate, encounters);
    const latestMeaningfulEncounterDate = getLatestMeaningfulEncounterDate(encounters);
    const hasElevatedRisk = profile.onPrep || profile.onPep || profile.sti || profile.newPartners || profile.sexWorker || tests.latest_hiv_result === 'positive';
    const isSexWorker = !!profile.sexWorker;
    const isPWID = !!profile.pwid;
    const isMSM = whoFlags.isMSMNetwork;
    const isTransWoman = profile.gender === 'trans_female';
    const isTestDue = (type, intervalDays) => {
        const testDate = tests[`${type}_date`];
        if (!testDate) return true;
        const daysSinceTest = Math.floor((Date.now() - new Date(testDate).getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceTest >= intervalDays;
    };
    const routineTests = [];
    const exposureTests = [];

    if ((isMSM || isTransWoman || isSexWorker || isPWID) && isTestDue('hiv', hasElevatedRisk ? 180 : 365)) {
        routineTests.push('hiv');
    }
    if ((isMSM || isSexWorker) && isTestDue('gonorrhea', hasElevatedRisk ? 180 : 365)) {
        routineTests.push('gonorrhea');
    }
    if ((isMSM || isSexWorker) && isTestDue('chlamydia', hasElevatedRisk ? 180 : 365)) {
        routineTests.push('chlamydia');
    }
    if ((isMSM || isSexWorker) && isTestDue('syphilis', hasElevatedRisk ? 180 : 365)) {
        routineTests.push('syphilis');
    }
    if (latestMeaningfulEncounterDate) {
        exposureTests.push('hiv');
    }

    return {
        ...whoFlags,
        hasHigherRiskSexualContext,
        meaningfulPostTestExposureCount: meaningfulPostTestEncounters.length,
        hasMeaningfulHivFollowUp: !!latestMeaningfulEncounterDate,
        routineTests,
        exposureTests,
        needsHepBTesting: needleExposure ||
            hasUnprotectedSexWithRisk ||
            (!profile.hepBVaccinated && !latestHepB && (profile.pwid || (profile.newPartners && hasHigherRiskSexualContext))),
        needsHepCTesting: profile.pwid || needleExposure || hasAnalSexWithRisk,
        shouldSuggestHepBVaccine: !profile.hepBVaccinated &&
            (profile.pwid || profile.sti || (profile.newPartners && hasHigherRiskSexualContext) || (whoFlags.isUserInKeyNetwork && hasHigherRiskSexualContext)),
        shouldSuggestMpoxVaccine: !profile.mpoxVaccinated &&
            (profile.sexWorker || profile.sti || (whoFlags.isUserInKeyNetwork && profile.newPartners && hasRecentIntimateExposure(encounters) && hasHigherRiskSexualContext)),
        shouldShowReceivingRisk: profile.role === 'receptive' && hasPenetrativeReceptiveRole,
        shouldShowScreeningRoutine: whoFlags.isUserInKeyNetwork &&
            !profile.isVirgin &&
            (profile.newPartners || profile.onPrep || profile.sti || hasHigherRiskSexualContext)
    };
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

const now = new Date().toISOString();

function makeEncounter(partnerGender, partnerStatus = 'unknown') {
    return [{
        date: now,
        partnerGender,
        partnerStatus,
        partnerSti: 'unknown',
        actType: 'insertive_anal',
        condomUse: 'no'
    }];
}

function makeCustomEncounter(partnerGender, options = {}) {
    return [{
        date: options.date || now,
        partnerGender,
        partnerStatus: options.partnerStatus || 'negative',
        partnerSti: options.partnerSti || 'unknown',
        actType: options.actType || 'insertive_vaginal',
        condomUse: options.condomUse || 'yes'
    }];
}

const explicitCases = [
    {
        name: 'Straight cis man with cis male encounter still gets MSM/PrEP guidance',
        profile: { gender: 'cis_male', hasSexWith: ['cis_female'], pwid: false, sti: false, newPartners: false },
        encounters: makeEncounter('cis_male'),
        expect: flags => flags.profileFactors.includes('msm') && flags.isPrEPCandidate && flags.isUserInKeyNetwork
    },
    {
        name: 'Straight cis man with trans male encounter still gets MSM/PrEP guidance',
        profile: { gender: 'cis_male', hasSexWith: ['cis_female'], pwid: false, sti: false, newPartners: false },
        encounters: makeEncounter('trans_male'),
        expect: flags => flags.profileFactors.includes('msm') && flags.isPrEPCandidate && flags.isUserInKeyNetwork
    },
    {
        name: 'Non-binary user with cis male encounter is treated as in MSM network',
        profile: { gender: 'non_binary', hasSexWith: [], pwid: false, sti: false, newPartners: false },
        encounters: makeEncounter('cis_male'),
        expect: flags => flags.profileFactors.includes('msm') && flags.isPrEPCandidate && flags.isUserInKeyNetwork
    },
    {
        name: 'Cis woman with unknown-status cis male encounter gets WHO substantial-risk PrEP guidance',
        profile: { gender: 'cis_female', hasSexWith: [], pwid: false, sti: false, newPartners: false },
        encounters: makeEncounter('cis_male', 'unknown'),
        expect: flags => flags.profileFactors.includes('heterosexual_woman_at_risk') && flags.isPrEPCandidate
    },
    {
        name: 'Cis man with cis female encounter alone does not get false MSM flag',
        profile: { gender: 'cis_male', hasSexWith: [], pwid: false, sti: false, newPartners: false },
        encounters: makeEncounter('cis_female'),
        expect: flags => !flags.profileFactors.includes('msm')
    },
    {
        name: 'Trans woman remains a PrEP candidate per WHO key-pop guidance',
        profile: { gender: 'trans_female', hasSexWith: [], pwid: false, sti: false, newPartners: false },
        encounters: [],
        expect: flags => flags.profileFactors.includes('trans_woman') && flags.isPrEPCandidate && flags.isUserInKeyNetwork
    }
];

function runExplicitCases() {
    explicitCases.forEach(testCase => {
        const flags = deriveWhoFlags(testCase.profile, testCase.encounters);
        assert(testCase.expect(flags), `${testCase.name} failed. Derived flags: ${JSON.stringify(flags)}`);
    });
}

function runParitySweep() {
    const users = ['cis_male', 'trans_male', 'non_binary'];
    const partners = ['cis_male', 'trans_male', 'non_binary'];

    users.forEach(userGender => {
        partners.forEach(partnerGender => {
            const viaProfile = deriveWhoFlags(
                { gender: userGender, hasSexWith: [partnerGender], pwid: false, sti: false, newPartners: false },
                []
            );
            const viaEncounter = deriveWhoFlags(
                { gender: userGender, hasSexWith: [], pwid: false, sti: false, newPartners: false },
                makeEncounter(partnerGender)
            );

            assert(
                viaProfile.isMSMNetwork === viaEncounter.isMSMNetwork,
                `MSM parity failed for ${userGender} + ${partnerGender}`
            );
            assert(
                viaProfile.isUserInKeyNetwork === viaEncounter.isUserInKeyNetwork,
                `Key-network parity failed for ${userGender} + ${partnerGender}`
            );
            assert(
                viaProfile.isPrEPCandidate === viaEncounter.isPrEPCandidate,
                `PrEP parity failed for ${userGender} + ${partnerGender}`
            );
        });
    });
}

function runLowRiskPairingSweep() {
    const actTypes = ['insertive_anal', 'receptive_anal', 'insertive_vaginal', 'receptive_vaginal', 'giving_oral', 'receiving_oral'];

    GENDERS.forEach(userGender => {
        GENDERS.forEach(partnerGender => {
            actTypes.forEach(actType => {
                const profile = {
                    gender: userGender,
                    hasSexWith: [],
                    role: actType.startsWith('receptive') ? 'receptive' : 'insertive',
                    pwid: false,
                    sti: false,
                    newPartners: false,
                    onPrep: false,
                    sexWorker: false,
                    hepBVaccinated: false,
                    mpoxVaccinated: false,
                    isVirgin: false
                };
                const encounters = makeCustomEncounter(partnerGender, {
                    actType,
                    condomUse: 'yes',
                    partnerStatus: 'negative',
                    partnerSti: 'no'
                });
                const flags = deriveExposureFlags(profile, encounters, {});

                assert(!flags.needsHepBTesting, `Low-risk sweep incorrectly triggered Hep B testing for ${userGender} + ${partnerGender} + ${actType}`);
                assert(!flags.needsHepCTesting, `Low-risk sweep incorrectly triggered Hep C testing for ${userGender} + ${partnerGender} + ${actType}`);
                assert(!flags.shouldSuggestHepBVaccine, `Low-risk sweep incorrectly triggered Hep B vaccine guidance for ${userGender} + ${partnerGender} + ${actType}`);
                assert(!flags.shouldSuggestMpoxVaccine, `Low-risk sweep incorrectly triggered mpox vaccine guidance for ${userGender} + ${partnerGender} + ${actType}`);
                assert(!flags.shouldShowScreeningRoutine, `Low-risk sweep incorrectly triggered frequent screening guidance for ${userGender} + ${partnerGender} + ${actType}`);
                if (!['receptive_anal', 'receptive_vaginal'].includes(actType)) {
                    assert(!flags.shouldShowReceivingRisk, `Low-risk sweep incorrectly triggered receiving-risk guidance for ${userGender} + ${partnerGender} + ${actType}`);
                }
            });
        });
    });
}

function runExposureSpecificCases() {
    const cases = [
        {
            name: 'Condomless anal sex with unknown-status male partner still triggers Hep B and Hep C follow-up',
            profile: {
                gender: 'cis_male',
                hasSexWith: [],
                role: 'insertive',
                pwid: false,
                sti: false,
                newPartners: false,
                onPrep: false,
                sexWorker: false,
                hepBVaccinated: false,
                mpoxVaccinated: false,
                isVirgin: false
            },
            encounters: makeCustomEncounter('cis_male', {
                actType: 'insertive_anal',
                condomUse: 'no',
                partnerStatus: 'unknown',
                partnerSti: 'unknown'
            }),
            expect: flags => flags.needsHepBTesting && flags.needsHepCTesting && flags.shouldShowScreeningRoutine
        },
        {
            name: 'Key-network user with new recent partners can still get mpox vaccine guidance',
            profile: {
                gender: 'cis_male',
                hasSexWith: [],
                role: 'insertive',
                pwid: false,
                sti: false,
                newPartners: true,
                onPrep: false,
                sexWorker: false,
                hepBVaccinated: false,
                mpoxVaccinated: false,
                isVirgin: false
            },
            encounters: makeCustomEncounter('cis_male', {
                actType: 'insertive_anal',
                condomUse: 'no',
                partnerStatus: 'unknown',
                partnerSti: 'unknown'
            }),
            expect: flags => flags.shouldSuggestMpoxVaccine
        },
        {
            name: 'Single recent low-risk protected key-network encounter does not trigger mpox or Hep B vaccine guidance',
            profile: {
                gender: 'cis_male',
                hasSexWith: [],
                role: 'insertive',
                pwid: false,
                sti: false,
                newPartners: true,
                onPrep: false,
                sexWorker: false,
                hepBVaccinated: false,
                mpoxVaccinated: false,
                isVirgin: false
            },
            encounters: makeCustomEncounter('cis_male', {
                actType: 'insertive_anal',
                condomUse: 'yes',
                partnerStatus: 'negative',
                partnerSti: 'no'
            }),
            expect: flags => !flags.shouldSuggestMpoxVaccine && !flags.shouldSuggestHepBVaccine
        },
        {
            name: 'Receptive role without receptive penetrative activity does not get receiving-risk warning',
            profile: {
                gender: 'trans_female',
                hasSexWith: [],
                role: 'receptive',
                pwid: false,
                sti: false,
                newPartners: false,
                onPrep: false,
                sexWorker: false,
                hepBVaccinated: false,
                mpoxVaccinated: false,
                isVirgin: false
            },
            encounters: makeCustomEncounter('cis_male', {
                actType: 'receiving_oral',
                condomUse: 'yes',
                partnerStatus: 'negative',
                partnerSti: 'no'
            }),
            expect: flags => !flags.shouldShowReceivingRisk
        },
        {
            name: 'Two low-risk post-test vaginal encounters do not count as meaningful follow-up exposures',
            profile: {
                gender: 'cis_male',
                hasSexWith: [],
                role: 'insertive',
                pwid: false,
                sti: false,
                newPartners: false,
                onPrep: false,
                sexWorker: false,
                hepBVaccinated: false,
                mpoxVaccinated: false,
                isVirgin: false
            },
            encounters: [
                {
                    date: now,
                    partnerGender: 'cis_female',
                    partnerStatus: 'negative',
                    partnerSti: 'no',
                    actType: 'insertive_vaginal',
                    condomUse: 'no'
                },
                {
                    date: now,
                    partnerGender: 'cis_female',
                    partnerStatus: 'unknown',
                    partnerSti: 'unknown',
                    actType: 'insertive_vaginal',
                    condomUse: 'yes'
                }
            ],
            tests: {
                latest_resolved_sti_date: '2025-12-24T00:00:00.000Z',
                hiv_date: '2025-12-24T00:00:00.000Z',
                gonorrhea_date: '2025-12-24T00:00:00.000Z',
                chlamydia_date: '2025-12-24T00:00:00.000Z',
                syphilis_date: '2025-12-24T00:00:00.000Z'
            },
            expect: flags => flags.meaningfulPostTestExposureCount === 0 && !flags.hasMeaningfulHivFollowUp && !flags.needsHepBTesting && !flags.needsHepCTesting && flags.routineTests.length === 0 && flags.exposureTests.length === 0
        },
        {
            name: 'Oral sex with confirmed-negative male partner does not create exposure follow-up or force routine tests at four months',
            profile: {
                gender: 'cis_male',
                hasSexWith: [],
                role: 'insertive',
                pwid: false,
                sti: false,
                newPartners: false,
                onPrep: false,
                onPep: false,
                sexWorker: false,
                hepBVaccinated: false,
                mpoxVaccinated: false,
                isVirgin: false
            },
            encounters: makeCustomEncounter('cis_male', {
                actType: 'giving_oral',
                condomUse: 'no',
                partnerStatus: 'negative',
                partnerSti: 'no'
            }),
            tests: {
                latest_resolved_sti_date: '2025-12-24T00:00:00.000Z',
                hiv_date: '2025-12-24T00:00:00.000Z',
                gonorrhea_date: '2025-12-24T00:00:00.000Z',
                chlamydia_date: '2025-12-24T00:00:00.000Z',
                syphilis_date: '2025-12-24T00:00:00.000Z'
            },
            expect: flags => flags.meaningfulPostTestExposureCount === 0 && !flags.hasMeaningfulHivFollowUp && flags.routineTests.length === 0 && flags.exposureTests.length === 0
        }
    ];

    cases.forEach(testCase => {
        const flags = deriveExposureFlags(testCase.profile, testCase.encounters, testCase.tests || {});
        assert(testCase.expect(flags), `${testCase.name} failed. Derived flags: ${JSON.stringify(flags)}`);
    });
}

function run() {
    runExplicitCases();
    runParitySweep();
    runLowRiskPairingSweep();
    runExposureSpecificCases();

    console.log('WHO-aligned guidance mismatch tests passed.');
    console.log(`Explicit cases: ${explicitCases.length}`);
    console.log('Parity sweep: 9 combinations');
    console.log('Low-risk pairing sweep: 150 combinations');
    console.log('Exposure-specific cases: 5');
    console.log(`Gender values covered: ${GENDERS.join(', ')}`);
}

run();
