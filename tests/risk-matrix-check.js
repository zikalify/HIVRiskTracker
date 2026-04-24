const fs = require('fs');
const path = require('path');
const vm = require('vm');

function makeStubElement() {
    return {
        value: '',
        checked: false,
        style: {},
        innerHTML: '',
        textContent: '',
        className: '',
        classList: { add() {}, remove() {} },
        addEventListener() {},
        querySelector() { return makeStubElement(); },
        querySelectorAll() { return []; },
        appendChild() {},
        reset() {}
    };
}

function loadAppContext() {
    const appPath = path.join(__dirname, '..', 'app.js');
    let appCode = fs.readFileSync(appPath, 'utf8');

    // Prevent browser boot side effects in Node test context.
    appCode = appCode.replace(/init\(\);/g, '');

    const context = {
        console,
        window: { addEventListener() {}, location: { search: '' } },
        navigator: { serviceWorker: {} },
        document: {
            getElementById() { return makeStubElement(); },
            querySelector() { return makeStubElement(); },
            querySelectorAll() { return []; },
            addEventListener() {}
        },
        localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
        Notification: function Notification() {},
        confirm: () => true,
        alert: () => {},
        setInterval: () => 0,
        clearInterval: () => {},
        URLSearchParams,
        Blob: function Blob() {},
        URL: { createObjectURL() { return ''; }, revokeObjectURL() {} },
        Date,
        Math,
        JSON
    };

    vm.createContext(context);
    vm.runInContext(appCode, context);
    vm.runInContext('globalThis.__setGender = (g) => { state.profile.gender = g; };', context);
    return context;
}

function runMatrix() {
    const ctx = loadAppContext();

    const userGenders = ['cis_male', 'cis_female', 'trans_male', 'trans_female', 'non_binary'];
    const partnerGenders = ['cis_male', 'cis_female', 'trans_male', 'trans_female', 'non_binary'];
    const acts = [
        'receptive_anal',
        'insertive_anal',
        'receptive_vaginal',
        'insertive_vaginal',
        'giving_oral',
        'receiving_oral',
        'shared_needles',
        'other'
    ];
    const condoms = ['yes', 'no', 'broke'];
    const statuses = ['negative', 'unknown', 'positive_undetectable', 'positive_detectable'];
    const stis = ['no', 'unknown', 'yes'];

    const rows = [];

    for (const ug of userGenders) {
        ctx.__setGender(ug);
        for (const pg of partnerGenders) {
            for (const act of acts) {
                for (const condom of condoms) {
                    for (const status of statuses) {
                        for (const sti of stis) {
                            const risk = ctx.calculateEncounterRisk(status, pg, sti, act, condom);
                            const pep = ctx.classifyPEPEligibility({
                                date: new Date().toISOString(),
                                partnerStatus: status,
                                partnerGender: pg,
                                partnerSti: sti,
                                actType: act,
                                condomUse: condom
                            });

                            rows.push({
                                userGender: ug,
                                partnerGender: pg,
                                act,
                                condomUse: condom,
                                partnerStatus: status,
                                partnerSti: sti,
                                risk,
                                pep: !!pep.shouldRecommendPEP
                            });
                        }
                    }
                }
            }
        }
    }

    return rows;
}

function isImplausibleCisCombo(row) {
    return (
        (row.userGender === 'cis_male' && row.act === 'receptive_vaginal') ||
        (row.userGender === 'cis_female' && row.act === 'insertive_vaginal')
    );
}

function findOutliers(rows) {
    const outliers = [];

    for (const row of rows) {
        if (isImplausibleCisCombo(row) && (row.risk !== 0 || row.pep)) {
            outliers.push({ type: 'implausible_combo_escalates', ...row });
        }

        if (
            (row.partnerStatus === 'negative' || row.partnerStatus === 'positive_undetectable') &&
            row.partnerSti !== 'yes' &&
            row.risk !== 0
        ) {
            outliers.push({ type: 'covered_partner_nonzero_risk', ...row });
        }

        if (
            ['giving_oral', 'receiving_oral', 'other'].includes(row.act) &&
            row.pep
        ) {
            outliers.push({ type: 'pep_on_very_low_risk_route', ...row });
        }
    }

    return outliers;
}

function main() {
    const rows = runMatrix();
    const outliers = findOutliers(rows);

    const summary = {
        combinationsChecked: rows.length,
        outlierCount: outliers.length,
        byType: outliers.reduce((acc, item) => {
            acc[item.type] = (acc[item.type] || 0) + 1;
            return acc;
        }, {}),
        maxRiskScore: rows.reduce((max, row) => Math.max(max, row.risk), -Infinity)
    };

    console.log(JSON.stringify(summary, null, 2));

    if (outliers.length > 0) {
        console.error('\nSample outliers:');
        outliers.slice(0, 20).forEach((item, idx) => {
            console.error(`${idx + 1}. ${item.type} :: ${JSON.stringify(item)}`);
        });
        process.exit(1);
    }
}

main();
