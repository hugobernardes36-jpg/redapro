const prisma = require('../lib/prisma');

const FREE_CREDITS = 2;

function createLedgerKey(prefix, value) {
    return `${prefix}:${value}`;
}

async function criarLoteGratuito(tx, userId) {
    const lot = await tx.creditLot.create({
        data: {
            userId,
            type: 'FREE',
            quantityGranted: FREE_CREDITS,
            quantityRemaining: FREE_CREDITS,
        },
    });

    await tx.creditLedgerEntry.create({
        data: {
            idempotencyKey: createLedgerKey('free-grant', userId),
            userId,
            creditLotId: lot.id,
            type: 'FREE_GRANT',
            amount: FREE_CREDITS,
        },
    });

    return lot;
}

async function obterSaldo(userId) {
    const [free, paid] = await Promise.all([
        prisma.creditLot.aggregate({
            where: { userId, type: 'FREE' },
            _sum: { quantityRemaining: true },
        }),
        prisma.creditLot.aggregate({
            where: { userId, type: 'PURCHASE' },
            _sum: { quantityRemaining: true },
        }),
    ]);

    const freeRemaining = free._sum.quantityRemaining || 0;
    const paidCredits = paid._sum.quantityRemaining || 0;

    return {
        freeRemaining,
        paidCredits,
        totalAvailable: freeRemaining + paidCredits,
    };
}

async function reservarCreditoNaTransacao(tx, userId, redacaoId) {
        const candidates = [
            { type: 'FREE', orderBy: { createdAt: 'asc' } },
            { type: 'PURCHASE', orderBy: { createdAt: 'asc' } },
        ];

        for (const candidate of candidates) {
            const lot = await tx.creditLot.findFirst({
                where: {
                    userId,
                    type: candidate.type,
                    quantityRemaining: { gt: 0 },
                },
                orderBy: candidate.orderBy,
            });

            if (!lot) continue;

            const updated = await tx.creditLot.updateMany({
                where: { id: lot.id, quantityRemaining: { gt: 0 } },
                data: { quantityRemaining: { decrement: 1 } },
            });

            if (updated.count !== 1) continue;

            const consumption = await tx.creditConsumption.create({
                data: {
                    userId,
                    redacaoId,
                    creditLotId: lot.id,
                },
            });

            await tx.creditLedgerEntry.create({
                data: {
                    idempotencyKey: createLedgerKey('consumption', consumption.id),
                    userId,
                    creditLotId: lot.id,
                    type: 'CONSUMPTION',
                    amount: -1,
                    redacaoId,
                },
            });

            return consumption;
        }

        const error = new Error('Você ficou sem correções disponíveis.');
        error.code = 'CREDITOS_INSUFICIENTES';
        error.status = 402;
        throw error;
}

async function reservarCredito(userId, redacaoId) {
    return prisma.$transaction((tx) => reservarCreditoNaTransacao(tx, userId, redacaoId));
}

async function finalizarConsumo(consumptionId) {
    return prisma.creditConsumption.update({
        where: { id: consumptionId },
        data: { status: 'CONSUMED', finalizedAt: new Date() },
    });
}

async function reverterConsumo(consumptionId) {
    return prisma.$transaction(async (tx) => {
        const consumption = await tx.creditConsumption.findUnique({ where: { id: consumptionId } });
        if (!consumption || consumption.status !== 'RESERVED') return consumption;

        await tx.creditLot.update({
            where: { id: consumption.creditLotId },
            data: { quantityRemaining: { increment: 1 } },
        });

        await tx.creditConsumption.update({
            where: { id: consumptionId },
            data: { status: 'REVERSED', finalizedAt: new Date() },
        });

        await tx.creditLedgerEntry.create({
            data: {
                idempotencyKey: createLedgerKey('reversal', consumptionId),
                userId: consumption.userId,
                creditLotId: consumption.creditLotId,
                type: 'CONSUMPTION_REVERSAL',
                amount: 1,
                redacaoId: consumption.redacaoId,
            },
        });

        return consumption;
    });
}

async function concederCreditos({ userId, purchaseId, credits }) {
    return prisma.$transaction(async (tx) => {
        const lot = await tx.creditLot.create({
            data: {
                userId,
                type: 'PURCHASE',
                quantityGranted: credits,
                quantityRemaining: credits,
                purchaseId,
            },
        });

        await tx.creditLedgerEntry.create({
            data: {
                idempotencyKey: createLedgerKey('purchase-grant', purchaseId),
                userId,
                creditLotId: lot.id,
                type: 'PURCHASE_GRANT',
                amount: credits,
                purchaseId,
            },
        });

        return lot;
    });
}

module.exports = {
    FREE_CREDITS,
    criarLoteGratuito,
    obterSaldo,
    reservarCreditoNaTransacao,
    reservarCredito,
    finalizarConsumo,
    reverterConsumo,
    concederCreditos,
};
