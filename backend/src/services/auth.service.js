const prisma = require('../lib/prisma');

function normalizarEmail(email) {
    return String(email).trim().toLowerCase();
}

// Nunca inclui password/hash/tokens internos na resposta pública do usuário.
function paraRespostaPublica(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
    };
}

async function sincronizarUsuarioClerk({ clerkUserId, email, name, emailVerified = false }) {
    const emailNormalizado = normalizarEmail(email);
    const porClerk = await prisma.user.findUnique({ where: { clerkUserId } });
    if (porClerk) {
        return prisma.user.update({ where: { id: porClerk.id }, data: { name, emailVerified } });
    }

    const porEmail = await prisma.user.findUnique({ where: { email: emailNormalizado } });
    if (porEmail) {
        if (!emailVerified) {
            const erro = new Error('Verifique o e-mail da conta Clerk antes de acessar os dados existentes.');
            erro.status = 409;
            throw erro;
        }
        return prisma.user.update({ where: { id: porEmail.id }, data: { clerkUserId, name, emailVerified } });
    }

    try {
        return await prisma.user.create({ data: { clerkUserId, email: emailNormalizado, name, emailVerified } });
    } catch (error) {
        if (error.code === 'P2002') {
            const existente = await prisma.user.findUnique({ where: { clerkUserId } });
            if (existente) return existente;
        }
        throw error;
    }
}

async function buscarUsuarioPorId(id) {
    return prisma.user.findUnique({ where: { id: Number(id) } });
}

module.exports = {
    sincronizarUsuarioClerk,
    buscarUsuarioPorId,
    paraRespostaPublica,
};
