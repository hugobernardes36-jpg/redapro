const CREDIT_PACKAGES = Object.freeze({
    credits_1: Object.freeze({ id: 'credits_1', credits: 1, amountCents: 490, label: '1 correção' }),
    credits_5: Object.freeze({ id: 'credits_5', credits: 5, amountCents: 1990, label: '5 correções' }),
    credits_10: Object.freeze({ id: 'credits_10', credits: 10, amountCents: 3490, label: '10 correções', recommended: true }),
    credits_25: Object.freeze({ id: 'credits_25', credits: 25, amountCents: 6990, label: '25 correções' }),
    credits_50: Object.freeze({ id: 'credits_50', credits: 50, amountCents: 11990, label: '50 correções' }),
});

function getCreditPackage(packageId) {
    return CREDIT_PACKAGES[packageId] || null;
}

function listCreditPackages() {
    return Object.values(CREDIT_PACKAGES);
}

module.exports = { CREDIT_PACKAGES, getCreditPackage, listCreditPackages };