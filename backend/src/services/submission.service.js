const prisma = require('../lib/prisma');
const validarRedacao = require('../validators/redacao.validator');
const { reservarCreditoNaTransacao } = require('./credit.service');

async function criarRedacaoAutorizada({ userId, tema, texto }) {
    const validacao = validarRedacao({ tema, texto });
    if (!validacao.valida) {
        const error = new Error('Redação inválida.');
        error.status = 400;
        error.details = validacao.erros;
        throw error;
    }

    return prisma.$transaction(async (tx) => {
        const redacao = await tx.redacao.create({
            data: { userId, tema, texto },
        });
        const consumo = await reservarCreditoNaTransacao(tx, userId, redacao.id);
        return { redacao, consumo };
    });
}

module.exports = { criarRedacaoAutorizada };