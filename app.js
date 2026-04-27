// State management
let state = {
    profile: {
        gender: 'cis_male',
        hasSexWith: [],
        role: 'versatile',
        onPrep: false,
        prepType: 'daily',
        onPep: false,
        pepStartDate: null,
        hepBVaccinated: false,
        mpoxVaccinated: false,
        hpvVaccinated: false,
        circumcised: false,
        sti: false,
        newPartners: false,
        pwid: false,
        isVirgin: true
    },
    encounters: [],
    tests: [],
    settings: {
        remindersEnabled: false,
        lastReminderDate: null
    }
};

let editingEncounterId = null;

const GENDER_LABELS = {
    'cis_male': 'Cisgender Man',
    'cis_female': 'Cisgender Woman',
    'trans_female': 'Transgender Woman',
    'trans_male': 'Transgender Man',
    'non_binary': 'Non-binary / Other'
};

const TEST_TYPE_LABELS = {
    hiv: 'HIV',
    gonorrhea: 'Gonorrhea',
    chlamydia: 'Chlamydia',
    syphilis: 'Syphilis',
    hep_b: 'Hep B',
    hep_c: 'Hep C',
    mpox: 'Mpox'
};

const STI_TEST_TYPES = ['gonorrhea', 'chlamydia', 'syphilis'];
const HEPATITIS_TEST_TYPES = ['hep_b', 'hep_c'];

const TEST_RESULT_OPTIONS = {
    hiv: [
        { value: 'negative', label: 'Negative' },
        { value: 'positive', label: 'Positive' },
        { value: 'pending', label: 'Pending' },
        { value: 'inconclusive', label: 'Inconclusive' }
    ],
    gonorrhea: [
        { value: 'negative', label: 'Negative' },
        { value: 'positive', label: 'Positive' },
        { value: 'treated', label: 'Treated / Resolved' },
        { value: 'pending', label: 'Pending' },
        { value: 'inconclusive', label: 'Inconclusive' }
    ],
    chlamydia: [
        { value: 'negative', label: 'Negative' },
        { value: 'positive', label: 'Positive' },
        { value: 'treated', label: 'Treated / Resolved' },
        { value: 'pending', label: 'Pending' },
        { value: 'inconclusive', label: 'Inconclusive' }
    ],
    syphilis: [
        { value: 'negative', label: 'Negative' },
        { value: 'positive', label: 'Positive' },
        { value: 'treated', label: 'Treated / Resolved' },
        { value: 'pending', label: 'Pending' },
        { value: 'inconclusive', label: 'Inconclusive' }
    ],
    hep_b: [
        { value: 'negative', label: 'Negative' },
        { value: 'positive', label: 'Positive' },
        { value: 'pending', label: 'Pending' },
        { value: 'inconclusive', label: 'Inconclusive' }
    ],
    hep_c: [
        { value: 'negative', label: 'Negative' },
        { value: 'positive', label: 'Positive' },
        { value: 'pending', label: 'Pending' },
        { value: 'inconclusive', label: 'Inconclusive' }
    ],
    mpox: [
        { value: 'negative', label: 'Negative' },
        { value: 'positive', label: 'Positive' },
        { value: 'pending', label: 'Pending' },
        { value: 'inconclusive', label: 'Inconclusive' }
    ]
};

const TEST_RESULT_LABELS = {
    negative: 'Negative',
    positive: 'Positive',
    pending: 'Pending',
    inconclusive: 'Inconclusive',
    treated: 'Treated / Resolved'
};

// DOM Elements
const statusDot = document.getElementById('status-dot');
const riskText = document.getElementById('risk-percentage');
const riskDesc = document.getElementById('risk-description');
const encounterModal = document.getElementById('encounter-modal');
const btnNewEncounter = document.getElementById('btn-new-encounter');
const btnCloseModal = document.querySelector('.close-btn');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');

// Profile inputs
const userGender = document.getElementById('user-gender');
const userHasSexWithCheckboxes = document.querySelectorAll('#user-has-sex-with input[type="checkbox"]');
const userHasSexWithMenu = document.getElementById('user-has-sex-with');
const hasSexWithToggle = document.getElementById('has-sex-with-toggle');
const userRole = document.getElementById('user-role');
const userPrep = document.getElementById('user-prep');
const userPep = document.getElementById('user-pep');
const userPepStart = document.getElementById('user-pep-start');
const pepDateGroup = document.getElementById('pep-date-group');
const userHepBVax = document.getElementById('user-hep-b-vax');
const userMpoxVax = document.getElementById('user-mpox-vax');
const userHpvVax = document.getElementById('user-hpv-vax');
const userCircumcised = document.getElementById('user-circumcised');
const userSti = document.getElementById('user-sti');
const userNewPartners = document.getElementById('user-new-partners');
const userPwid = document.getElementById('user-pwid');
const userVirgin = document.getElementById('user-virgin');
const circumcisionGroup = document.getElementById('circumcision-group');

// Form
const encounterForm = document.getElementById('encounter-form');
const encountersList = document.getElementById('encounters-list');
const partnerStatusSelect = document.getElementById('partner-status');
const partnerSti = document.getElementById('partner-sti');
const partnerGenderSelect = document.getElementById('partner-gender');
const encounterDateInput = document.getElementById('encounter-date');

// Screening elements
const latestHivTestDisplay = document.getElementById('latest-hiv-test-display');
const latestGonorrheaDisplay = document.getElementById('latest-gonorrhea-display');
const latestChlamydiaDisplay = document.getElementById('latest-chlamydia-display');
const latestSyphilisDisplay = document.getElementById('latest-syphilis-display');
const latestHepBDisplay = document.getElementById('latest-hep-b-display');
const latestHepCDisplay = document.getElementById('latest-hep-c-display');
const latestMpoxDisplay = document.getElementById('latest-mpox-display');
const testTypeSelect = document.getElementById('test-type-select');
const logTestDateInput = document.getElementById('log-test-date');
const testResultSelect = document.getElementById('test-result-select');
const btnLogTest = document.getElementById('btn-log-test');
const btnClearTestHistory = document.getElementById('btn-clear-test-history');
const testHistoryList = document.getElementById('test-history-list');
const testResultHelp = document.getElementById('test-result-help');

// Settings elements
const settingReminders = document.getElementById('setting-reminders');
const btnRequestNotifications = document.getElementById('btn-request-notifications');
const btnClearAllData = document.getElementById('btn-clear-all-data');
const reminderStatusText = document.getElementById('reminder-status');
const btnExportData = document.getElementById('btn-export-data');
const btnImportTrigger = document.getElementById('btn-import-trigger');
const importFileInput = document.getElementById('import-file');

const APP_NOTIFICATION_OPTIONS = {
    icon: 'icons/icon-192.png',
    badge: 'icons/notification-badge.png'
};

// Initialize
console.log('init() called');
function init() {
    console.log('init() called');
    loadState();
    toggleCircumcisionVisibility();
    setupEventListeners();
    updateGuidance();
    updateReminderUI();
    triggerReminderCheck();
    if(typeof updateDropdownText === 'function') updateDropdownText();
    updateDashboard();
    renderEncounters();
    renderTestingUI();
    handleLaunchActions();
    console.log('init() completed');
}

function ensureStateShape() {
    if (!state.profile) state.profile = {};
    if (!state.encounters) state.encounters = [];
    if (!state.tests) state.tests = [];
    if (!state.settings) state.settings = { remindersEnabled: false, lastReminderDate: null };
    if (state.profile.mpoxVaccinated === undefined) state.profile.mpoxVaccinated = false;
    if (state.profile.hpvVaccinated === undefined) state.profile.hpvVaccinated = false;
    if (state.profile.prepType === undefined) state.profile.prepType = 'daily';
    if (state.profile.sexWorker === undefined) state.profile.sexWorker = false;
}

function migrateLegacyState() {
    if (state.profile.lastStiTestDate) {
        const legacyDate = new Date(state.profile.lastStiTestDate).toISOString();
        const legacyTypes = ['hiv', 'gonorrhea', 'chlamydia', 'syphilis'];

        legacyTypes.forEach(type => {
            const alreadyHasLegacyResult = state.tests.some(test =>
                test.type === type && new Date(test.date).toISOString() === legacyDate
            );

            if (!alreadyHasLegacyResult) {
                state.tests.push({
                    id: `legacy-${type}-${Date.parse(legacyDate) || Date.now()}`,
                    type,
                    result: 'negative',
                    date: legacyDate,
                    source: 'legacy'
                });
            }
        });
    }

    state.tests = state.tests.flatMap(test => {
        if (test.type !== 'sti_panel') return [test];

        return ['hiv', 'gonorrhea', 'chlamydia', 'syphilis'].map(type => {
            let mappedResult = test.result;
            if (test.result === 'clear') mappedResult = 'negative';
            if (test.result === 'mixed') mappedResult = 'inconclusive';
            if (type === 'hiv' && test.result === 'treated') mappedResult = 'inconclusive';

            return {
            ...test,
            id: `${test.id}-${type}`,
            type,
            result: mappedResult
            };
        });
    }).filter((test, index, array) => {
        return array.findIndex(candidate =>
            candidate.type === test.type &&
            candidate.result === test.result &&
            new Date(candidate.date).toISOString() === new Date(test.date).toISOString()
        ) === index;
    });

    if (state.profile.lastStiTestDate) {
        delete state.profile.lastStiTestDate;
    }

    state.tests = state.tests.map(test => {
        if (test.type === 'sti_panel') {
            return null;
        }
        return test;
    }).filter(Boolean);
}

function sortTestsDescending(tests = state.tests) {
    return [...tests].sort((a, b) => new Date(b.date) - new Date(a.date));
}

function getLatestTest(type) {
    return sortTestsDescending(state.tests).find(test => test.type === type) || null;
}

function getLatestTestsByType() {
    return Object.keys(TEST_TYPE_LABELS).reduce((acc, type) => {
        acc[type] = getLatestTest(type);
        return acc;
    }, {});
}

function hasAnyActiveStiInLatestResults(tests = state.tests) {
    const latestByType = {};
    sortTestsDescending(tests)
        .filter(test => STI_TEST_TYPES.includes(test.type))
        .forEach(test => {
            if (!latestByType[test.type]) {
                latestByType[test.type] = test;
            }
        });

    return Object.values(latestByType).some(test =>
        ['positive', 'pending', 'inconclusive'].includes(test.result)
    );
}

function formatTestSummary(test) {
    if (!test) return null;
    const dateStr = new Date(test.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    return `${TEST_RESULT_LABELS[test.result] || test.result} on ${dateStr}`;
}

function getRelevantNegativeHivTest() {
    return sortTestsDescending(state.tests).find(test => test.type === 'hiv' && test.result === 'negative') || null;
}

function getEncountersSince(date) {
    if (!date) return [...state.encounters];
    return state.encounters.filter(enc => new Date(enc.date) > new Date(date));
}

function getRecentExposureWindowInfo(referenceDate = new Date()) {
    const cutoff = new Date(referenceDate);
    cutoff.setDate(cutoff.getDate() - 30);
    const recentEncounters = state.encounters.filter(enc => new Date(enc.date) >= cutoff);
    return {
        cutoff,
        recentEncounters
    };
}

function getCurrentHivRiskContext() {
    const latestHivTest = getLatestTest('hiv');

    if (!latestHivTest) {
        return {
            latestHivTest: null,
            relevantEncounters: [...state.encounters],
            historicalEncounters: [],
            windowedEncounters: []
        };
    }

    if (latestHivTest.result === 'negative') {
        const cutoff = new Date(latestHivTest.date);
        cutoff.setDate(cutoff.getDate() - 90); // 90-day window to account for rapid tests

        const relevantEncounters = state.encounters.filter(enc => new Date(enc.date) >= cutoff);
        const historicalEncounters = state.encounters.filter(enc => new Date(enc.date) < cutoff);
        const windowedEncounters = state.encounters.filter(enc => {
            const encDate = new Date(enc.date);
            return encDate >= cutoff && encDate <= new Date(latestHivTest.date);
        });

        return {
            latestHivTest,
            relevantEncounters,
            historicalEncounters,
            windowedEncounters,
            cutoff
        };
    }

    return {
        latestHivTest,
        relevantEncounters: [...state.encounters],
        historicalEncounters: [],
        windowedEncounters: []
    };
}

function hasSexualExposure(encounters = state.encounters) {
    return encounters.some(enc => enc.actType && enc.actType !== 'other' && enc.actType !== 'shared_needles');
}

function hasNeedleExposure(encounters = state.encounters) {
    return encounters.some(enc => enc.actType === 'shared_needles');
}

function getLatestEncounterDate() {
    if (!state.encounters.length) return null;
    return state.encounters
        .map(enc => new Date(enc.date))
        .sort((a, b) => b - a)[0];
}

function getLatestMeaningfulEncounterDate(encounters = state.encounters) {
    const meaningfulEncounters = (encounters || []).filter(isMeaningfulPostTestExposure);
    if (!meaningfulEncounters.length) return null;
    return meaningfulEncounters
        .map(enc => new Date(enc.date))
        .sort((a, b) => b - a)[0];
}

function getEarliestUntestedEncounterDate() {
    const latestTests = getLatestTestsByType();
    const now = new Date();
    
    // Find encounters that haven't been adequately tested
    const untestedEncounters = state.encounters.filter(enc => {
        if (!isMeaningfulPostTestExposure(enc)) return false;

        // Check if any test covers this encounter
        const encounterDate = new Date(enc.date);
        const localEncounterDate = new Date(encounterDate.getFullYear(), encounterDate.getMonth(), encounterDate.getDate());
        
        for (const [testType, test] of Object.entries(latestTests)) {
            if (!test) continue;
            
            const testDate = new Date(test.date);
            const localTestDate = new Date(testDate.getFullYear(), testDate.getMonth(), testDate.getDate());
            
            // If test was done after encounter and within the testing window
            if (localTestDate >= localEncounterDate) {
                const daysBetween = Math.floor((localTestDate - localEncounterDate) / (1000 * 60 * 60 * 24));
                const windowDays = WHO_TESTING_WINDOWS[testType] || 42;
                
                if (daysBetween >= windowDays && isResolvedTestResult(test.result)) {
                    // This encounter was adequately tested
                    return false;
                }
            }
        }
        
        // Check if encounter is too old to matter (beyond testing windows)
        const daysSinceEncounter = Math.floor((now - encounterDate) / (1000 * 60 * 60 * 24));
        return daysSinceEncounter <= 84; // Hep C window is longest at 12 weeks
    });
    
    if (untestedEncounters.length === 0) return null;
    
    // Return the earliest untested encounter
    return untestedEncounters
        .map(enc => new Date(enc.date))
        .sort((a, b) => a - b)[0];
}

function isResolvedTestResult(result) {
    return ['negative', 'treated'].includes(result);
}

// WHO-aligned testing windows (in days) - global for shared access
const WHO_TESTING_WINDOWS = {
    'hiv': 42, // 6 weeks for 4th gen, up to 12 weeks for rapid
    'gonorrhea': 7, // 2-7 days
    'chlamydia': 7, // 2-7 days  
    'syphilis': 42, // 3-6 weeks
    'hep_b': 84, // 4-12 weeks
    'hep_c': 84, // 12 weeks for antibody tests per current WHO guidance (was 180 days)
    'mpox': 21 // symptom onset window
};

function getFollowUpItemLabel(testType, context = 'exposure') {
    if (context === 'baseline' && testType === 'hep_b_screen_discussion') {
        return 'Hep B screening discussion';
    }
    if (context === 'routine' && testType === 'hiv') {
        return 'HIV routine screening';
    }
    return TEST_TYPE_LABELS[testType] || testType;
}

function getTestingTimingAdvice(recommendedTests, latestEncounterDate) {
    if (!recommendedTests.length || !latestEncounterDate) return [];
    
    // Use user's local timezone
    const now = new Date();
    const localNow = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());
    const localExposureDate = new Date(latestEncounterDate.getFullYear(), latestEncounterDate.getMonth(), latestEncounterDate.getDate(), latestEncounterDate.getHours(), latestEncounterDate.getMinutes());
    
    // Calculate days using local timezone
    const daysSinceExposure = Math.floor((localNow - localExposureDate) / (1000 * 60 * 60 * 24));
    
    const timingInfo = recommendedTests.map(testType => {
        const windowDays = WHO_TESTING_WINDOWS[testType] || 42;
        const optimalTestDate = new Date(localExposureDate);
        optimalTestDate.setDate(optimalTestDate.getDate() + windowDays);
        
        const daysUntilOptimal = Math.floor((optimalTestDate - localNow) / (1000 * 60 * 60 * 24));
        
        let timingText = '';
        if (daysSinceExposure < windowDays) {
            if (daysUntilOptimal > 0) {
                timingText = `${getFollowUpItemLabel(testType)} in <strong>${daysUntilOptimal} days</strong> (${optimalTestDate.toLocaleDateString()}) for optimal detection.`;
            } else if (daysUntilOptimal === 0) {
                timingText = `${getFollowUpItemLabel(testType)} <strong>today</strong> for optimal detection.`;
            } else {
                timingText = `${getFollowUpItemLabel(testType)} as soon as possible (optimal window was ${Math.abs(daysUntilOptimal)} days ago).`;
            }
        } else {
            timingText = `${getFollowUpItemLabel(testType)} testing window has passed; test as soon as possible if not already done.`;
        }
        
        return timingText;
    });
    
    return timingInfo;
}

function getRecommendedFollowUpTests() {
    const recommendations = {
        exposure: [],
        routine: [],
        baseline: []
    };
    const latestTests = getLatestTestsByType();
    const latestEncounterDate = getLatestEncounterDate();
    const latestMeaningfulEncounterDate = getLatestMeaningfulEncounterDate();
    const sexualExposure = hasSexualExposure();
    const needleExposure = hasNeedleExposure();
    const meaningfulExposureEncounters = state.encounters.filter(enc => isMeaningfulPostTestExposure(enc));
    
    const uGender = state.profile.gender || 'cis_male';
    const effectiveHasSexWith = getEffectiveHasSexWith();
    const isUserInKeyNetwork = effectiveHasSexWith.some(pg => isKeyPopulationEncounter(uGender, pg)) || uGender.startsWith('trans_');

    // WHO: Elevated risk factors for more frequent screening (3-6 months)
    const hasElevatedRisk = state.profile.onPrep || 
                            state.profile.onPep || 
                            state.profile.sti ||
                            state.profile.newPartners ||
                            state.profile.sexWorker ||
                            (latestTests.hiv?.result === 'positive');
    
    // Check if test is due based on screening interval
    const isTestDue = (type, intervalDays) => {
        const test = latestTests[type];
        if (!test) return true;
        if (['pending', 'inconclusive'].includes(test.result)) return true;
        
        const daysSinceTest = Math.floor((new Date() - new Date(test.date)) / (1000 * 60 * 60 * 24));
        return daysSinceTest >= intervalDays;
    };

    const shouldRetestAfterEncounter = (type) => {
        const test = latestTests[type];
        if (!test) return true;
        if (['pending', 'inconclusive'].includes(test.result)) return true;
        if (!isResolvedTestResult(test.result) && test.result !== 'positive') return true;
        if (!latestMeaningfulEncounterDate) return false;
        
        // WHO-aligned: check if test was done within appropriate window after latest exposure
        const now = new Date();
        const testDate = new Date(test.date);
        const localNow = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());
        const localTestDate = new Date(testDate.getFullYear(), testDate.getMonth(), testDate.getDate(), testDate.getHours(), testDate.getMinutes());
        const localLatestEncounter = new Date(latestMeaningfulEncounterDate.getFullYear(), latestMeaningfulEncounterDate.getMonth(), latestMeaningfulEncounterDate.getDate(), latestMeaningfulEncounterDate.getHours(), latestMeaningfulEncounterDate.getMinutes());
        
        const daysSinceTest = Math.floor((localNow - localTestDate) / (1000 * 60 * 60 * 24));
        const daysSinceLatestEncounter = Math.floor((localNow - localLatestEncounter) / (1000 * 60 * 60 * 24));
        
        // If test was done before latest encounter, check if window clearance applies
        // Window clearance: if all post-test encounters are with confirmed-negative/U=U partners,
        // the negative test already covers them - no new test needed
        if (localTestDate < localLatestEncounter) {
            const postTestEncounters = getMeaningfulPostTestEncounters(localTestDate, state.encounters);
            const allCoveredByNegativeStatus = postTestEncounters.every(enc =>
                enc.partnerStatus === 'negative' || enc.partnerStatus === 'positive_undetectable'
            );
            if (allCoveredByNegativeStatus) return false;
            return true;
        }
        
        // If test was done too early after exposure, may need repeat test
        const windowDays = WHO_TESTING_WINDOWS[type] || 42;
        if (daysSinceLatestEncounter < windowDays && daysSinceTest >= windowDays) {
            return false; // Tested appropriately after window period
        }
        
        return daysSinceTest < windowDays; // Still within testing window
    };

    // Check if all recent encounters were with confirmed HIV-negative partners
    const allRecentEncountersHivNegative = meaningfulExposureEncounters.every(enc => 
        enc.partnerStatus === 'negative' || enc.partnerStatus === 'positive_undetectable'
    );
    
    // HIV screening intervals: annual for key populations, 3-6 months for elevated risk
    // Key populations: MSM, trans women, sex workers, PWID
    const isMSM = isUserInMSMNetwork(uGender, effectiveHasSexWith);
    const isTransWoman = uGender === 'trans_female';
    const isSexWorker = state.profile.sexWorker;
    const isPWID = state.profile.pwid;
    const isKeyPopulation = isMSM || isTransWoman || isSexWorker || isPWID;
    const pushUnique = (bucket, value) => {
        if (!recommendations[bucket].includes(value)) {
            recommendations[bucket].push(value);
        }
    };
    
    const hasMeaningfulSexualExposure = meaningfulExposureEncounters.some(enc => enc.actType !== 'shared_needles');
    const hasMeaningfulAnalExposure = meaningfulExposureEncounters.some(enc => isAnalAct(enc.actType));

    // HIV testing logic with screening intervals for key populations
    if (isKeyPopulation) {
        // Key populations: annual screening, 3-6 months if elevated risk
        const screeningInterval = hasElevatedRisk ? 180 : 365; // 6 months or 1 year
        if (isTestDue('hiv', screeningInterval)) {
            pushUnique('routine', 'hiv');
        }
    }

    // Exposure-triggered HIV retest should apply to all users (including key populations),
    // not only non-key populations.
    if (!allRecentEncountersHivNegative && hasMeaningfulSexualExposure && shouldRetestAfterEncounter('hiv')) {
        pushUnique('exposure', 'hiv');
    } else if (!allRecentEncountersHivNegative) {
        const latestHiv = latestTests.hiv;
        if (latestHiv?.result === 'negative') {
            const cutoff = new Date(latestHiv.date);
            cutoff.setDate(cutoff.getDate() - 30);
            const hasWindowExposure = meaningfulExposureEncounters.some(enc => {
                const encDate = new Date(enc.date);
                return encDate >= cutoff && encDate <= new Date(latestHiv.date);
            });
            if (hasWindowExposure) {
                pushUnique('exposure', 'hiv');
            }
        }
    }

    const shouldRunRoutineStiLogic = sexualExposure || isMSM || isSexWorker || state.profile.newPartners || state.profile.onPrep;
    if (shouldRunRoutineStiLogic) {
        // WHO (July 2025): Gonorrhea/chlamydia screening for MSM, sex workers
        // WHO recommends at least annual or 6-monthly screening for sex workers and MSM
        const stisToRecommend = [];
        
        // MSM and sex workers get regular STI screening per WHO
        if (isMSM || isSexWorker) {
            const stis = ['gonorrhea', 'chlamydia'];
            stis.forEach(type => {
                const screeningInterval = hasElevatedRisk ? 180 : 365; // 6 months or 1 year
                if (isTestDue(type, screeningInterval)) {
                    if (!stisToRecommend.includes(type)) stisToRecommend.push(type);
                }
            });
        }
        
        // Also check for high-risk encounters that warrant immediate testing
        const hasHighRiskEncounters = state.encounters.some(enc => isMeaningfulPostTestExposure(enc));
        
        if (hasHighRiskEncounters) {
            ['gonorrhea', 'chlamydia'].forEach(type => {
                if (shouldRetestAfterEncounter(type) && !stisToRecommend.includes(type)) {
                    stisToRecommend.push(type);
                }
            });
        }
        
        stisToRecommend.forEach(type => {
            if ((isMSM || isSexWorker) && isTestDue(type, hasElevatedRisk ? 180 : 365)) {
                pushUnique('routine', type);
            } else {
                pushUnique('exposure', type);
            }
        });

        // Ensure anal exposure follow-up is not suppressed by routine scheduling cadence.
        if (hasMeaningfulAnalExposure) {
            ['gonorrhea', 'chlamydia'].forEach(type => {
                if (shouldRetestAfterEncounter(type)) {
                    pushUnique('exposure', type);
                }
            });
        }
        
        // WHO (July 2025): Syphilis screening - annual for MSM/sex workers, 3-6 months if elevated risk
        // Also recommend for high-risk encounters
        const syphilisDueForScreening = (isMSM || isSexWorker) && isTestDue('syphilis', hasElevatedRisk ? 180 : 365);
        const shouldRecommendSyphilis = syphilisDueForScreening ||
            state.encounters.some(enc => isMeaningfulPostTestExposure(enc) || hasPartnerStiRisk(enc)) ||
            state.profile.newPartners;
        
        if (shouldRecommendSyphilis && shouldRetestAfterEncounter('syphilis')) {
            if (syphilisDueForScreening && !state.encounters.some(enc => isMeaningfulPostTestExposure(enc) || hasPartnerStiRisk(enc))) {
                pushUnique('routine', 'syphilis');
            } else {
                pushUnique('exposure', 'syphilis');
            }
        }
    }

    if (sexualExposure || needleExposure) {
        const isHighRisk = state.profile.pwid || state.profile.newPartners || isUserInKeyNetwork;
        const hasHigherRiskSexualContext = hasHigherRiskSexualExposure(state.encounters);
        
        // Hep B screening - more targeted approach to reduce overkill
        const hasUnprotectedSexWithRisk = state.encounters.some(enc =>
            isPenetrativeAct(enc.actType) &&
            enc.condomUse !== 'yes' &&
            hasHigherRiskPartnerContext(enc)
        );
        const latestHepB = latestTests.hep_b;

        // WHO-aligned: prompt Hep B testing for actual exposure risk, not simply for being in a network.
        const needsHepBTesting = needleExposure ||
                                 hasUnprotectedSexWithRisk ||
                                 (!state.profile.hepBVaccinated &&
                                  !latestHepB &&
                                  (state.profile.pwid || (state.profile.newPartners && hasHigherRiskSexualContext)));
        
        if (needsHepBTesting) {
            pushUnique('exposure', 'hep_b');
        } else if (isHighRisk && !state.profile.hepBVaccinated) {
            // Keep baseline suggestions out of the follow-up list unless there is actual higher-risk history.
            if (hasHigherRiskSexualContext && !latestHepB) {
                pushUnique('baseline', 'hep_b_screen_discussion');
            }
        }

        // Hep C for PWID and for anal sex with meaningful partner/exposure risk.
        const hasAnalSexWithRisk = state.encounters.some(enc => {
            const hasPartnerRisk = hasHigherRiskPartnerContext(enc);
            const noCondom = enc.condomUse !== 'yes';
            return isAnalAct(enc.actType) && hasPartnerRisk && noCondom;
        });
        
        if (state.profile.pwid && isTestDue('hep_c', hasElevatedRisk ? 180 : 365)) {
            pushUnique('routine', 'hep_c');
        }

        if (state.profile.pwid || hasAnalSexWithRisk) {
            if (shouldRetestAfterEncounter('hep_c')) {
                pushUnique('exposure', 'hep_c');
            }
        }

        if (needleExposure) {
            if (shouldRetestAfterEncounter('hep_c')) {
                pushUnique('exposure', 'hep_c');
            }
        }

        // Mpox — PCR only if symptomatic AND recent skin-to-skin exposure AND unvaccinated
        // WHO mpox testing is symptom-driven. Without symptom tracking, avoid automated PCR prompts.
    }

    return recommendations;
}

function populateTestResultOptions() {
    const type = testTypeSelect.value;
    const options = TEST_RESULT_OPTIONS[type] || [];
    testResultSelect.innerHTML = options
        .map(option => `<option value="${option.value}">${option.label}</option>`)
        .join('');

    if (type === 'hiv') {
        testResultHelp.textContent = 'Use this for HIV-specific results so the dashboard can react to negative, positive, pending, or inconclusive outcomes.';
    } else if (STI_TEST_TYPES.includes(type)) {
        testResultHelp.textContent = `Log ${TEST_TYPE_LABELS[type]} separately so the app can track follow-up, treatment, and routine screening based on the actual infection involved.`;
    } else if (type === 'mpox') {
        testResultHelp.textContent = 'Log mpox PCR results here. Note: Mpox symptoms typically appear 5-21 days after exposure. Testing before symptom onset (rash, lesions, fever) is unreliable — a negative early test does not rule out infection. If exposed, monitor for symptoms during this period.';
    } else {
        testResultHelp.textContent = `Log ${TEST_TYPE_LABELS[type]} results separately so the app can reflect hepatitis follow-up without mixing it into HIV or bacterial STI guidance.`;
    }
}

function renderTestingUI() {
    const latestTests = getLatestTestsByType();
    const latestEncounterDate = getLatestEncounterDate();
    latestHivTestDisplay.textContent = formatTestSummary(latestTests.hiv) || 'No result logged';
    latestGonorrheaDisplay.textContent = formatTestSummary(latestTests.gonorrhea) || 'No result logged';
    latestChlamydiaDisplay.textContent = formatTestSummary(latestTests.chlamydia) || 'No result logged';
    latestSyphilisDisplay.textContent = formatTestSummary(latestTests.syphilis) || 'No result logged';
    latestHepBDisplay.textContent = formatTestSummary(latestTests.hep_b) || (state.profile.hepBVaccinated ? 'Vaccinated' : 'No result logged');
    latestHepCDisplay.textContent = formatTestSummary(latestTests.hep_c) || 'No result logged';
    latestMpoxDisplay.textContent = formatTestSummary(latestTests.mpox) || (state.profile.mpoxVaccinated ? 'Vaccinated' : 'No result logged');

    const sortedTests = sortTestsDescending(state.tests);
    btnClearTestHistory.style.display = sortedTests.length ? 'inline-flex' : 'none';

    if (!sortedTests.length) {
        testHistoryList.innerHTML = '<div class="empty-state">No test results logged yet.</div>';
        return;
    }

    testHistoryList.innerHTML = '';
    sortedTests.forEach(test => {
        const item = document.createElement('div');
        item.className = 'encounter-item';

        const dateStr = new Date(test.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        item.innerHTML = `
            <div class="encounter-header">
                <div class="encounter-header-left">
                    <span class="encounter-date">${dateStr}</span>
                    <span class="encounter-risk-badge badge-low">${TEST_TYPE_LABELS[test.type]}</span>
                </div>
                <div class="encounter-actions">
                    <button class="delete-btn" data-id="${test.id}" title="Delete Test Result">
                        <span class="material-symbols-rounded">delete</span>
                    </button>
                </div>
            </div>
            <div class="encounter-details">${TEST_RESULT_LABELS[test.result] || test.result}</div>
        `;

        const deleteBtn = item.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => {
            if (confirm('Delete this test result?')) {
                state.tests = state.tests.filter(entry => String(entry.id) !== String(test.id));
                saveState();
            }
        });

        testHistoryList.appendChild(item);
    });
}

function toggleCircumcisionVisibility() {
    if (userGender.value === 'cis_male') {
        circumcisionGroup.style.display = 'flex';
    } else {
        circumcisionGroup.style.display = 'none';
        state.profile.circumcised = false;
        if(userCircumcised) userCircumcised.checked = false;
    }
}

function getEncounterPartnerGenders(encounters = state.encounters) {
    return (encounters || [])
        .map(enc => enc && enc.partnerGender)
        .filter(Boolean);
}

function getEffectiveHasSexWith(profile = state.profile, encounters = state.encounters) {
    const profileHasSexWith = profile?.hasSexWith || [];
    const encounterPartnerGenders = getEncounterPartnerGenders(encounters);
    return [...new Set([...profileHasSexWith, ...encounterPartnerGenders])];
}

function isUserInMSMNetwork(uGender, effectiveHasSexWith = getEffectiveHasSexWith()) {
    const isUserMale = ['cis_male', 'trans_male'].includes(uGender);
    const isUserNonBinary = uGender === 'non_binary';
    const hasMalePartners = effectiveHasSexWith.some(p => ['cis_male', 'trans_male'].includes(p));

    // Keep MSM classification behavior-based while avoiding NB+NB overreach.
    if (isUserMale) return hasMalePartners;
    if (isUserNonBinary) return hasMalePartners;
    return false;
}

function isPenetrativeAct(actType) {
    return ['receptive_anal', 'insertive_anal', 'receptive_vaginal', 'insertive_vaginal'].includes(actType);
}

function isAnalAct(actType) {
    return ['receptive_anal', 'insertive_anal'].includes(actType);
}

function isPartnerHivCovered(enc) {
    return !!enc && (enc.partnerStatus === 'negative' || enc.partnerStatus === 'positive_undetectable');
}

function hasPartnerStiRisk(enc) {
    return !!enc && enc.partnerSti === 'yes';
}

function hasHigherRiskPartnerContext(enc) {
    return !!enc && (!isPartnerHivCovered(enc) || hasPartnerStiRisk(enc));
}

function hasHigherRiskSexualExposure(encounters = state.encounters) {
    return (encounters || []).some(enc =>
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

    // Protected vaginal/anal sex with a partner of unknown status is not enough on its own
    // to force enhanced follow-up in this app's WHO-aligned guidance layer.
    if (enc.condomUse === 'yes' && !hasPartnerStiRisk(enc)) return false;

    return true;
}

function getMeaningfulPostTestEncounters(testDate, encounters = state.encounters) {
    if (!testDate) return (encounters || []).filter(isMeaningfulPostTestExposure);

    const cutoff = new Date(testDate);
    return (encounters || []).filter(enc =>
        new Date(enc.date) > cutoff && isMeaningfulPostTestExposure(enc)
    );
}

function hasRecentIntimateExposure(encounters = state.encounters, days = 21) {
    const now = new Date();
    return (encounters || []).some(enc => {
        if (enc.actType === 'shared_needles') return false;
        const daysSince = Math.floor((now - new Date(enc.date)) / (1000 * 60 * 60 * 24));
        return daysSince <= days;
    });
}

function hasOnlyRegularCoveredPartnerPattern(encounters = state.encounters) {
    const regularEncounters = (encounters || []).filter(enc => enc && enc.isRegularPartner);
    if (!regularEncounters.length) return false;

    return regularEncounters.every(enc =>
        (enc.partnerStatus === 'negative' || enc.partnerStatus === 'positive_undetectable') &&
        enc.partnerSti !== 'yes'
    );
}

/**
 * WHO Clinical Logic: Determines if an encounter involves a High-Prevalence Network (Key Population)
 */
function isKeyPopulationEncounter(uGender, pGender) {
    if (!uGender || !pGender) return false;
    
    // Keep this behavior-first and avoid identity-only escalation:
    // classify known higher-prevalence sexual networks, not all trans interactions.
    const isUserMale = ['cis_male', 'trans_male'].includes(uGender);
    const isUserNonBinary = uGender === 'non_binary';
    const isPartnerMale = ['cis_male', 'trans_male'].includes(pGender);
    const isUserTransWoman = uGender === 'trans_female';
    const isPartnerTransWoman = pGender === 'trans_female';

    // MSM-adjacent networks (including non-binary people in male sexual networks)
    if ((isUserMale || isUserNonBinary) && (isPartnerMale || isPartnerTransWoman)) return true;

    // Trans women in sexual networks where prevalence is often elevated
    if (isUserTransWoman && (isPartnerMale || isPartnerTransWoman)) return true;

    return false;
}

/**
 * WHO-aligned PEP Eligibility Classification
 * Returns PEP recommendation status for a single encounter
 */
function classifyPEPEligibility(enc) {
    const now = new Date();
    const encDate = new Date(enc.date);
    const diffHours = (now - encDate) / (1000 * 60 * 60);

    // Only consider exposures within 72-hour PEP window
    if (diffHours > 72) {
        return { shouldRecommendPEP: false, isWithinWindow: false, reason: null };
    }

    // Only recommend PEP when there's actual biological HIV risk
    const hasHivRisk = enc.partnerStatus !== 'negative' && enc.partnerStatus !== 'positive_undetectable';
    if (!hasHivRisk) {
        return { shouldRecommendPEP: false, isWithinWindow: true, reason: null };
    }

    // WHO-aligned: do not recommend PEP for negligible/very low-risk exposure routes.
    // Keep guidance proportional and avoid over-medicalizing oral/non-penetrative contact.
    if (enc.actType === 'receiving_oral' || enc.actType === 'giving_oral' || enc.actType === 'other') {
        return { shouldRecommendPEP: false, isWithinWindow: true, reason: null };
    }

    // Prevent over-medicalization for anatomically implausible cis-only combinations
    // if a user chooses to save after the warning prompt.
    const userGender = state.profile.gender || 'cis_male';
    const isImplausibleCisCombination =
        (userGender === 'cis_male' && enc.actType === 'receptive_vaginal') ||
        (userGender === 'cis_female' && enc.actType === 'insertive_vaginal');
    if (isImplausibleCisCombination) {
        return { shouldRecommendPEP: false, isWithinWindow: true, reason: null };
    }

    // Consider biological reality for PEP recommendations
    const isPartnerMale = (enc.partnerGender === 'cis_male' || enc.partnerGender === 'trans_male');
    const isPartnerCisFemale = enc.partnerGender === 'cis_female';
    const isPartnerTransFemale = enc.partnerGender === 'trans_female';

    // No biological HIV risk scenarios:
    // 1. Receptive anal with cis female partner (pegging) - no biological exposure
    // 2. Receptive vaginal with cis female partner - user is insertive male, no receptive exposure
    // Note: Trans women are NOT excluded - surgical status varies, so we include them
    // as having biological risk to avoid suppressing potentially warranted PEP recommendations
    const hasBiologicalRisk = !((enc.actType === 'receptive_anal' && isPartnerCisFemale) ||
                               (enc.actType === 'receptive_vaginal' && isPartnerCisFemale));

    if (!hasBiologicalRisk) {
        return { shouldRecommendPEP: false, isWithinWindow: true, reason: null };
    }

    // High-risk exposures: receptive anal or shared needles
    const isHighRiskExposure = (enc.actType === 'receptive_anal' || enc.actType === 'shared_needles');

    // Known positive partner: prioritize substantial-risk exposure routes
    const isKnownPositivePartnerHighConcern =
        enc.partnerStatus === 'positive_detectable' &&
        (enc.actType === 'shared_needles' || enc.actType === 'receptive_anal' || enc.condomUse !== 'yes');

    // Moderate-risk exposures with additional risk factors
    // Note: Uses PARTNER's STI status and condom use, NOT user's own STI status (WHO aligned)
    // Issue A fix: Added insertive_vaginal — unprotected insertive vaginal with unknown status is WHO PEP-eligible
    const isModerateRiskWithFactors = (enc.actType === 'receptive_vaginal' || enc.actType === 'insertive_anal' || enc.actType === 'insertive_vaginal') &&
                                        (enc.partnerSti === 'yes' ||
                                         enc.condomUse !== 'yes');

    if (isHighRiskExposure) {
        return { shouldRecommendPEP: true, isWithinWindow: true, reason: 'high-risk exposure' };
    } else if (isKnownPositivePartnerHighConcern) {
        return { shouldRecommendPEP: true, isWithinWindow: true, reason: 'exposure to HIV-positive partner' };
    } else if (isModerateRiskWithFactors) {
        return { shouldRecommendPEP: true, isWithinWindow: true, reason: 'moderate-risk exposure with additional risk factors' };
    }

    return { shouldRecommendPEP: false, isWithinWindow: true, reason: null };
}

/**
 * Evaluates the user's static profile against WHO "Key Population" and high-risk criteria
 */
function getProfileRiskFactors() {
    const factors = [];
    const uGender = state.profile.gender;
    const effectiveHasSexWith = getEffectiveHasSexWith();

    // 1. MSM-adjacent sexual networks per WHO key population framing
    const isMSM = isUserInMSMNetwork(uGender, effectiveHasSexWith);
    
    // 2. Transgender women are a WHO key population in many settings
    const isTransWoman = (uGender === 'trans_female');

    // Avoid over-medicalizing: only count substantial heterosexual exposure patterns,
    // not every unknown-status partner by default.
    const isHeterosexualWomanAtRisk = (uGender === 'cis_female') &&
                                      state.encounters &&
                                      state.encounters.some(enc =>
                                          ['cis_male', 'trans_male'].includes(enc.partnerGender) &&
                                          isPenetrativeAct(enc.actType) &&
                                          enc.partnerStatus !== 'negative' &&
                                          enc.partnerStatus !== 'positive_undetectable' &&
                                          enc.condomUse !== 'yes'
                                      );

    if (isMSM) factors.push('msm');
    if (isTransWoman) factors.push('trans_woman');
    if (isHeterosexualWomanAtRisk) factors.push('heterosexual_woman_at_risk');
    if (state.profile.pwid) factors.push('pwid');
    if (state.profile.sti) factors.push('active_sti');
    if (state.profile.newPartners) factors.push('new_partners');
    
    return factors;
}

function refreshApp() {
    syncVirginState();
    updateDashboard();
    renderEncounters();
    updateGuidance();
    renderTestingUI();
    updateVirginControl();

    if(typeof updateDropdownText === 'function') updateDropdownText();
}

function openNewEncounterModal() {
    editingEncounterId = null;
    document.getElementById('modal-title').textContent = "Log Encounter";
    document.getElementById('btn-submit-encounter').textContent = "Save Encounter";
    encounterForm.reset();

    const today = new Date().toISOString().split('T')[0];
    encounterDateInput.value = today;

    encounterModal.classList.add('active');
}

function handleLaunchActions() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'new-encounter') {
        openNewEncounterModal();
    }
}

function loadState() {
    console.log('loadState() called');
    const saved = localStorage.getItem('hivRiskState');
    if (saved) {
        try {
            state = JSON.parse(saved);
        } catch (e) {
            console.error('Failed to parse saved state, resetting to defaults:', e);
            // Reset to default state if parsing fails
            state = {
                profile: {
                    gender: 'cis_male',
                    hasSexWith: [],
                    role: 'versatile',
                    onPrep: false,
                    onPep: false,
                    pepStartDate: null,
                    hepBVaccinated: false,
                    circumcised: false,
                    sti: false,
                    newPartners: false,
                    pwid: false,
                    isVirgin: true
                },
                encounters: [],
                tests: [],
                settings: {
                    remindersEnabled: false,
                    lastReminderDate: null
                }
            };
        }
    }

    ensureStateShape();
    migrateLegacyState();
    syncVirginState();
    
    // Populate form fields
    userGender.value = state.profile.gender || 'cis_male';
    if (!state.profile.hasSexWith) state.profile.hasSexWith = [];
    userHasSexWithCheckboxes.forEach(cb => {
        cb.checked = state.profile.hasSexWith.includes(cb.value);
    });
    userRole.value = state.profile.role || 'versatile';
    userPrep.checked = state.profile.onPrep || false;
    userPep.checked = state.profile.onPep || false;
    userPepStart.value = state.profile.pepStartDate || '';
    pepDateGroup.style.display = userPep.checked ? 'block' : 'none';
    
    // PrEP type selector
    // Issue C fix: On-demand PrEP (2-1-1) is only validated for MSM per WHO 2022 guidance
    const prepTypeGroup = document.getElementById('prep-type-group');
    const prepTypeSelect = document.getElementById('prep-type');
    const prepTypeHelp = document.getElementById('prep-type-help');
    
    // Check if user is MSM (men who have sex with men)
    const uGender = state.profile.gender;
    const isMSM = isUserInMSMNetwork(uGender, getEffectiveHasSexWith());
    
    // Force non-MSM users to daily PrEP (on-demand only validated for MSM)
    if (!isMSM && state.profile.prepType === 'on_demand') {
        state.profile.prepType = 'daily';
        if (prepTypeSelect) prepTypeSelect.value = 'daily';
    }
    
    // Hide on-demand option for non-MSM users
    if (prepTypeSelect && !isMSM) {
        const onDemandOption = prepTypeSelect.querySelector('option[value="on_demand"]');
        if (onDemandOption) onDemandOption.style.display = 'none';
    }
    
    if (prepTypeGroup) prepTypeGroup.style.display = userPrep.checked ? 'block' : 'none';
    if (prepTypeSelect) prepTypeSelect.value = state.profile.prepType || 'daily';
    if (prepTypeHelp) {
        prepTypeHelp.textContent = state.profile.prepType === 'on_demand' 
            ? 'On-demand (2-1-1): Take 2 pills 2-24 hours BEFORE sex, 1 pill 24 hours after, and 1 pill 24 hours later. Protection ONLY achieved with correct pre-exposure dosing. If you missed the pre-exposure doses, protection may be reduced.'
            : 'Daily PrEP provides continuous protection when taken consistently.';
    }
    userHepBVax.checked = state.profile.hepBVaccinated || false;
    userMpoxVax.checked = state.profile.mpoxVaccinated || false;
    userHpvVax.checked = state.profile.hpvVaccinated || false;
    userCircumcised.checked = state.profile.circumcised || false;
    userSti.checked = state.profile.sti || false;
    userNewPartners.checked = state.profile.newPartners || false;
    userPwid.checked = state.profile.pwid || false;
    userVirgin.checked = state.profile.isVirgin !== undefined ? state.profile.isVirgin : true;
    updateVirginControl();
    logTestDateInput.value = new Date().toISOString().split('T')[0];
    populateTestResultOptions();

    settingReminders.checked = state.settings.remindersEnabled || false;
    updateReminderUI();
}

function saveState() {
    syncVirginState();
    localStorage.setItem('hivRiskState', JSON.stringify(state));
    refreshApp();
}

function syncVirginState() {
    if (hasSexualExposure(state.encounters)) {
        state.profile.isVirgin = false;
    }
}

function updateVirginControl() {
    const hasRecordedSexualHistory = hasSexualExposure(state.encounters);
    userVirgin.disabled = hasRecordedSexualHistory;

    if (hasRecordedSexualHistory) {
        userVirgin.checked = false;
    } else {
        userVirgin.checked = state.profile.isVirgin !== undefined ? state.profile.isVirgin : true;
    }
}

function setupEventListeners() {
    // Tabs
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });

    // Profile Changes
    userGender.addEventListener('change', (e) => { state.profile.gender = e.target.value; toggleCircumcisionVisibility(); recalculateRiskHistory(); saveState(); });
    userRole.addEventListener('change', (e) => { state.profile.role = e.target.value; recalculateRiskHistory(); saveState(); });
    userPrep.addEventListener('change', (e) => {
        state.profile.onPrep = e.target.checked;
        const prepTypeGroup = document.getElementById('prep-type-group');
        if (e.target.checked) {
            if (userPep.checked) {
                showToast('PrEP and PEP cannot be active at the same time. PEP has been turned off.');
            }
            state.profile.onPep = false;
            userPep.checked = false;
            pepDateGroup.style.display = 'none';
            prepTypeGroup.style.display = 'block';
        } else {
            prepTypeGroup.style.display = 'none';
        }
        recalculateRiskHistory();
        saveState();
    });
    
    // PrEP type selector
    const prepTypeSelect = document.getElementById('prep-type');
    const prepTypeHelp = document.getElementById('prep-type-help');
    if (prepTypeSelect) {
        prepTypeSelect.addEventListener('change', (e) => {
            state.profile.prepType = e.target.value;
            if (prepTypeHelp) {
                prepTypeHelp.textContent = e.target.value === 'on_demand' 
                    ? 'On-demand (2-1-1): Take 2 pills 2-24 hours before sex, 1 pill 24 hours after, and 1 pill 24 hours later. Effective for MSM when taken correctly.'
                    : 'Daily PrEP provides continuous protection when taken consistently.';
            }
            saveState();
        });
    }
    userPep.addEventListener('change', (e) => {
        state.profile.onPep = e.target.checked;
        const prepTypeGroup = document.getElementById('prep-type-group');
        if (e.target.checked) {
            if (userPrep.checked) {
                showToast('PrEP and PEP cannot be active at the same time. PrEP has been turned off.');
            }
            state.profile.onPrep = false;
            userPrep.checked = false;
            prepTypeGroup.style.display = 'none';
            pepDateGroup.style.display = 'block';
            if (!state.profile.pepStartDate) {
                const today = new Date().toISOString().split('T')[0];
                state.profile.pepStartDate = today;
                userPepStart.value = today;
            }
        } else {
            pepDateGroup.style.display = 'none';
        }
        saveState();
    });
    userPepStart.addEventListener('change', (e) => {
        state.profile.pepStartDate = e.target.value;
        saveState();
    });
    userHepBVax.addEventListener('change', (e) => { state.profile.hepBVaccinated = e.target.checked; saveState(); });
    userMpoxVax.addEventListener('change', (e) => { state.profile.mpoxVaccinated = e.target.checked; saveState(); });
    userHpvVax.addEventListener('change', (e) => { state.profile.hpvVaccinated = e.target.checked; saveState(); });
    userCircumcised.addEventListener('change', (e) => { state.profile.circumcised = e.target.checked; recalculateRiskHistory(); saveState(); });
    userSti.addEventListener('change', (e) => { state.profile.sti = e.target.checked; recalculateRiskHistory(); saveState(); });
    userNewPartners.addEventListener('change', (e) => { state.profile.newPartners = e.target.checked; saveState(); });
    userPwid.addEventListener('change', (e) => { state.profile.pwid = e.target.checked; recalculateRiskHistory(); saveState(); });
    userVirgin.addEventListener('change', (e) => { state.profile.isVirgin = e.target.checked; refreshApp(); saveState(); });
    const userSexWorker = document.getElementById('user-sex-worker');
    if (userSexWorker) {
        userSexWorker.addEventListener('change', (e) => { state.profile.sexWorker = e.target.checked; saveState(); });
    }

    userHasSexWithCheckboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            state.profile.hasSexWith = Array.from(userHasSexWithCheckboxes)
                .filter(c => c.checked)
                .map(c => c.value);
            updateDropdownText();
            recalculateRiskHistory();
            saveState();
        });
    });

    // Custom Dropdown Checkboxes
    hasSexWithToggle.addEventListener('click', () => {
        userHasSexWithMenu.classList.toggle('active');
    });
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-dropdown')) {
            userHasSexWithMenu.classList.remove('active');
        }
    });

    // Testing history
    testTypeSelect.addEventListener('change', () => {
        populateTestResultOptions();
    });

    btnLogTest.addEventListener('click', () => {
        const testDate = logTestDateInput.value;
        const type = testTypeSelect.value;
        const result = testResultSelect.value;

        if (!testDate) {
            alert('Please select the date of the test result.');
            return;
        }

        // Validate test date is not in the future
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        const enteredDate = new Date(testDate);
        if (enteredDate > today) {
            alert('Test date cannot be in the future. Please select a valid date.');
            return;
        }

        if (!type || !result) {
            alert('Please select both a test type and a result.');
            return;
        }

        state.tests.unshift({
            id: Date.now(),
            type,
            result,
            date: new Date(testDate).toISOString()
        });

        // Auto-clear STI flag only when latest STI panel no longer shows active infection.
        if (STI_TEST_TYPES.includes(type) && ['treated', 'negative'].includes(result) && state.profile.sti) {
            const stiStillActive = hasAnyActiveStiInLatestResults(state.tests);
            if (!stiStillActive) {
                state.profile.sti = false;
                if (userSti) userSti.checked = false;
                alert(`${TEST_TYPE_LABELS[type]} result saved. Your "Active STI" profile flag has been cleared because your latest logged STI results no longer show an active infection.`);
            } else {
                alert(`${TEST_TYPE_LABELS[type]} result saved. "Active STI" remains enabled because another recent STI result is still active or unresolved.`);
            }
        } else {
            alert(`${TEST_TYPE_LABELS[type]} result saved.`);
        }

        saveState();
    });

    btnClearTestHistory.addEventListener('click', () => {
        if (confirm('Clear all logged test results? Encounter history will be kept.')) {
            state.tests = [];
            saveState();
        }
    });

    // Modal
    btnNewEncounter.addEventListener('click', () => { 
        openNewEncounterModal();
    });
    btnCloseModal.addEventListener('click', () => { encounterModal.classList.remove('active'); });
    window.addEventListener('click', (e) => {
        if (e.target == encounterModal) encounterModal.classList.remove('active');
    });

    // Settings listeners
    settingReminders.addEventListener('change', async (e) => {
        if (e.target.checked) {
            const granted = await requestNotificationPermission();
            if (!granted) {
                e.target.checked = false;
                return;
            }
        }
        state.settings.remindersEnabled = e.target.checked;
        saveState();
        updateReminderUI();
    });

    btnRequestNotifications.addEventListener('click', async () => {
        const granted = await requestNotificationPermission();
        if (granted) {
            await showAppNotification("HIV Risk Tracker", {
                body: "Notifications are now enabled and working!",
                tag: 'hiv-risk-tracker-test'
            });
            updateReminderUI();
        }
    });

    btnClearAllData.addEventListener('click', () => {
        if (confirm("CRITICAL: This will permanently delete all your health history and profiles from this device. Are you absolutely sure?")) {
            localStorage.clear();
            location.reload();
        }
    });
    
    // Export/Import listeners
    btnExportData.addEventListener('click', () => {
        exportData();
    });

    btnImportTrigger.addEventListener('click', () => {
        importFileInput.click();
    });

    importFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            importData(file);
        }
    });

    // Log Encounter
    encounterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const partnerStatus = document.getElementById('partner-status').value;
        const partnerGender = document.getElementById('partner-gender').value || 'cis_male';
        const actType = document.getElementById('act-type').value;
        const condomUse = document.getElementById('condom-use').value;
        const encounterDate = document.getElementById('encounter-date').value;
        
        // Validate date is not in the future
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        const enteredDate = new Date(encounterDate);
        if (enteredDate > today) {
            alert('Encounter date cannot be in the future. Please select a valid date.');
            return;
        }
        
        // Issue 13: Anatomical plausibility validation
        const userGender = state.profile.gender;
        const anatomicallyImplausible = (
            // Cis women cannot perform insertive vaginal sex
            (userGender === 'cis_female' && actType === 'insertive_vaginal') ||
            // Cis men cannot receive vaginal sex (they lack a vagina)
            (userGender === 'cis_male' && actType === 'receptive_vaginal')
        );
        
        if (anatomicallyImplausible) {
            const proceed = confirm(`Warning: You selected "${actType.replace('_', ' ')}" as a ${userGender === 'cis_female' ? 'cisgender woman' : 'cisgender man'}. This combination may not be anatomically accurate for your body type.\n\nPlease verify your selection is correct, or update your profile gender if needed.\n\nClick OK to proceed anyway, or Cancel to review your selection.`);
            if (!proceed) return;
        }
        
        const actualDate = encounterDate ? new Date(encounterDate).toISOString() : new Date().toISOString();

        const isRegularPartner = document.getElementById('is-regular-partner').checked;

        const encounter = {
            id: editingEncounterId || Date.now(),
            date: actualDate,
            partnerGender,
            partnerStatus,
            partnerSti: partnerSti.value,
            actType,
            condomUse,
            isRegularPartner,
            riskScore: calculateEncounterRisk(partnerStatus, partnerGender, partnerSti.value, actType, condomUse)
        };

        if (editingEncounterId) {
            const idx = state.encounters.findIndex(e => e.id === editingEncounterId);
            if (idx !== -1) state.encounters[idx] = encounter;
        } else {
            state.encounters.unshift(encounter);
        }

        // Auto-untoggle virgin status once sexual contact is logged
        state.profile.isVirgin = false;
        if (userVirgin) userVirgin.checked = false;

        saveState();
        encounterModal.classList.remove('active');
        encounterForm.reset();
        editingEncounterId = null;
    });

}

function recalculateRiskHistory() {
    if (!state.encounters) return;
    state.encounters = state.encounters.map(enc => {
        enc.riskScore = calculateEncounterRisk(enc.partnerStatus, enc.partnerGender || 'cis_male', enc.partnerSti || 'unknown', enc.actType, enc.condomUse);
        return enc;
    });
}

// Clinical Risk Logic (Aligned with WHO/CDC Guidance)
function calculateEncounterRisk(partnerStatus, partnerGender, partnerSti, actType, condomUse) {
    if (partnerStatus === 'positive_undetectable') return 0; // U=U
    
    // For negative HIV status, still calculate risk for other STIs and dashboard logic
    // but mark as HIV-negative for specific HIV testing recommendations
    const isHivNegativePartner = partnerStatus === 'negative';
    if (isHivNegativePartner && partnerSti !== 'yes') {
        // Confirmed negative partner without STI — no meaningful HIV transmission risk
        return 0;
    }

    // Use a categorical score for internal ranking (not for user display)
    // 0: Negligible, 1: Low, 2: Moderate, 3: High
    let riskCategory = 0;

    // Consider biological reality for HIV transmission risk
    const userGender = state.profile.gender || 'cis_male';
    const isUserMale = userGender === 'cis_male' || userGender === 'trans_male';
    const isUserFemale = userGender === 'cis_female' || userGender === 'trans_female';
    const isPartnerMale = partnerGender === 'cis_male' || partnerGender === 'trans_male';
    const isPartnerFemale = partnerGender === 'cis_female' || partnerGender === 'trans_female';

    // Keep implausible cis-only combinations from inflating guidance if saved.
    if (
        (userGender === 'cis_male' && actType === 'receptive_vaginal') ||
        (userGender === 'cis_female' && actType === 'insertive_vaginal')
    ) {
        return 0;
    }
    
    switch(actType) {
        case 'shared_needles':
            riskCategory = 3; // Always high risk
            break;
        case 'receptive_anal':
            // Receptive anal risk is primarily act-based; avoid excluding trans women.
            const isPartnerLikelyInsertive = isPartnerMale || partnerGender === 'trans_female';
            if (isPartnerLikelyInsertive || partnerStatus === 'positive_detectable') {
                riskCategory = 3;
            } else if (partnerStatus === 'unknown' && partnerGender !== 'cis_female') {
                riskCategory = 2;
            } else {
                riskCategory = 0; // No biological HIV risk (e.g., woman with strapon or unknown status female)
            }
            break;
        case 'insertive_anal':
            // Risk depends on receptive partner's status
            if (partnerStatus === 'positive_detectable' || partnerStatus === 'unknown') {
                riskCategory = 2;
            } else {
                riskCategory = 0.5; // Very low risk with negative partner
            }
            break;
        case 'receptive_vaginal':
            // Risk depends on insertive partner's status
            // The receptive (vaginal) partner faces higher per-act risk per WHO data
            if (isUserFemale && (partnerStatus === 'positive_detectable' || partnerStatus === 'unknown')) {
                riskCategory = 2; // Higher risk for female recipients (vaginal receptive)
            } else if (partnerStatus === 'positive_detectable' || partnerStatus === 'unknown') {
                riskCategory = 1; // Lower risk for non-female recipients
            } else {
                riskCategory = 0.5;
            }
            break;
        case 'insertive_vaginal':
            if (partnerStatus === 'positive_detectable' || partnerStatus === 'unknown') {
                riskCategory = 1;
            } else {
                riskCategory = 0.5;
            }
            break;
        case 'giving_oral':
            riskCategory = 0.5; // Low but non-zero risk
            break;
        case 'receiving_oral':
        default:
            riskCategory = 0; // Essentially no risk
            break;
    }

    // Condoms are highly effective but not 100% - UN/WHO aligned reduction
    if (condomUse === 'yes' && riskCategory > 0) {
        // WHO systematic reviews support ~70-75% reduction for anal/vaginal sex
        if (actType === 'receptive_anal') {
            riskCategory *= 0.25; // 75% reduction for highest risk act
        } else if (actType === 'insertive_anal' || actType === 'receptive_vaginal') {
            riskCategory *= 0.20; // 80% reduction for moderate risk acts
        } else {
            riskCategory *= 0.15; // 85% reduction for lower risk acts
        }
    } else if (condomUse === 'broke') {
        // Broken condom = equivalent to unprotected sex, no protective reduction
        // No additional penalty beyond baseline risk
    }

    // Multipliers for clinical context
    let multiplier = 1.0;
    
    // Circumcision reduces acquisition risk for men during insertive vaginal sex (WHO)
    // WHO RCT evidence is exclusively for heterosexual insertive vaginal sex
    if (state.profile.gender === 'cis_male' && state.profile.circumcised && 
        actType === 'insertive_vaginal') {
        multiplier *= 0.4; // WHO: ~60% reduction for insertive vaginal sex
    }

    if (partnerStatus === 'positive_detectable') multiplier *= 1.5;
    if (partnerStatus === 'unknown') {
        const isKP = isKeyPopulationEncounter(state.profile.gender || 'cis_male', partnerGender);
        if (isKP) multiplier = 1.2;
    }

    // STI increases biological vulnerability
    if (state.profile.sti || partnerSti === 'yes') {
        multiplier *= 1.3;
    }

    // WHO-aligned: Cap multiplier to prevent excessive risk inflation
    if (multiplier > 2.0) multiplier = 2.0;

    // Final internal score for dashboard logic
    return riskCategory * multiplier;
}

function updateDropdownText() {
    const selected = Array.from(userHasSexWithCheckboxes).filter(cb => cb.checked);
    const hasSexWithToggle = document.getElementById('has-sex-with-toggle');
    
    if (!hasSexWithToggle) return;
    
    if (selected.length === 0) {
        hasSexWithToggle.innerHTML = `Select Partners <span class="material-symbols-rounded">expand_more</span>`;
    } else if (selected.length === 1) {
        hasSexWithToggle.innerHTML = `${selected[0].parentElement.textContent.trim()} <span class="material-symbols-rounded">expand_more</span>`;
    } else {
        hasSexWithToggle.innerHTML = `Selected (${selected.length}) <span class="material-symbols-rounded">expand_more</span>`;
    }
}


function updateGuidance() {
    console.log('updateGuidance() called');
    const list = document.getElementById('guidance-list');
    if (!list) return;

    const uGender = state.profile.gender || 'cis_male';
    const profileHasSexWith = state.profile.hasSexWith || [];
    const encounterPartnerGenders = getEncounterPartnerGenders();
    const effectiveHasSexWith = getEffectiveHasSexWith();
    const isVirgin = state.profile.isVirgin;
    const profileFactors = getProfileRiskFactors();
    const latestTests = getLatestTestsByType();
    const latestEncounterDate = getLatestEncounterDate();
    const latestMeaningfulEncounterDate = getLatestMeaningfulEncounterDate();
    const hasRegularCoveredPartnerPattern = hasOnlyRegularCoveredPartnerPattern(state.encounters);
    const latestHivTest = latestTests.hiv;
    const { relevantEncounters, historicalEncounters, windowedEncounters } = getCurrentHivRiskContext();

    // Calculate total risk score for guidance decisions
    const totalRiskScore = relevantEncounters.reduce((total, enc) => total + (enc.riskScore || 0), 0);
    const hasHigherRiskSexualContext = hasHigherRiskSexualExposure(state.encounters);
    const hasRecentIntimateContext = hasRecentIntimateExposure(state.encounters);

    let isUserInKeyNetwork = effectiveHasSexWith.some(pg => isKeyPopulationEncounter(uGender, pg));
    if (uGender.startsWith('trans_')) isUserInKeyNetwork = true;

    const isPrEPCandidate = profileFactors.includes('msm') ||
        profileFactors.includes('trans_woman') ||
        profileFactors.includes('heterosexual_woman_at_risk') ||
        profileFactors.includes('pwid') ||
        profileFactors.includes('active_sti') ||
        profileFactors.includes('new_partners');

    let level1 = [];
    let level2 = [];
    let level3 = [];
    let stiMaintenance = [];

    const now = new Date();
    let hasPenetrativeReceptiveRole = false;

    if (latestHivTest?.result === 'positive') {
        level1.push('<li style="background: rgba(255, 59, 48, 0.1); border: 1px solid var(--danger-color); padding: 10px; border-radius: 8px; margin-bottom: 10px; list-style:none;"><strong style="color:var(--danger-color)">Positive HIV Result Logged:</strong> This app should no longer frame your status as acquisition risk. Please connect with an HIV specialist or clinic for confirmatory follow-up, treatment, and partner support.</li>');
        level2.push('<li><strong style="color:var(--warning-color)">Care Path:</strong> If this was a rapid or self-test, seek confirmatory testing. If confirmed, prompt treatment can protect your health and help you reach an undetectable viral load.</li>');
    } else if (latestHivTest?.result === 'pending') {
        level2.push('<li><strong style="color:var(--warning-color)">Pending HIV Test:</strong> Do not assume a negative result yet. Follow through on your result and keep recent exposures in mind.</li>');
    } else if (latestHivTest?.result === 'inconclusive') {
        level2.push('<li><strong style="color:var(--warning-color)">Inconclusive HIV Test:</strong> This does not rule infection in or out. Arrange repeat or confirmatory testing.</li>');
    } else if (latestHivTest?.result === 'negative' && windowedEncounters.length > 0) {
        level2.push(`<li><strong style="color:var(--warning-color)">90-Day Window Reminder:</strong> Your latest HIV test is negative, but <strong>${windowedEncounters.length} recent encounter${windowedEncounters.length === 1 ? '' : 's'}</strong> still fall within the broader HIV window period used here. Keep those exposures in mind until follow-up timing is more reliable.</li>`);
    } else if (latestHivTest?.result === 'negative') {
        // Issue 22: Serodiscordant couple guidance for partners with U=U status
        const hasUndetectablePartner = state.encounters.some(enc => enc.partnerStatus === 'positive_undetectable');
        if (hasUndetectablePartner && latestHivTest?.result !== 'positive') {
            level3.push('<li><strong style="color:var(--success-color)">U=U Awareness:</strong> You have a partner with HIV who is undetectable. When HIV is undetectable, it is untransmittable (U=U). If you are in a serodiscordant relationship, no additional HIV prevention is needed beyond your regular screening schedule.</li>');
        }
        
        // Check if all post-test encounters are with confirmed-negative/U=U partners
        const postTestEncounters = state.encounters.filter(enc =>
            new Date(enc.date) > new Date(latestHivTest.date)
        );
        const allPostTestCovered = postTestEncounters.length > 0 && postTestEncounters.every(enc =>
            enc.partnerStatus === 'negative' || enc.partnerStatus === 'positive_undetectable'
        );
        
        if (allPostTestCovered) {
            level3.push('<li><strong style="color:var(--success-color)">HIV Status Clear:</strong> Your negative HIV test covers your recent exposure history, and all subsequent partners have confirmed HIV-negative or undetectable status. No new HIV testing is indicated. Routine annual screening is recommended to stay current.</li>');
        } else {
            level3.push('<li><strong style="color:var(--success-color)">Recent HIV Result:</strong> Your latest logged HIV test is negative. Older encounters remain in history, but the app focuses current HIV risk guidance on newer or still-relevant exposures.</li>');
        }
    }

    STI_TEST_TYPES.forEach(type => {
        const test = latestTests[type];
        const label = TEST_TYPE_LABELS[type];

        if (test?.result === 'positive') {
            level2.push(`<li><strong style="color:var(--warning-color)">${label} Follow-Up:</strong> Your latest ${label.toLowerCase()} result is positive. Complete treatment, partner notification, and retesting as advised.</li>`);
        } else if (test?.result === 'treated') {
            level3.push(`<li><strong style="color:var(--success-color)">${label} Treated:</strong> You marked your latest ${label.toLowerCase()} result as treated or resolved. Keep routine screening on schedule if you continue having new partners.</li>`);
        } else if (test?.result === 'pending' || test?.result === 'inconclusive') {
            level2.push(`<li><strong style="color:var(--warning-color)">${label} Result Pending:</strong> Wait for a final ${label.toLowerCase()} result before assuming you are clear.</li>`);
        }
    });

    HEPATITIS_TEST_TYPES.forEach(type => {
        const test = latestTests[type];
        const label = TEST_TYPE_LABELS[type];

        if (test?.result === 'positive') {
            level2.push(`<li><strong style="color:var(--warning-color)">${label} Follow-Up:</strong> A positive ${label} result needs medical follow-up. Ask about confirmatory testing, liver monitoring, treatment options, and partner precautions.</li>`);
        } else if (test?.result === 'pending' || test?.result === 'inconclusive') {
            level2.push(`<li><strong style="color:var(--warning-color)">${label} Result Pending:</strong> Do not assume a final ${label} status until confirmatory results are back.</li>`);
        }
    });

    const mpoxTest = latestTests.mpox;
    if (mpoxTest?.result === 'positive') {
        level1.push(`<li style="background: rgba(255, 59, 48, 0.1); border: 1px solid var(--danger-color); padding: 10px; border-radius: 8px; margin-bottom: 10px; list-style:none;"><strong style="color:var(--danger-color)">Positive Mpox Result Logged:</strong> Isolate to avoid spreading mpox to others. Contact a healthcare provider for wound care guidance and to notify recent close contacts. Avoid skin-to-skin contact until all lesions have fully healed.</li>`);
    } else if (mpoxTest?.result === 'pending' || mpoxTest?.result === 'inconclusive') {
        level2.push(`<li><strong style="color:var(--warning-color)">Mpox Result Pending:</strong> Avoid close physical contact until your result is confirmed. Follow up with your provider promptly.</li>`);
    }

    // Track if PEP-qualifying exposure exists for prompt
    let hasPEPQualifyingExposure = false;

    relevantEncounters.forEach(enc => {
        const encDate = new Date(enc.date);
        const diffHours = (now - encDate) / (1000 * 60 * 60);

        if (diffHours <= 720 && (enc.actType === 'receptive_anal' || enc.actType === 'receptive_vaginal')) {
            hasPenetrativeReceptiveRole = true;
        }

        if (latestHivTest?.result === 'positive') return;

        // Use centralized PEP eligibility function (WHO-aligned)
        const pepEligibility = classifyPEPEligibility(enc);
        
        if (pepEligibility.shouldRecommendPEP) {
            hasPEPQualifyingExposure = true;
            level1.push(`<li style="background: rgba(255, 59, 48, 0.1); border: 1px solid var(--danger-color); padding: 10px; border-radius: 8px; margin-bottom: 10px; list-style:none;">
                <strong style="color:var(--danger-color)">EMERGENCY PEP WINDOW:</strong>
                You had a ${pepEligibility.reason} within the last 72 hours. WHO recommends <strong>PEP (Post-Exposure Prophylaxis)</strong> as soon as possible, ideally within 24 hours. Seek clinical care immediately.
            </li>`);
        } else if (pepEligibility.isWithinWindow && enc.riskScore >= 2.0) {
            // For moderate risk exposures that don't meet PEP criteria
            level2.push(`<li><strong style="color:var(--warning-color)">Recent Exposure:</strong> You had a recent exposure within the last 72 hours. While PEP may not be routinely recommended for this type of exposure, consult with a healthcare provider to assess your individual risk and discuss PEP options.</li>`);
        } else if (diffHours <= 720 && enc.riskScore >= 1.0) {
            level2.push('<li><strong style="color:var(--warning-color)">Testing Timeline:</strong> You had a notable exposure recently. Schedule an HIV test now.</li>');
        }
    });

    // Issue 19: Prompt to start PEP if PEP-qualifying exposure detected but user not on PEP
    if (hasPEPQualifyingExposure && !state.profile.onPep && latestHivTest?.result !== 'positive') {
        level2.push(`<li><strong style="color:var(--warning-color)">Start PEP Tracking:</strong> You have a PEP-qualifying exposure. If you have started or plan to start PEP, toggle "I am taking PEP" in your profile to activate the 28-day course tracker and reminders.</li>`);
    }

    if (state.profile.onPep && latestHivTest?.result !== 'positive') {
        const pepStart = state.profile.pepStartDate ? new Date(state.profile.pepStartDate) : null;
        const daysOnPep = pepStart ? Math.floor((now - pepStart) / (1000 * 60 * 60 * 24)) : 0;
        
        if (pepStart && daysOnPep <= 28) {
            level1.push(`<li style="background: rgba(255, 159, 10, 0.12); border: 1px solid var(--warning-color); padding: 10px; border-radius: 8px; margin-bottom: 10px; list-style:none;">
                <strong style="color:var(--warning-color)">Currently on PEP (Day ${daysOnPep + 1} of 28):</strong> 
                Complete the full 28-day course as prescribed. Do not miss doses.
            </li>`);
        } else if (pepStart && daysOnPep > 28) {
            level2.push('<li><strong style="color:var(--warning-color)">PEP Course Completed:</strong> You have passed the 28-day window. Arrange follow-up HIV testing and, if at ongoing risk, ask your provider about transitioning to <strong>PrEP</strong>.</li>');
        } else {
            level1.push('<li style="background: rgba(255, 159, 10, 0.12); border: 1px solid var(--warning-color); padding: 10px; border-radius: 8px; margin-bottom: 10px; list-style:none;"><strong style="color:var(--warning-color)">On PEP:</strong> WHO recommends starting PEP within 72 hours of exposure and completing a full 28-day course.</li>');
        }
        level2.push('<li><strong style="color:var(--warning-color)">PEP Follow-Up:</strong> Stay in contact with a clinician and arrange follow-up HIV testing. If you expect ongoing substantial HIV risk after PEP, ask about transitioning to PrEP.</li>');
    } else if (!state.profile.onPrep && latestHivTest?.result !== 'positive') {
        if (isPrEPCandidate) {
            const factorLabels = {
                msm: 'MSM or non-binary people in MSM sexual networks',
                trans_woman: 'Transgender Women',
                heterosexual_woman_at_risk: 'Heterosexual women with partners of unknown HIV status',
                pwid: 'People who inject drugs',
                active_sti: 'Active STI history',
                new_partners: 'New or changing partners'
            };
            const displayFactors = profileFactors.map(f => factorLabels[f] || f.replace(/_/g, ' '));
            level3.push(`<li><strong style="color:var(--accent-color)">PrEP Option:</strong> Based on your profile and logged partners (${displayFactors.join(', ')}), discuss daily <strong>PrEP</strong> with a clinician as an additional prevention choice. This can be helpful when exposure is ongoing or partners are changing.</li>`);
        }
    } else if (latestHivTest?.result !== 'positive') {
        level3.push('<li><strong style="color:var(--success-color)">On PrEP:</strong> WHO recommends PrEP as an additional prevention choice for people at substantial HIV risk. Keep taking it consistently, and remember condoms and safer injection practices still matter for protection against other STIs and blood-borne infections.</li>');
    }

    // Issue 22: Serodiscordant couple guidance for partners with U=U status
    const hasUndetectablePartner = state.encounters.some(enc => enc.partnerStatus === 'positive_undetectable');
    const alreadyAddedUUMessage = level3.some(msg => msg.includes('U=U Awareness') || msg.includes('Serodiscordant Couple Guidance'));
    if (hasUndetectablePartner && latestHivTest?.result !== 'positive' && !alreadyAddedUUMessage) {
        level3.push('<li><strong style="color:var(--success-color)">Serodiscordant Couple Guidance:</strong> You have logged encounters with a partner who is HIV-positive with undetectable viral load (U=U). Per WHO and the U=U consensus, when your partner maintains an undetectable viral load through consistent treatment, there is <strong>zero risk</strong> of sexual HIV transmission. No additional HIV testing is needed specifically for exposure to this partner. Support your partner in maintaining treatment adherence and regular viral load monitoring.</li>');
    }

    // Hep B vaccine - WHO: Recommended for newborns, children up to 18, and adults at higher risk
    // Risk factors: multiple partners, PWID, chronic liver disease, diabetes, etc.
    const hasHepBRiskFactors = state.profile.pwid ||
        state.profile.sti ||
        (state.profile.newPartners && hasHigherRiskSexualContext) ||
        (isUserInKeyNetwork && hasHigherRiskSexualContext);
    const shouldSuggestHepBVaccine = !state.profile.hepBVaccinated && hasHepBRiskFactors;
    if (shouldSuggestHepBVaccine) {
        level3.push('<li><strong style="color:var(--accent-color)">Hep B Vaccine:</strong> WHO recommends hepatitis B vaccination for adults at higher risk of infection, including people who inject drugs, those with multiple sexual partners, and those in key populations. Vaccination is also routinely recommended for all infants and children up to age 18. The 2- or 3-dose series provides excellent protection. Consider serology testing (anti-HBs) first if your immune status is unknown.</li>');
    }

    // Mpox vaccine for key populations per WHO interim guidance
    // WHO recommends for: MSM with multiple partners, individuals with multiple casual partners, sex workers, health workers at risk, lab personnel
    const shouldSuggestMpoxVaccine = !state.profile.mpoxVaccinated && (
        state.profile.sexWorker ||
        state.profile.sti ||
        (isUserInKeyNetwork && state.profile.newPartners && hasRecentIntimateContext && hasHigherRiskSexualContext)
    );
    if (shouldSuggestMpoxVaccine) {
        level3.push('<li><strong style="color:var(--accent-color)">Mpox Vaccine:</strong> WHO interim guidance recommends mpox vaccination for MSM with multiple partners, individuals with multiple casual partners, sex workers, and people with recent STI diagnoses. The JYNNEOS vaccine is a two-dose series given 28 days apart. Check with local health services about availability and eligibility.</li>');
    }

    // HPV vaccine - WHO: Primary target is girls 9-14, secondary targets include boys and older females where feasible and affordable
    const shouldSuggestHPVVaccine = !state.profile.hpvVaccinated;
    if (shouldSuggestHPVVaccine) {
        level3.push('<li><strong style="color:var(--accent-color)">HPV Vaccine:</strong> WHO recommends HPV vaccination primarily for girls aged 9-14. Secondary targets include boys and older females where feasible and affordable. HPV vaccination can prevent cervical cancer and other HPV-related diseases. If you were not vaccinated as an adolescent, ask your clinician about catch-up vaccination options.</li>');
    }

    if (state.profile.pwid) {
        level2.push('<li><strong style="color:var(--danger-color)">Harm Reduction:</strong> Sharing needles is high risk. Use clean equipment every time. Look for a local "Needle Exchange" program for free, sterile supplies.</li>');
    }
    if (state.profile.sti) {
        level2.push('<li><strong style="color:var(--warning-color)">Active STI:</strong> Untreated STIs cause inflammation that makes it significantly easier for HIV to enter the bloodstream. Complete your treatment before having sex again.</li>');
    }

    if (state.profile.role === 'receptive' && hasPenetrativeReceptiveRole) {
        level3.push('<li><strong>Receiving Risk:</strong> Receptive penetrative sex (anal or vaginal) carries a higher biological risk. Ensure consistent condom use if not on PrEP.</li>');
    }

    if (isUserInKeyNetwork && !isVirgin && (state.profile.newPartners || state.profile.onPrep || state.profile.sti || hasHigherRiskSexualContext)) {
        level3.push('<li><strong style="color:var(--accent-color)">Screening Routine:</strong> WHO guidance supports tailoring retesting to your situation. If exposure is ongoing, a 3- to 6-month interval may be reasonable; if exposure is lower, less frequent testing can also be appropriate.</li>');
    }

    if (state.profile.newPartners && !isVirgin) {
        level3.push('<li><strong style="color:var(--accent-color)">Retesting:</strong> Because you have new or changing partners, annual HIV and STI screening is a standard recommendation, with more frequent retesting (3-6 months) advisable for some situations.</li>');
    }

    if (isVirgin) {
        level3.push('<li><strong>Sexual Debut:</strong> Since you have no sexual history, your current HIV risk is minimal. Focus on practical prevention basics, and revisit testing or medication options only if your exposure pattern changes.</li>');
    }

    if (!isVirgin || state.encounters.length > 0 || state.tests.length > 0) {
        const latestResolvedStiDate = sortTestsDescending(state.tests)
            .filter(test => STI_TEST_TYPES.includes(test.type) && !['pending', 'inconclusive'].includes(test.result))
            .map(test => new Date(test.date))
            .sort((a, b) => b - a)[0] || null;
        const lastStiDate = latestResolvedStiDate ? new Date(latestResolvedStiDate) : null;
        const meaningfulEncountersSinceTest = getMeaningfulPostTestEncounters(lastStiDate, state.encounters);
        const meaningfulExposureCount = meaningfulEncountersSinceTest.length;
        const followUpRecommendations = getRecommendedFollowUpTests();
        const exposureFollowUpTests = followUpRecommendations.exposure || [];
        const routineFollowUpTests = followUpRecommendations.routine || [];
        const baselineFollowUpItems = followUpRecommendations.baseline || [];

        // WHO-aligned follow-up: persist until all recommended tests are completed
        if (meaningfulExposureCount > 0 || exposureFollowUpTests.length > 0 || routineFollowUpTests.length > 0 || baselineFollowUpItems.length > 0) {
            if (exposureFollowUpTests.length > 0) {
                const exposureFollowUpList = exposureFollowUpTests.map(type => getFollowUpItemLabel(type)).join(', ');
                const fullMessage = `<li><strong>Follow-Up:</strong> You have logged <strong>${meaningfulExposureCount} higher-risk encounter${meaningfulExposureCount === 1 ? '' : 's'}</strong> since your latest resolved STI result. WHO recommends retesting after potential exposure to ensure any new infection is detected early: ${exposureFollowUpList}.</li>`;
                stiMaintenance.push(fullMessage);
            }

            if (routineFollowUpTests.length > 0) {
                const routineFollowUpList = routineFollowUpTests.map(type => getFollowUpItemLabel(type, 'routine')).join(', ');
                if (hasRegularCoveredPartnerPattern) {
                    stiMaintenance.push(`<li><strong>Routine Screening:</strong> Your recent logs suggest regular partner context with HIV-covered status. Keep these tests current at routine intervals unless your exposure pattern changes: ${routineFollowUpList}.</li>`);
                } else {
                    stiMaintenance.push(`<li><strong>Routine Screening:</strong> Based on your profile and ongoing activity, keep these tests current without treating them as a recent-exposure problem: ${routineFollowUpList}.</li>`);
                }
            }

            if (baselineFollowUpItems.length > 0) {
                const baselineFollowUpList = baselineFollowUpItems.map(type => getFollowUpItemLabel(type, 'baseline')).join(', ');
                stiMaintenance.push(`<li><strong>Baseline Prevention:</strong> ${baselineFollowUpList} may be worth discussing if you have never been screened or vaccinated.</li>`);
            }
        }

        const screeningCutoff = new Date();
        screeningCutoff.setFullYear(screeningCutoff.getFullYear() - 1);
        if (!lastStiDate || lastStiDate < screeningCutoff) {
            if (isPrEPCandidate || state.profile.newPartners) {
                stiMaintenance.push('<li><strong style="color:var(--warning-color)">Overdue Screening:</strong> Annual retesting is recommended for most with ongoing risk, while quarterly or 6-monthly testing is advisable for PrEP users and those in higher-prevalence networks.</li>');
            }
        }

        if (historicalEncounters.length > 0 && latestHivTest?.result === 'negative') {
            stiMaintenance.push(`<li><strong>Historical Encounters Preserved:</strong> ${historicalEncounters.length} older encounter${historicalEncounters.length === 1 ? '' : 's'} remain in your history before the latest negative HIV test, but they are not driving your current HIV risk view.</li>`);
        }

        const hasDisparity = encounterPartnerGenders.some(pg => pg && !profileHasSexWith.includes(pg));
        if (hasDisparity) {
            stiMaintenance.push('<li><strong>Update Profile:</strong> Your logged partners don\'t match your profile settings. Update "My Profile" for more accurate clinical guidance.</li>');
        }

        if (hasRegularCoveredPartnerPattern) {
            stiMaintenance.push('<li><strong>Regular Partner Context:</strong> You marked one or more encounters as regular/established partners with HIV-covered status. This can support routine follow-up planning, but update entries promptly if partner status or STI context changes.</li>');
        }

        // Circumcision note for men who have vaginal sex with women (includes bisexual men)
        const hasSexWithWomen = profileHasSexWith.includes('cis_female') || 
                                encounterPartnerGenders.some(pg => pg === 'cis_female' || pg === 'trans_female');
        if (uGender === 'cis_male' && !state.profile.circumcised && hasSexWithWomen) {
            stiMaintenance.push('<li><strong>Prevention Note:</strong> Medical male circumcision can reduce the risk of heterosexually acquired HIV infection in men by approximately 60%.</li>');
        }

        stiMaintenance.push('<li><strong>Symptom Check:</strong> If you notice sores, discharge, or pain when urinating, see a doctor immediately, regardless of your risk score.</li>');
    }

    list.innerHTML = '';
    const allAdvice = [...level1, ...level2, ...level3];
    if (allAdvice.length > 0) {
        allAdvice.forEach(msg => list.innerHTML += msg);
    }

    if (allAdvice.length > 0 && stiMaintenance.length > 0) {
        list.innerHTML += '<li class="guidance-separator"></li>';
    }

    if (stiMaintenance.length > 0) {
        stiMaintenance.forEach(msg => list.innerHTML += msg);
    }

    if (list.innerHTML === '') {
        list.innerHTML = '<li><strong>Getting Started:</strong> Update your profile and log encounters to receive personalized clinical guidance.</li>';
    }
}

function updateDashboard() {
    const latestHivTest = getLatestTest('hiv');
    const { relevantEncounters, windowedEncounters } = getCurrentHivRiskContext();
    let totalRiskScore = 0;

    relevantEncounters.forEach(enc => {
        totalRiskScore += enc.riskScore || 0;
    });

    // PrEP provides ~99% protection when taken daily (WHO-aligned efficacy)
    if (state.profile.onPrep) {
        totalRiskScore *= 0.01; 
    }

    let colorClass = 'risk-level-low';
    let text = 'Routine';
    let desc = state.profile.onPrep
        ? 'PrEP provides excellent protection when taken daily. Continue routine check-ups.'
        : 'Your history suggests routine care. Keep up your current prevention habits.';

    const now = new Date();
    const hasEmergencyPEPWindow = relevantEncounters.some(enc => {
        const pepEligibility = classifyPEPEligibility(enc);
        return pepEligibility.shouldRecommendPEP;
    });

    if (state.profile.onPep && latestHivTest?.result !== 'positive') {
        const pepStart = state.profile.pepStartDate ? new Date(state.profile.pepStartDate) : null;
        const now = new Date();
        const daysOnPep = pepStart ? Math.floor((now - pepStart) / (1000 * 60 * 60 * 24)) : 0;

        colorClass = 'risk-level-medium';
        text = 'PEP Follow-up';
        if (pepStart && daysOnPep <= 28) {
            desc = `You are on Day ${daysOnPep + 1} of your 28-day PEP course. Complete the full course and arrange follow-up testing.`;
        } else {
            desc = 'You are in the PEP follow-up phase. Ensure you complete your scheduled HIV tests.';
        }
    } else if (latestHivTest?.result === 'positive') {
        colorClass = 'risk-level-high';
        text = 'Clinical Care';
        desc = 'A positive HIV result is logged. The focus is now on confirmatory testing, treatment, and specialist support.';
    } else if (latestHivTest?.result === 'pending' || latestHivTest?.result === 'inconclusive') {
        colorClass = 'risk-level-medium';
        text = 'Follow-up';
        desc = latestHivTest.result === 'pending'
            ? 'An HIV test result is pending. Follow through with your provider to confirm your status.'
            : 'Your latest HIV test is inconclusive. Arrange repeat or confirmatory testing.';
    } else if (hasEmergencyPEPWindow) {
        colorClass = 'risk-level-high';
        text = 'Urgent Action';
        desc = 'You have had a higher-risk exposure within the 72-hour PEP window. Seek clinical care immediately.';
    } else if (totalRiskScore > 0 && totalRiskScore < 1.0) {
        text = 'Routine';
        desc = latestHivTest?.result === 'negative' && windowedEncounters.length > 0
            ? 'Your latest HIV test is negative, but a recent exposure is still inside the window period (conclusive for most tests at 4-6 weeks).'
            : 'Your practices are generally low-risk. Continue routine prevention.';
    } else if (totalRiskScore >= 1.0 && totalRiskScore < 3.0) {
        colorClass = 'risk-level-medium';
        text = 'Enhanced Prevention';
        desc = latestHivTest?.result === 'negative'
            ? 'You have newer encounters after your latest negative HIV test. Most 4th-gen tests are conclusive at 4 weeks, but rapid tests may need 12 weeks.'
            : "You've logged encounters that warrant enhanced prevention. Consider PrEP and regular screening.";
    } else if (totalRiskScore >= 3.0) {
        colorClass = 'risk-level-high';
        text = 'Urgent Action';
        desc = latestHivTest?.result === 'negative'
            ? 'High-risk encounters remain clinically relevant despite your negative test due to the window period (up to 12 weeks for rapid tests).'
            : 'Recent encounters pose a substantial risk. Consult a healthcare provider for testing or PEP/PrEP options immediately.';
    } else if (latestHivTest?.result === 'negative' && windowedEncounters.length === 0) {
        desc = 'Your latest HIV test is negative, and no newer encounters are currently driving your clinical recommendation.';
    }

    // Update UI
    statusDot.className = 'status-dot';
    if (colorClass === 'risk-level-low') statusDot.classList.add('routine');
    else if (colorClass === 'risk-level-medium') statusDot.classList.add('enhanced');
    else if (colorClass === 'risk-level-high') statusDot.classList.add('urgent');

    riskText.textContent = text;
    riskDesc.textContent = desc;
}

function getRiskBadge(score) {
    if (score === 0) return '<span class="encounter-risk-badge badge-low">Negligible</span>';
    if (score < 1.0) return '<span class="encounter-risk-badge badge-low">Routine</span>';
    if (score < 3.0) return '<span class="encounter-risk-badge badge-medium">Enhanced</span>';
    return '<span class="encounter-risk-badge badge-high">Urgent</span>';
}

function renderEncounters() {
    encountersList.innerHTML = '';
    
    if (state.encounters.length === 0) {
        encountersList.innerHTML = `<div class="empty-state">No encounters logged yet.</div>`;
        return;
    }

    // Sort encounters by date descending (create copy to avoid mutating state)
    const sortedEncounters = [...state.encounters].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedEncounters.forEach(enc => {
        const item = document.createElement('div');
        item.className = 'encounter-item';
        
        const dateStr = new Date(enc.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        
        let riskBadge = '';
        let actRiskScore = enc.riskScore;
        if (state.profile.onPrep) actRiskScore *= 0.01;

        if (actRiskScore === 0) {
            riskBadge = `<span class="encounter-risk-badge badge-low">Negligible</span>`;
        } else if (actRiskScore < 1.0) {
            riskBadge = `<span class="encounter-risk-badge badge-low">Routine</span>`;
        } else if (actRiskScore < 3.0) {
            riskBadge = `<span class="encounter-risk-badge badge-medium">Enhanced</span>`;
        } else {
            riskBadge = `<span class="encounter-risk-badge badge-high">Urgent</span>`;
        }

        const actLabels = {
            'receptive_anal': 'Receiving Anal Sex',
            'insertive_anal': 'Giving Anal Sex',
            'receptive_vaginal': 'Receiving Vaginal Sex',
            'insertive_vaginal': 'Giving Vaginal Sex',
            'giving_oral': 'Giving Oral Sex',
            'receiving_oral': 'Receiving Oral Sex',
            'shared_needles': 'Shared Injecting Equipment',
            'other': 'Other / No Penetration'
        };

        const details = [
            actLabels[enc.actType] || enc.actType.replace('_', ' '),
            enc.partnerGender ? 'Partner: ' + (GENDER_LABELS[enc.partnerGender] || enc.partnerGender) : 'Partner: N/A',
            enc.condomUse === 'yes' ? 'Condom Used' : (enc.condomUse == 'no' ? 'No Condom' : 'Broken Condom'),
            'Status: ' + enc.partnerStatus.split('_').join(' ')
        ].join(' • ');

        item.innerHTML = `
            <div class="encounter-header">
                <div class="encounter-header-left">
                    <span class="encounter-date">${dateStr}</span>
                    ${riskBadge}
                </div>
                <div class="encounter-actions">
                    <button class="edit-btn" data-id="${enc.id}" title="Edit Encounter">
                        <span class="material-symbols-rounded">edit</span>
                    </button>
                    <button class="delete-btn" data-id="${enc.id}" title="Delete Encounter">
                        <span class="material-symbols-rounded">delete</span>
                    </button>
                </div>
            </div>
            <div class="encounter-details" style="text-transform: capitalize;">${details}</div>
        `;
        encountersList.appendChild(item);

        const deleteBtn = item.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => {
            if(confirm('Are you sure you want to delete this encounter?')) {
                state.encounters = state.encounters.filter(e => e.id !== enc.id);
                saveState();
                renderEncounters();
            }
        });

        const editBtn = item.querySelector('.edit-btn');
        editBtn.addEventListener('click', () => {
            editingEncounterId = enc.id;
            document.getElementById('modal-title').textContent = "Edit Encounter";
            document.getElementById('btn-submit-encounter').textContent = "Update Encounter";
            
            // Populate form
            document.getElementById('partner-status').value = enc.partnerStatus;
            document.getElementById('partner-gender').value = enc.partnerGender || 'cis_male';
            document.getElementById('partner-sti').value = enc.partnerSti || 'unknown';
            document.getElementById('is-regular-partner').checked = enc.isRegularPartner || false;
            
            document.getElementById('act-type').value = enc.actType;
            document.getElementById('condom-use').value = enc.condomUse;
            document.getElementById('encounter-date').value = enc.date.split('T')[0];
            
            encounterModal.classList.add('active');
        });
    });
}

/**
 * Settings & Notification Logic
 */
async function requestNotificationPermission() {
    if (!("Notification" in window)) {
        alert("This browser does not support desktop notifications.");
        return false;
    }

    let permission = Notification.permission;
    if (permission === "default") {
        permission = await Notification.requestPermission();
    }

    if (permission === "granted") {
        return true;
    } else {
        alert("Notifications are blocked. Please enable them in your browser settings to use reminders.");
        return false;
    }
}

async function showAppNotification(title, options = {}) {
    if (!('serviceWorker' in navigator)) {
        new Notification(title, { ...APP_NOTIFICATION_OPTIONS, ...options });
        return;
    }

    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
        ...APP_NOTIFICATION_OPTIONS,
        tag: 'hiv-risk-tracker',
        renotify: false,
        ...options
    });
}

function updateReminderUI() {
    if (!reminderStatusText) return;
    
    if (!("Notification" in window)) {
        reminderStatusText.textContent = "Notifications not supported on this browser.";
        return;
    }

    if (Notification.permission === "granted") {
        if (state.settings.remindersEnabled) {
            reminderStatusText.textContent = "Reminders are ACTIVE.";
            reminderStatusText.style.color = "var(--success-color)";
        } else {
            reminderStatusText.textContent = "Notifications enabled. Reminders are OFF.";
            reminderStatusText.style.color = "inherit";
        }
    } else if (Notification.permission === "denied") {
        reminderStatusText.textContent = "Notifications are BLOCKED by your browser.";
        reminderStatusText.style.color = "var(--danger-color)";
    }
}

function triggerReminderCheck() {
    if (!state.settings.remindersEnabled) return;
    if (Notification.permission !== "granted") return;

    const now = new Date();
    
    // Check last log date
    let lastLogDate = 0;
    if (state.encounters && state.encounters.length > 0) {
        lastLogDate = new Date(state.encounters[0].date).getTime();
    }
    
    const lastReminder = state.settings.lastReminderDate ? new Date(state.settings.lastReminderDate).getTime() : 0;
    const oneDay = 24 * 60 * 60 * 1000;

    // If it's been > 24h since last log AND > 24h since last reminder
    if ((now.getTime() - lastLogDate > oneDay) && (now.getTime() - lastReminder > oneDay)) {
        showAppNotification("HIV Risk Tracker Reminder", {
            body: "It's been over 24 hours since your last entry. Keep your tracking accurate by logging any recent activity.",
            tag: "daily-reminder"
        });
        
        state.settings.lastReminderDate = now.toISOString();
        saveState();
    }
}

function exportData() {
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const exportFileDefaultName = 'hiv_risk_tracker_backup_' + new Date().toISOString().split('T')[0] + '.json';
    
    const linkElement = document.createElement('a');
    linkElement.href = url;
    linkElement.download = exportFileDefaultName;
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
    URL.revokeObjectURL(url);
}

function validateImportSchema(importedState) {
    const errors = [];
    const warnings = [];
    
    // Basic structure validation
    if (!importedState || typeof importedState !== 'object') {
        throw new Error("Invalid file format. File must contain a valid JSON object.");
    }
    
    if (!importedState.profile || typeof importedState.profile !== 'object') {
        throw new Error("Invalid file format. Missing 'profile' object.");
    }
    
    if (!Array.isArray(importedState.encounters)) {
        throw new Error("Invalid file format. 'encounters' must be an array.");
    }
    
    // Valid enum values
    const validGenders = ['cis_male', 'cis_female', 'trans_male', 'trans_female', 'non_binary'];
    const validActTypes = ['receptive_anal', 'insertive_anal', 'receptive_vaginal', 'insertive_vaginal', 'giving_oral', 'receiving_oral', 'shared_needles', 'other'];
    const validStatuses = ['unknown', 'negative', 'positive_undetectable', 'positive_detectable'];
    const validCondomUse = ['yes', 'no', 'broke'];
    const validTestTypes = ['hiv', 'gonorrhea', 'chlamydia', 'syphilis', 'hep_b', 'hep_c', 'mpox'];
    const validResults = ['negative', 'positive', 'pending', 'treated', 'inconclusive', 'positive_undetectable', 'positive_detectable', 'immune', 'susceptible', 'not_applicable'];
    
    // Validate profile fields
    const profile = importedState.profile;
    if (profile.gender && !validGenders.includes(profile.gender)) {
        errors.push(`Invalid profile.gender: "${profile.gender}"`);
    }
    if (profile.role && !['insertive', 'receptive', 'versatile'].includes(profile.role)) {
        errors.push(`Invalid profile.role: "${profile.role}"`);
    }
    if (profile.prepType && !['daily', 'on_demand'].includes(profile.prepType)) {
        errors.push(`Invalid profile.prepType: "${profile.prepType}"`);
    }
    if (profile.prepType === 'on_demand') {
        const profileHasSexWith = Array.isArray(profile.hasSexWith) ? profile.hasSexWith : [];
        const encounterPartnerGenders = Array.isArray(importedState.encounters)
            ? importedState.encounters.map(enc => enc.partnerGender).filter(Boolean)
            : [];
        const effectiveHasSexWith = [...new Set([...profileHasSexWith, ...encounterPartnerGenders])];
        const isUserEligibleForOnDemand = isUserInMSMNetwork(profile.gender || 'cis_male', effectiveHasSexWith);
        if (!isUserEligibleForOnDemand) {
            // Auto-coerce instead of hard-failing: adjust the imported data in-place and warn the user.
            importedState.profile.prepType = 'daily';
            warnings.push('PrEP type was "on-demand (2-1-1)" in the imported file, but this mode is restricted to MSM-aligned profiles. It has been automatically changed to "daily" PrEP. You can update this in your Profile settings after import.');
        }
    }
    if (profile.pepStartDate && isNaN(Date.parse(profile.pepStartDate))) {
        errors.push(`Invalid profile.pepStartDate: "${profile.pepStartDate}"`);
    }
    if (profile.sexWorker !== undefined && typeof profile.sexWorker !== 'boolean') {
        errors.push(`Invalid profile.sexWorker "${profile.sexWorker}" (must be boolean)`);
    }
    if (profile.hasSexWith && !Array.isArray(profile.hasSexWith)) {
        errors.push(`Invalid profile.hasSexWith: must be an array`);
    } else if (profile.hasSexWith) {
        profile.hasSexWith.forEach((gender, idx) => {
            if (!validGenders.includes(gender)) {
                errors.push(`Invalid profile.hasSexWith[${idx}]: "${gender}"`);
            }
        });
    }
    
    // Validate encounters
    importedState.encounters.forEach((enc, index) => {
        if (!enc.date || isNaN(Date.parse(enc.date))) {
            errors.push(`Encounter ${index}: Invalid or missing date`);
        }
        if (!enc.actType || !validActTypes.includes(enc.actType)) {
            errors.push(`Encounter ${index}: Invalid or missing actType "${enc.actType}"`);
        }
        if (!enc.partnerGender || !validGenders.includes(enc.partnerGender)) {
            errors.push(`Encounter ${index}: Invalid or missing partnerGender "${enc.partnerGender}"`);
        }
        if (enc.partnerStatus && !validStatuses.includes(enc.partnerStatus)) {
            errors.push(`Encounter ${index}: Invalid partnerStatus "${enc.partnerStatus}"`);
        }
        if (enc.condomUse && !validCondomUse.includes(enc.condomUse)) {
            errors.push(`Encounter ${index}: Invalid condomUse "${enc.condomUse}"`);
        }
        if (enc.partnerSti && !['yes', 'no', 'unknown'].includes(enc.partnerSti)) {
            errors.push(`Encounter ${index}: Invalid partnerSti "${enc.partnerSti}"`);
        }
        if (enc.isRegularPartner !== undefined && typeof enc.isRegularPartner !== 'boolean') {
            errors.push(`Encounter ${index}: Invalid isRegularPartner "${enc.isRegularPartner}" (must be boolean)`);
        }
        if (enc.riskScore !== undefined && typeof enc.riskScore !== 'number') {
            errors.push(`Encounter ${index}: Invalid riskScore "${enc.riskScore}" (must be number)`);
        }
    });
    
    // Validate tests if present
    if (importedState.tests) {
        if (!Array.isArray(importedState.tests)) {
            errors.push("'tests' must be an array");
        } else {
            importedState.tests.forEach((test, index) => {
                if (!test.date || isNaN(Date.parse(test.date))) {
                    errors.push(`Test ${index}: Invalid or missing date`);
                }
                if (!test.type || !validTestTypes.includes(test.type)) {
                    errors.push(`Test ${index}: Invalid or missing type "${test.type}"`);
                }
                if (!test.result || !validResults.includes(test.result)) {
                    errors.push(`Test ${index}: Invalid or missing result "${test.result}"`);
                }
            });
        }
    }
    
    if (errors.length > 0) {
        throw new Error("Schema validation failed:\n• " + errors.join("\n• "));
    }

    return warnings;
}

function importData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedState = JSON.parse(e.target.result);
            
            // Issue 18: Comprehensive schema validation
            // validateImportSchema may coerce certain fields (e.g. on_demand → daily) and return
            // a warnings array describing any automatic adjustments made to the imported data.
            const importWarnings = validateImportSchema(importedState);

            const warningNotice = importWarnings.length > 0
                ? "\n\n⚠️ Import adjustments:\n• " + importWarnings.join("\n• ") + "\n\n"
                : "\n\n";

            if (confirm("This will overwrite all current data with the imported file. This action cannot be undone." + warningNotice + "Continue?")) {
                // Merge with default state structure to handle potential missing fields from older versions
                state = {
                    ...state,
                    ...importedState,
                    profile: { ...state.profile, ...importedState.profile },
                    settings: { ...state.settings, ...(importedState.settings || {}) }
                };
                recalculateRiskHistory();
                saveState();
                location.reload(); 
            }
        } catch (err) {
            alert("Error importing file: " + err.message);
        }
    };
    reader.readAsText(file);
}

// Simple toast notification function
function showToast(message) {
    // Check if a toast container exists, create one if not
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = 'position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 1000; pointer-events: none;';
        document.body.appendChild(toastContainer);
    }
    
    // Create the toast element
    const toast = document.createElement('div');
    toast.style.cssText = 'background: var(--card-bg); color: var(--text-color); border: 1px solid var(--accent-color); padding: 12px 24px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); margin-top: 10px; font-size: 14px; max-width: 400px; text-align: center; opacity: 0; transition: opacity 0.3s;';
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    // Animate in
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
    });
    
    // Remove after 4 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Start
init();

