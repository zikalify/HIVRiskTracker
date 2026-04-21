// State management
let state = {
    profile: {
        gender: 'cis_male',
        hasSexWith: [],
        role: 'versatile',
        onPrep: false,
        circumcised: false,
        sti: false,
        pwid: false,
        isVirgin: true,
        lastStiTestDate: null
    },
    encounters: [],
    lastTestDate: null,
    settings: {
        remindersEnabled: false,
        lastReminderDate: null
    }
};

let editingEncounterId = null;

const GENDER_LABELS = {
    'cis_male': 'Cisgender Men',
    'cis_female': 'Cisgender Women',
    'trans_female': 'Transgender Women',
    'trans_male': 'Transgender Men',
    'non_binary': 'Non-binary / Others'
};

// DOM Elements
const riskMeter = document.querySelector('.risk-indicator-path');
const riskText = document.querySelector('.risk-percentage');
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
const userCircumcised = document.getElementById('user-circumcised');
const userSti = document.getElementById('user-sti');
const userPwid = document.getElementById('user-pwid');
const userVirgin = document.getElementById('user-virgin');
const circumcisionGroup = document.getElementById('circumcision-group');

// Form
const encounterForm = document.getElementById('encounter-form');
const encountersList = document.getElementById('encounters-list');
const btnTestNegative = document.getElementById('btn-test-negative');
const partnerStatusSelect = document.getElementById('partner-status');
const partnerPrepGroup = document.getElementById('partner-prep-group');
const partnerSti = document.getElementById('partner-sti');
const partnerGenderSelect = document.getElementById('partner-gender');
const encounterDateInput = document.getElementById('encounter-date');

// Screening elements
const lastStiDateDisplay = document.getElementById('last-sti-date-display');
const logStiDateInput = document.getElementById('log-sti-date');
const btnLogStiPanel = document.getElementById('btn-log-sti-panel');
const btnClearStiPanel = document.getElementById('btn-clear-sti-panel');

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
function init() {
    loadState();
    toggleCircumcisionVisibility();
    setupEventListeners();
    updateGuidance();
    updateReminderUI();
    triggerReminderCheck();
    if(typeof updateDropdownText === 'function') updateDropdownText();
    updateDashboard();
    renderEncounters();
    handleLaunchActions();
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
    
    return factors;
}

function refreshApp() {
    updateDashboard();
    renderEncounters();
    updateGuidance();
    
    // Update STI screening display
    if (state.profile.lastStiTestDate) {
        lastStiDateDisplay.textContent = new Date(state.profile.lastStiTestDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        btnClearStiPanel.style.display = 'flex';
    } else {
        lastStiDateDisplay.textContent = "Never logged";
        btnClearStiPanel.style.display = 'none';
    }

    if(typeof updateDropdownText === 'function') updateDropdownText();
}

function openNewEncounterModal() {
    editingEncounterId = null;
    document.getElementById('modal-title').textContent = "Log Encounter";
    document.getElementById('btn-submit-encounter').textContent = "Save Encounter";
    encounterForm.reset();

    const today = new Date().toISOString().split('T')[0];
    encounterDateInput.value = today;

    partnerPrepGroup.style.display = 'block';
    encounterModal.classList.add('active');
}

function handleLaunchActions() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'new-encounter') {
        openNewEncounterModal();
    }
}

function loadState() {
    const saved = localStorage.getItem('hivRiskState');
    if (saved) {
        state = JSON.parse(saved);
        
        // Populate form fields
        userGender.value = state.profile.gender || 'cis_male';
        if (!state.profile.hasSexWith) state.profile.hasSexWith = [];
        userHasSexWithCheckboxes.forEach(cb => {
            cb.checked = state.profile.hasSexWith.includes(cb.value);
        });
        userRole.value = state.profile.role || 'versatile';
        userPrep.checked = state.profile.onPrep || false;
        userCircumcised.checked = state.profile.circumcised || false;
        userSti.checked = state.profile.sti || false;
        userPwid.checked = state.profile.pwid || false;
        userVirgin.checked = state.profile.isVirgin !== undefined ? state.profile.isVirgin : true;
        
        if (state.profile.lastStiTestDate) {
            logStiDateInput.value = state.profile.lastStiTestDate.split('T')[0];
        } else {
            logStiDateInput.value = new Date().toISOString().split('T')[0];
        }

        // Settings
        if (!state.settings) state.settings = { remindersEnabled: false, lastReminderDate: null };
        settingReminders.checked = state.settings.remindersEnabled || false;
        updateReminderUI();
    }
}

function saveState() {
    localStorage.setItem('hivRiskState', JSON.stringify(state));
    refreshApp();
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
    userPrep.addEventListener('change', (e) => { state.profile.onPrep = e.target.checked; recalculateRiskHistory(); saveState(); });
    userCircumcised.addEventListener('change', (e) => { state.profile.circumcised = e.target.checked; recalculateRiskHistory(); saveState(); });
    userSti.addEventListener('change', (e) => { state.profile.sti = e.target.checked; recalculateRiskHistory(); saveState(); });
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

    // STI Panel Logging
    btnLogStiPanel.addEventListener('click', () => {
        const testDate = logStiDateInput.value;
        if (!testDate) {
            alert("Please select a date for your screening panel.");
            return;
        }
        state.profile.lastStiTestDate = new Date(testDate).toISOString();
        saveState();
        alert("Full STI Panel logged. Your screening counter has been reset.");
    });

    btnClearStiPanel.addEventListener('click', () => {
        if(confirm("Are you sure you want to clear your last full panel entry? This will revert your screening counter.")) {
            state.profile.lastStiTestDate = null;
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

    // Dynamic Form
    partnerStatusSelect.addEventListener('change', (e) => {
        if(e.target.value === 'positive_undetectable' || e.target.value === 'positive_detectable') {
            partnerPrepGroup.style.display = 'none';
        } else {
            partnerPrepGroup.style.display = 'block';
        }
    });

    // Log Encounter
    encounterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const partnerStatus = document.getElementById('partner-status').value;
        const partnerPrep = document.getElementById('partner-prep').value;
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
            partnerPrep: partnerStatus.includes('positive') ? 'n/a' : partnerPrep,
            partnerSti: partnerSti.value,
            actType,
            condomUse,
            riskScore: calculateEncounterRisk(partnerStatus, partnerGender, partnerPrep, partnerSti.value, actType, condomUse)
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

    // Test Negative
    btnTestNegative.addEventListener('click', () => {
        if(confirm("Logging a negative test clears old encounters. Encounters within the last 30 days will REMAIN on your dash due to testing window periods and potential false negatives. Proceed?")) {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 30);
            
            state.encounters = state.encounters.filter(e => new Date(e.date) > cutoffDate);
            state.lastTestDate = new Date().toISOString();
            saveState();
        }
    });
}

function recalculateRiskHistory() {
    if (!state.encounters) return;
    state.encounters = state.encounters.map(enc => {
        enc.riskScore = calculateEncounterRisk(enc.partnerStatus, enc.partnerGender || 'cis_male', enc.partnerPrep, enc.partnerSti || 'unknown', enc.actType, enc.condomUse);
        return enc;
    });
}

// Medical Heuristic Calculation
function calculateEncounterRisk(partnerStatus, partnerGender, partnerPrep, partnerSti, actType, condomUse) {
    if (partnerStatus === 'positive_undetectable') return 0;
    if (partnerStatus === 'negative') return 0;

    let baseRisk = 0;
    switch(actType) {
        case 'receptive_anal': baseRisk = 100; break;
        case 'insertive_anal': baseRisk = 40; break;
        case 'receptive_vaginal': baseRisk = 20; break;
        case 'insertive_vaginal': baseRisk = 10; break;
        case 'giving_oral': baseRisk = 2; break;
        case 'receiving_oral': baseRisk = 0; break;
        case 'shared_needles': baseRisk = 100; break;
        default: baseRisk = 0; break;
    }

    if (actType !== 'shared_needles') {
        if (condomUse === 'yes') baseRisk *= 0.1;
        if (condomUse === 'broke') baseRisk *= 0.5;

        // Circumcision mitigation
        if (state.profile.gender === 'cis_male' && state.profile.circumcised && actType === 'insertive_vaginal') {
            baseRisk *= 0.4; // 60% reduction
        }
        
        // STI multiplier
        if (state.profile.sti || partnerSti === 'yes') {
            baseRisk *= 3.0;
        }
    }

    if (partnerStatus === 'positive_detectable') baseRisk *= 2;
    if (partnerStatus === 'unknown') {
        if (partnerPrep === 'yes') {
            baseRisk *= 0.1;
        } else {
            // WHO Key Population Multiplier for unknown status
            const isKP = isKeyPopulationEncounter(state.profile.gender || 'cis_male', partnerGender);
            const kpMultiplier = isKP ? 2.0 : 1.0;
            baseRisk *= kpMultiplier;
        }
    }

    return baseRisk;
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
    const list = document.getElementById('guidance-list');
    if (!list) return;
    
    const uGender = state.profile.gender || 'cis_male';
    const profileHasSexWith = state.profile.hasSexWith || [];
    const encounterPartnerGenders = state.encounters ? state.encounters.map(e => e.partnerGender) : [];
    const effectiveHasSexWith = [...new Set([...profileHasSexWith, ...encounterPartnerGenders])];
    const isVirgin = state.profile.isVirgin;
    const profileFactors = getProfileRiskFactors();
    
    // Check if user is clinically part of a Key Population network
    let isUserInKeyNetwork = effectiveHasSexWith.some(pg => isKeyPopulationEncounter(uGender, pg));
    if (uGender.startsWith('trans_')) isUserInKeyNetwork = true;
    
    // WHO clinical indicators for PrEP eligibility
    const isPrEPCandidate = profileFactors.includes('msm') || 
                            profileFactors.includes('trans_woman') || 
                            profileFactors.includes('pwid') || 
                            profileFactors.includes('active_sti');

    // Messages organized by Priority
    let level1 = []; // Emergency (Red Box)
    let level2 = []; // Clinical Warnings (High Priority)
    let level3 = []; // Advice (Prevention & Partner Safety)
    let stiMaintenance = []; // Routine (STI History)

    const now = new Date();
    let hasRecentKPEncounter = false;
    let hasPenetrativeReceptiveRole = false;
    let totalRiskScore = 0;

    if (state.encounters) {
        state.encounters.forEach(enc => {
            const encDate = new Date(enc.date);
            const diffHours = (now - encDate) / (1000 * 60 * 60);
            const encIsKP = isKeyPopulationEncounter(uGender, enc.partnerGender);
            
            if (encIsKP) hasRecentKPEncounter = true;
            if (diffHours <= 720 && (enc.actType === 'receptive_anal' || enc.actType === 'receptive_vaginal')) {
                hasPenetrativeReceptiveRole = true;
            }
            
            totalRiskScore += enc.riskScore || 0;

            if (diffHours <= 72 && enc.riskScore >= 20) {
                level1.push(`<li style="background: rgba(255, 59, 48, 0.1); border: 1px solid var(--danger-color); padding: 10px; border-radius: 8px; margin-bottom: 10px; list-style:none;">
                    <strong style="color:var(--danger-color)">🚨 EMERGENCY PEP WINDOW:</strong> 
                    You had a high-risk exposure within the last 3 days. Go to an emergency room or clinic <strong>RIGHT NOW</strong> to ask for <strong>PEP (Post-Exposure Prophylaxis)</strong>.
                </li>`);
            } else if (diffHours <= 720 && enc.riskScore >= 20) {
                level2.push(`<li><strong style="color:var(--warning-color)">Testing Timeline:</strong> You had a notable exposure recently. Schedule an HIV test now.</li>`);
            }
        });
    }

    // --- PROACTIVE PROFILE-BASED ADVICE (Level 2 & 3) ---
    
    // PrEP Recommendation (Proactive)
    if (!state.profile.onPrep) {
        if (isPrEPCandidate) {
            const factorLabels = {
                'msm': 'Men who have sex with men (MSM)',
                'trans_woman': 'Transgender Women',
                'pwid': 'People who inject drugs',
                'active_sti': 'Active STI history'
            };
            const displayFactors = profileFactors.map(f => factorLabels[f] || f.replace(/_/g, ' '));
            level3.push(`<li><strong style="color:var(--accent-color)">WHO PrEP Recommendation:</strong> Based on your profile (${displayFactors.join(', ')}), daily <strong>PrEP</strong> is highly recommended. It is a powerful tool to stay HIV-free regardless of individual encounter outcomes.</li>`);
        }
    } else {
        level3.push('<li><strong style="color:var(--success-color)">On PrEP:</strong> Great job taking your daily PrEP. Remember, while it protects you from HIV, condoms are still needed for protection against other STIs like Syphilis and Gonorrhea.</li>');
    }

    // Specific Clinical Factors
    if (state.profile.pwid) {
        level2.push('<li><strong style="color:var(--danger-color)">Harm Reduction:</strong> Sharing needles is high risk. Use clean equipment every time. Look for a local "Needle Exchange" program for free, sterile supplies.</li>');
    }
    if (state.profile.sti) {
        level2.push('<li><strong style="color:var(--warning-color)">Active STI:</strong> Untreated STIs cause inflammation that makes it significantly easier for HIV to enter the bloodstream. Complete your treatment before having sex again.</li>');
    }

    // Role-based Advice
    if (state.profile.role === 'receptive' && (hasPenetrativeReceptiveRole || !isVirgin)) {
        level3.push('<li><strong>Receiving Risk:</strong> Receptive penetrative sex (anal or vaginal) carries a higher biological risk. Ensure consistent condom use if not on PrEP.</li>');
    }

    // Key Population Network Advice
    if (isUserInKeyNetwork && !isVirgin) {
        level3.push('<li><strong style="color:var(--accent-color)">Network Safety:</strong> Since you or your partners are part of a key population, WHO recommends a full STI screening every 3 to 6 months.</li>');
    }

    // --- VIRGIN STATUS ADVICE ---
    if (isVirgin) {
        level3.push('<li><strong>Sexual Debut:</strong> Since you have no sexual history, your current risk is zero. This is the perfect time to establish a prevention plan (like starting PrEP) before your first encounter.</li>');
    }

    // --- STI MAINTENANCE (Level 4) ---
    if (!isVirgin || state.encounters.length > 0) {
        let encountersSinceTest = 0;
        const lastStiDate = state.profile.lastStiTestDate ? new Date(state.profile.lastStiTestDate) : null;
        encountersSinceTest = lastStiDate ? state.encounters.filter(e => new Date(e.date) > lastStiDate).length : state.encounters.length;

        if (encountersSinceTest > 0) {
            stiMaintenance.push(`<li><strong>Screening Check:</strong> You have logged <strong>${encountersSinceTest} partner${encountersSinceTest === 1 ? '' : 's'}</strong> since your last full STI check. Consider a routine panel.</li>`);
        }

        const quarterlyCutoff = new Date();
        quarterlyCutoff.setDate(quarterlyCutoff.getDate() - 90);
        if (!lastStiDate || lastStiDate < quarterlyCutoff) {
            if (isPrEPCandidate) {
                stiMaintenance.push('<li><strong style="color:var(--warning-color)">Overdue Screening:</strong> Quarterly screenings are the standard for PrEP users and key populations.</li>');
            }
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

    // Assembler
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
    let totalRiskScore = 0;
    
    // Accumulate risk from encounters
    state.encounters.forEach(enc => {
        totalRiskScore += enc.riskScore || 0;
    });

    // Apply personal PrEP protection (approx 99% effective)
    if (state.profile.onPrep) {
        totalRiskScore *= 0.01;
    }

    // Determine level
    let level = 'low';
    let percent = 25; 
    let colorClass = 'risk-level-low';
    let text = "Low";
    let desc = state.profile.onPrep 
        ? "PrEP provides excellent protection when taken daily. Your risk remains very low."
        : "You are maintaining low risk practices.";

    if (totalRiskScore > 0 && totalRiskScore < 20) {
        // Minor risk added
        level = 'low';
        percent = 40;
        text = "Low";
        desc = "Your risk remains low, but continue to use preventative measures.";
    } else if (totalRiskScore >= 20 && totalRiskScore < 60) {
        level = 'medium';
        percent = 65;
        colorClass = 'risk-level-medium';
        text = "Moderate";
        desc = "You've logged encounters with moderate risk elements. Consider getting tested or evaluating PrEP.";
    } else if (totalRiskScore >= 60) {
        level = 'high';
        percent = 90;
        colorClass = 'risk-level-high';
        text = "High";
        desc = "Recent encounters pose a significant risk. Please consult a healthcare provider for testing or PEP/PrEP options immediately.";
    }

    // Update UI
    riskMeter.parentElement.classList.remove('risk-level-low', 'risk-level-medium', 'risk-level-high');
    riskMeter.parentElement.classList.add(colorClass);
    
    riskMeter.style.strokeDasharray = `${percent}, 100`;
    riskText.textContent = text;
    riskDesc.textContent = desc;
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
            riskBadge = `<span class="encounter-risk-badge badge-low">No/Low Risk</span>`;
        } else if (actRiskScore < 20) {
            riskBadge = `<span class="encounter-risk-badge badge-low">Low Risk</span>`;
        } else if (actRiskScore < 60) {
            riskBadge = `<span class="encounter-risk-badge badge-medium">Mod Risk</span>`;
        } else {
            riskBadge = `<span class="encounter-risk-badge badge-high">High Risk</span>`;
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
            
            if (enc.partnerStatus.includes('positive')) {
                partnerPrepGroup.style.display = 'none';
            } else {
                partnerPrepGroup.style.display = 'block';
                document.getElementById('partner-prep').value = enc.partnerPrep;
            }
            
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
