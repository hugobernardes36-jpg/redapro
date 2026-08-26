const prisma = require('../lib/prisma');
const validarRedacao = require('../validators/redacao.validator');

async function criarRedacaoAutorizada({ userId, tema, texto }) {
    const validacao = validarRedacao({ tema, texto });
    if (!validacao.valida) {
        const error = new Error('Redação inválida.');
        error.status = 400;
        error.details = validacao.erros;
        throw error;
    }

    // ✅ NÃO desconta crédito aqui - apenas cria a redação
    // O desconto é controlado em executarCorrecao() após triagens passarem
    const redacao = await prisma.redacao.create({
        data: { userId, tema, texto },
    });

    console.log(`[SUBMISSION] Redação ${redacao.id} criada para userId ${userId}. Crédito será descontado apenas após triagens serem aprovadas.`);

    return { redacao, consumo: null };
}

module.exports = { criarRedacaoAutorizada };