// State management
let state = {
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
    hep_c: 'Hep C'
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
        cutoff.setDate(cutoff.getDate() - 30);

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

function getLatestEncounterDate(encounters = state.encounters) {
    if (!encounters.length) return null;
    return encounters
        .map(enc => new Date(enc.date))
        .sort((a, b) => b - a)[0];
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
    'hep_c': 84 // 4-12 weeks
};

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
                timingText = `${testType} in <strong>${daysUntilOptimal} days</strong> (${optimalTestDate.toLocaleDateString()}) for optimal detection.`;
            } else if (daysUntilOptimal === 0) {
                timingText = `${testType} <strong>today</strong> for optimal detection.`;
            } else {
                timingText = `${testType} as soon as possible (optimal window was ${Math.abs(daysUntilOptimal)} days ago).`;
            }
        } else {
            timingText = `${testType} testing window has passed; test as soon as possible if not already done.`;
        }
        
        return timingText;
    });
    
    return timingInfo;
}

function getRecommendedFollowUpTests() {
    const recommendations = [];
    const latestTests = getLatestTestsByType();
    const latestEncounterDate = getLatestEncounterDate();
    const sexualExposure = hasSexualExposure();
    const needleExposure = hasNeedleExposure();
    
    const uGender = state.profile.gender || 'cis_male';
    const profileHasSexWith = state.profile.hasSexWith || [];
    const encounterPartnerGenders = state.encounters ? state.encounters.map(e => e.partnerGender) : [];
    const effectiveHasSexWith = [...new Set([...profileHasSexWith, ...encounterPartnerGenders])];
    const isUserInKeyNetwork = effectiveHasSexWith.some(pg => isKeyPopulationEncounter(uGender, pg)) || uGender.startsWith('trans_');

    if (!latestEncounterDate) return recommendations;

    const shouldRetestAfterEncounter = (type) => {
        const test = latestTests[type];
        if (!test) return true;
        if (['pending', 'inconclusive'].includes(test.result)) return true;
        if (!isResolvedTestResult(test.result) && test.result !== 'positive') return true;
        
        // WHO-aligned: check if test was done within appropriate window after latest exposure
        const now = new Date();
        const testDate = new Date(test.date);
        const localNow = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());
        const localTestDate = new Date(testDate.getFullYear(), testDate.getMonth(), testDate.getDate(), testDate.getHours(), testDate.getMinutes());
        const localLatestEncounter = new Date(latestEncounterDate.getFullYear(), latestEncounterDate.getMonth(), latestEncounterDate.getDate(), latestEncounterDate.getHours(), latestEncounterDate.getMinutes());
        
        const daysSinceTest = Math.floor((localNow - localTestDate) / (1000 * 60 * 60 * 24));
        const daysSinceLatestEncounter = Math.floor((localNow - localLatestEncounter) / (1000 * 60 * 60 * 24));
        
        // If test was done before latest encounter, definitely need retest
        if (localTestDate < localLatestEncounter) return true;
        
        // If test was done too early after exposure, may need repeat test
        const windowDays = WHO_TESTING_WINDOWS[type] || 42;
        if (daysSinceLatestEncounter < windowDays && daysSinceTest >= windowDays) {
            return false; // Tested appropriately after window period
        }
        
        return daysSinceTest < windowDays; // Still within testing window
    };

    // Check if all recent encounters were with confirmed HIV-negative partners
    const allRecentEncountersHivNegative = state.encounters.every(enc => 
        enc.partnerStatus === 'negative' || enc.partnerStatus === 'positive_undetectable'
    );
    
    // Only recommend HIV testing if not all partners were confirmed negative
    if (!allRecentEncountersHivNegative && shouldRetestAfterEncounter('hiv')) {
        recommendations.push('HIV');
    } else if (!allRecentEncountersHivNegative) {
        const latestHiv = latestTests.hiv;
        if (latestHiv?.result === 'negative') {
            const cutoff = new Date(latestHiv.date);
            cutoff.setDate(cutoff.getDate() - 30);
            const hasWindowExposure = state.encounters.some(enc => {
                const encDate = new Date(enc.date);
                return encDate >= cutoff && encDate <= new Date(latestHiv.date);
            });
            if (hasWindowExposure) {
                recommendations.push('HIV (repeat after the window period if advised)');
            }
        }
    }

    if (sexualExposure) {
        ['gonorrhea', 'chlamydia', 'syphilis'].forEach(type => {
            if (shouldRetestAfterEncounter(type)) {
                recommendations.push(TEST_TYPE_LABELS[type]);
            }
        });
    }

    if (sexualExposure || needleExposure) {
        const isHighRisk = state.profile.pwid || state.profile.newPartners || isUserInKeyNetwork;
        
        // Hep C for PWID and MSM/Trans high-risk networks (WHO)
        if (state.profile.pwid || isUserInKeyNetwork) {
            if (shouldRetestAfterEncounter('hep_c')) {
                recommendations.push('Hep C');
            }
        }

        // Even if vaccinated, high-risk groups may need baseline or occasional Hep B screening per WHO
        if (!state.profile.hepBVaccinated) {
            recommendations.push('Hep B');
        } else if (isHighRisk) {
            // If vaccinated but high risk, only recommend if they've NEVER logged a result or it's very old
            const latestHepB = latestTests.hep_b;
            if (!latestHepB) {
                recommendations.push('Hep B (Baseline screening recommended for high-risk groups)');
            }
        }

        if (needleExposure) {
            if (shouldRetestAfterEncounter('hep_c')) {
                recommendations.push('Hep C');
            }
        }
    }

    return [...new Set(recommendations)];
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

/**
 * WHO/CDC Clinical Logic: Determines if an encounter involves a High-Prevalence Network (Key Population)
 */
function isKeyPopulationEncounter(uGender, pGender) {
    if (!uGender || !pGender) return false;
    
    const isUserMale = (uGender === 'cis_male' || uGender === 'trans_male');
    const isPartnerMale = (pGender === 'cis_male' || pGender === 'trans_male' || pGender === 'non_binary');
    const isUserTrans = uGender.startsWith('trans_');
    const isPartnerTrans = pGender.startsWith('trans_');

    // 1. MSM Network (Cis/Trans Men who have sex with men or NB)
    if (isUserMale && isPartnerMale) return true;
    
    // 2. Interaction with Trans Women (Higher prevalence group globally)
    if (pGender === 'trans_female') return true;
    
    // 3. User is trans, but let's be more specific:
    // If a trans man has sex with a cis female, this is clinically similar to heterosexual risk.
    // We only flag as high-network if the partner is also from a key population.
    if (isUserTrans && isPartnerTrans) return true;

    return false;
}

/**
 * Evaluates the user's static profile against WHO "Key Population" and high-risk criteria
 */
function getProfileRiskFactors() {
    const factors = [];
    const uGender = state.profile.gender;
    const hasSexWith = state.profile.hasSexWith || [];

    // 1. MSM (Men who have sex with men)
    const isMSM = (uGender === 'cis_male' || uGender === 'trans_male') && 
                  (hasSexWith.some(p => ['cis_male', 'trans_male', 'non_binary', 'trans_female'].includes(p)));
    
    // 2. Transgender Women (Highest prevalence group globally)
    const isTransWoman = (uGender === 'trans_female');

    if (isMSM) factors.push('msm');
    if (isTransWoman) factors.push('trans_woman');
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
    userHepBVax.checked = state.profile.hepBVaccinated || false;
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
        if (e.target.checked) {
            state.profile.onPep = false;
            userPep.checked = false;
        }
        recalculateRiskHistory();
        saveState();
    });
    userPep.addEventListener('change', (e) => {
        state.profile.onPep = e.target.checked;
        if (e.target.checked) {
            state.profile.onPrep = false;
            userPrep.checked = false;
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
    userCircumcised.addEventListener('change', (e) => { state.profile.circumcised = e.target.checked; recalculateRiskHistory(); saveState(); });
    userSti.addEventListener('change', (e) => { state.profile.sti = e.target.checked; recalculateRiskHistory(); saveState(); });
    userNewPartners.addEventListener('change', (e) => { state.profile.newPartners = e.target.checked; saveState(); });
    userPwid.addEventListener('change', (e) => { state.profile.pwid = e.target.checked; recalculateRiskHistory(); saveState(); });
    userVirgin.addEventListener('change', (e) => { state.profile.isVirgin = e.target.checked; refreshApp(); saveState(); });

    userHasSexWithCheckboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            state.profile.hasSexWith = Array.from(userHasSexWithCheckboxes)
                .filter(c => c.checked)
                .map(c => c.value);
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

        saveState();
        alert(`${TEST_TYPE_LABELS[type]} result saved.`);
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
        const actualDate = encounterDate ? new Date(encounterDate).toISOString() : new Date().toISOString();

        const encounter = {
            id: editingEncounterId || Date.now(),
            date: actualDate,
            partnerGender,
            partnerStatus,
            partnerSti: partnerSti.value,
            actType,
            condomUse,
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
        // If partner is HIV-negative and no known STIs, minimal risk but still track for STI screening
        return 0.1; // Very low risk for dashboard purposes but will trigger STI testing
    }

    // Use a categorical score for internal ranking (not for user display)
    // 0: Negligible, 1: Low, 2: Moderate, 3: High
    let riskCategory = 0;

    switch(actType) {
        case 'receptive_anal':
        case 'shared_needles':
            riskCategory = 3; 
            break;
        case 'insertive_anal':
        case 'receptive_vaginal':
            riskCategory = 2;
            break;
        case 'insertive_vaginal':
            riskCategory = 1;
            break;
        case 'giving_oral':
            riskCategory = 0.5;
            break;
        case 'receiving_oral':
        default:
            riskCategory = 0;
            break;
    }

    // Condoms are highly effective
    if (condomUse === 'yes' && riskCategory > 0) {
        riskCategory = 0.5; // Reduces any higher risk to very low
    } else if (condomUse === 'broke' && riskCategory > 0) {
        riskCategory *= 1.2; // WHO: 20% increase due to failure awareness
    }

    // Multipliers for clinical context
    let multiplier = 1.0;
    
    // Circumcision reduces acquisition risk for men during insertive vaginal sex (WHO)
    if (state.profile.gender === 'cis_male' && state.profile.circumcised && 
        (actType === 'insertive_vaginal' || actType === 'insertive_anal')) {
        multiplier *= 0.4; // WHO: ~60% reduction for both vaginal and anal insertive sex
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
    const encounterPartnerGenders = state.encounters ? state.encounters.map(e => e.partnerGender) : [];
    const effectiveHasSexWith = [...new Set([...profileHasSexWith, ...encounterPartnerGenders])];
    const isVirgin = state.profile.isVirgin;
    const profileFactors = getProfileRiskFactors();
    const latestTests = getLatestTestsByType();
    const latestEncounterDate = getLatestEncounterDate();
    const latestHivTest = latestTests.hiv;
    const { relevantEncounters, historicalEncounters, windowedEncounters } = getCurrentHivRiskContext();

    let isUserInKeyNetwork = effectiveHasSexWith.some(pg => isKeyPopulationEncounter(uGender, pg));
    if (uGender.startsWith('trans_')) isUserInKeyNetwork = true;

    const isPrEPCandidate = profileFactors.includes('msm') ||
        profileFactors.includes('trans_woman') ||
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
        level2.push(`<li><strong style="color:var(--warning-color)">30-Day Window Reminder:</strong> Your latest HIV test is negative, but <strong>${windowedEncounters.length} recent encounter${windowedEncounters.length === 1 ? '' : 's'}</strong> still fall within the window period before that test. Keep those exposures in mind until follow-up timing is more reliable.</li>`);
    } else if (latestHivTest?.result === 'negative') {
        level3.push('<li><strong style="color:var(--success-color)">Recent HIV Result:</strong> Your latest logged HIV test is negative. Older encounters remain in history, but the app focuses current HIV risk guidance on newer or still-relevant exposures.</li>');
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

    relevantEncounters.forEach(enc => {
        const encDate = new Date(enc.date);
        const diffHours = (now - encDate) / (1000 * 60 * 60);

        if (diffHours <= 720 && (enc.actType === 'receptive_anal' || enc.actType === 'receptive_vaginal')) {
            hasPenetrativeReceptiveRole = true;
        }

        if (latestHivTest?.result === 'positive') return;

        // Emergency PEP logic (within 72 hours) - WHO aligned
        const isHighRiskExposure = enc.actType === 'receptive_anal' || enc.actType === 'shared_needles';
        const isKnownPositivePartner = enc.partnerStatus === 'positive_detectable';
        const isModerateRiskWithFactors = (enc.actType === 'receptive_vaginal' || enc.actType === 'insertive_anal') && 
                                          (enc.partnerStatus === 'positive_detectable' || state.profile.sti || enc.partnerSti === 'yes');
        
        if (diffHours <= 72 && (isHighRiskExposure || isKnownPositivePartner || isModerateRiskWithFactors)) {
            let pepReason = '';
            if (isHighRiskExposure) {
                pepReason = 'high-risk exposure';
            } else if (isKnownPositivePartner) {
                pepReason = 'exposure to HIV-positive partner';
            } else {
                pepReason = 'moderate-risk exposure with additional risk factors';
            }
            
            level1.push(`<li style="background: rgba(255, 59, 48, 0.1); border: 1px solid var(--danger-color); padding: 10px; border-radius: 8px; margin-bottom: 10px; list-style:none;">
                <strong style="color:var(--danger-color)">EMERGENCY PEP WINDOW:</strong>
                You had a ${pepReason} within the last 72 hours. WHO recommends <strong>PEP (Post-Exposure Prophylaxis)</strong> as soon as possible, ideally within 24 hours. Seek clinical care immediately.
            </li>`);
        } else if (diffHours <= 72 && enc.riskScore >= 2.0) {
            // For moderate risk exposures that don't meet PEP criteria
            level2.push(`<li><strong style="color:var(--warning-color)">Recent Exposure:</strong> You had a recent exposure within the last 72 hours. While PEP may not be routinely recommended for this type of exposure, consult with a healthcare provider to assess your individual risk and discuss PEP options.</li>`);
        } else if (diffHours <= 720 && enc.riskScore >= 1.0) {
            level2.push('<li><strong style="color:var(--warning-color)">Testing Timeline:</strong> You had a notable exposure recently. Schedule an HIV test now.</li>');
        }
    });

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
                msm: 'Men who have sex with men (MSM)',
                trans_woman: 'Transgender Women',
                pwid: 'People who inject drugs',
                active_sti: 'Active STI history',
                new_partners: 'New or changing partners'
            };
            const displayFactors = profileFactors.map(f => factorLabels[f] || f.replace(/_/g, ' '));
            level3.push(`<li><strong style="color:var(--accent-color)">WHO PrEP Recommendation:</strong> Based on your profile (${displayFactors.join(', ')}), daily <strong>PrEP</strong> is highly recommended. It is a powerful tool to stay HIV-free regardless of individual encounter outcomes.</li>`);
        }
    } else if (latestHivTest?.result !== 'positive') {
        level3.push('<li><strong style="color:var(--success-color)">On PrEP:</strong> WHO recommends PrEP as an additional prevention choice for people at substantial HIV risk. Keep taking it consistently, and remember condoms and safer injection practices still matter for protection against other STIs and blood-borne infections.</li>');
    }

    const shouldSuggestHepBVaccine = !state.profile.hepBVaccinated && (
        state.profile.pwid ||
        state.profile.newPartners ||
        hasNeedleExposure(state.encounters)
    );

    if (shouldSuggestHepBVaccine) {
        level3.push('<li><strong style="color:var(--accent-color)">Hep B Vaccine:</strong> WHO recommends hepatitis B vaccination for higher-risk groups, including people with multiple sexual partners and people who inject drugs. If you have not had the vaccine, ask a clinician or vaccination service about getting the full series.</li>');
    }

    if (state.profile.pwid) {
        level2.push('<li><strong style="color:var(--danger-color)">Harm Reduction:</strong> Sharing needles is high risk. Use clean equipment every time. Look for a local "Needle Exchange" program for free, sterile supplies.</li>');
    }
    if (state.profile.sti) {
        level2.push('<li><strong style="color:var(--warning-color)">Active STI:</strong> Untreated STIs cause inflammation that makes it significantly easier for HIV to enter the bloodstream. Complete your treatment before having sex again.</li>');
    }

    if (state.profile.role === 'receptive' && (hasPenetrativeReceptiveRole || !isVirgin)) {
        level3.push('<li><strong>Receiving Risk:</strong> Receptive penetrative sex (anal or vaginal) carries a higher biological risk. Ensure consistent condom use if not on PrEP.</li>');
    }

    if (isUserInKeyNetwork && !isVirgin) {
        level3.push('<li><strong style="color:var(--accent-color)">Screening Routine:</strong> WHO suggests that for people in key population networks, retesting every 3 to 6 months may be advisable depending on individual risk and local prevalence.</li>');
    }

    if (state.profile.newPartners && !isVirgin) {
        level3.push('<li><strong style="color:var(--accent-color)">Retesting:</strong> Because you have new or changing partners, annual HIV and STI screening is a standard recommendation, with more frequent retesting (3-6 months) advisable for some situations.</li>');
    }

    if (isVirgin) {
        level3.push('<li><strong>Sexual Debut:</strong> Since you have no sexual history, your current clinical risk is negligible. This is the perfect time to establish a prevention plan (like starting PrEP) before your first encounter.</li>');
    }

    if (!isVirgin || state.encounters.length > 0 || state.tests.length > 0) {
        const latestResolvedStiDate = sortTestsDescending(state.tests)
            .filter(test => STI_TEST_TYPES.includes(test.type) && !['pending', 'inconclusive'].includes(test.result))
            .map(test => new Date(test.date))
            .sort((a, b) => b - a)[0] || null;
        const lastStiDate = latestResolvedStiDate ? new Date(latestResolvedStiDate) : null;
        const encountersSinceTest = lastStiDate ? state.encounters.filter(e => new Date(e.date) > lastStiDate).length : state.encounters.length;
        const recommendedFollowUpTests = getRecommendedFollowUpTests();

        // WHO-aligned follow-up: persist until all recommended tests are completed
        if (encountersSinceTest > 0 || recommendedFollowUpTests.length > 0) {
            const timingAdvice = getTestingTimingAdvice(recommendedFollowUpTests, latestEncounterDate);
            const followUpList = recommendedFollowUpTests.length ? `: ${recommendedFollowUpTests.join(', ')}` : '';
            const message = recommendedFollowUpTests.length > 0 
                ? `You have logged <strong>${encountersSinceTest} partner${encountersSinceTest === 1 ? '' : 's'}</strong> since your latest resolved STI result. WHO recommends retesting after potential exposure to ensure any new infection is detected early${followUpList}.`
                : `You have logged <strong>${encountersSinceTest} partner${encountersSinceTest === 1 ? '' : 's'}</strong> since your latest resolved STI result. Continue routine screening as recommended by WHO.`;
            
            let fullMessage = `<li><strong>Follow-Up:</strong> ${message}`;
            
            if (timingAdvice && timingAdvice.length > 0) {
                fullMessage += `<br><strong>Testing Timing:</strong>`;
                timingAdvice.forEach(timing => {
                    fullMessage += `<br><span style="margin-left: 20px; display: inline-block;">• ${timing}</span>`;
                });
            }
            
            fullMessage += `</li>`;
            stiMaintenance.push(fullMessage);
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

        if (uGender === 'cis_male' && !state.profile.circumcised && profileHasSexWith.includes('cis_female')) {
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

    // PrEP provides significant protection (internal logic)
    if (state.profile.onPrep) {
        totalRiskScore *= 0.1; 
    }

    let colorClass = 'risk-level-low';
    let text = 'Routine';
    let desc = state.profile.onPrep
        ? 'PrEP provides excellent protection when taken daily. Continue routine check-ups.'
        : 'Your history suggests routine care. Keep up your current prevention habits.';

    const now = new Date();
    const hasEmergencyPEPWindow = relevantEncounters.some(enc => {
        const diffHours = (now - new Date(enc.date)) / (1000 * 60 * 60);
        const isHighRiskExposure = enc.actType === 'receptive_anal' || enc.actType === 'shared_needles';
        const isKnownPositivePartner = enc.partnerStatus === 'positive_detectable';
        const isModerateRiskWithFactors = (enc.actType === 'receptive_vaginal' || enc.actType === 'insertive_anal') && 
                                          (enc.partnerStatus === 'positive_detectable' || state.profile.sti || enc.partnerSti === 'yes');
        
        return diffHours <= 72 && (isHighRiskExposure || isKnownPositivePartner || isModerateRiskWithFactors);
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

    // Sort encounters by date descending
    state.encounters.sort((a, b) => new Date(b.date) - new Date(a.date));

    state.encounters.forEach(enc => {
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

function importData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedState = JSON.parse(e.target.result);
            
            // Validation
            if (!importedState.profile || !importedState.encounters) {
                throw new Error("Invalid file format. This doesn't look like a valid HIV Risk Tracker backup.");
            }

            if (confirm("This will overwrite all current data with the imported file. This action cannot be undone. Continue?")) {
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

// Start
init();

