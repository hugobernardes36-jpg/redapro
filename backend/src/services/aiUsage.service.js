const prisma = require('../lib/prisma');
const { DAILY_AI_CORRECTION_LIMIT } = require('../config/aiLimits.config');

function obterDataDeHoje() {
    const agora = new Date();
    return new Date(Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate()));
}

// Incrementa o contador diário de forma atômica: o UPDATE condicional é uma única
// operação no MySQL, então concorrência (inclusive entre múltiplas instâncias do
// backend) não permite ultrapassar o limite configurado.
async function consumirCotaDiaria(userId) {
    const hoje = obterDataDeHoje();

    const atualizado = await prisma.aiUsage.updateMany({
        where: { userId, date: hoje, count: { lt: DAILY_AI_CORRECTION_LIMIT } },
        data: { count: { increment: 1 } },
    });

    if (atualizado.count > 0) {
        return true;
    }

    try {
        await prisma.aiUsage.create({ data: { userId, date: hoje, count: 1 } });
        return true;
    } catch (error) {
        // P2002 = unique constraint (userId, date): outra requisição criou o registro primeiro.
        if (error.code !== 'P2002') {
            throw error;
        }

        const segundaTentativa = await prisma.aiUsage.updateMany({
            where: { userId, date: hoje, count: { lt: DAILY_AI_CORRECTION_LIMIT } },
            data: { count: { increment: 1 } },
        });

        return segundaTentativa.count > 0;
    }
}

module.exports = { consumirCotaDiaria };
