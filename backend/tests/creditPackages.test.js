const test = require('node:test');
const assert = require('node:assert/strict');
const { listCreditPackages, getCreditPackage } = require('../src/config/creditPackages.config');

test('mantém somente os cinco pacotes oficiais', () => {
    assert.deepEqual(listCreditPackages().map((item) => [item.id, item.credits, item.amountCents]), [
        ['credits_1', 1, 490],
        ['credits_5', 5, 1990],
        ['credits_10', 10, 3490],
        ['credits_25', 25, 6990],
        ['credits_50', 50, 11990],
    ]);
});

test('não aceita pacote desconhecido', () => {
    assert.equal(getCreditPackage('credits_999'), null);
    assert.equal(getCreditPackage('credits_10').amountCents, 3490);
});