const { listCreditPackages } = require('../config/creditPackages.config');
const { obterSaldo } = require('../services/credit.service');

async function listarPacotes(req, res) {
    return res.json(listCreditPackages().map((item) => ({
        id: item.id,
        credits: item.credits,
        amountCents: item.amountCents,
        label: item.label,
        recommended: Boolean(item.recommended),
    })));
}

async function saldo(req, res) {
    try {
        return res.json(await obterSaldo(req.user.id));
    } catch (error) {
        console.error('Erro ao consultar saldo de créditos:', error.message);
        return res.status(500).json({ erro: 'Erro ao consultar saldo.' });
    }
}

module.exports = { listarPacotes, saldo };
