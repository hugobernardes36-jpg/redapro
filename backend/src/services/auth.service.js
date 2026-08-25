const prisma = require('../lib/prisma');
const { criarLoteGratuito } = require('./credit.service');

function normalizarEmail(email) {
    return String(email).trim().toLowerCase();
}

function paraRespostaPublica(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
    };
}

async function buscarUsuarioPorEmail(email) {
    return prisma.user.findUnique({ where: { email: normalizarEmail(email) } });
}

async function buscarUsuarioPorId(id) {
    return prisma.user.findUnique({ where: { id: Number(id) } });
}

async function criarUsuario({ name, email, password }) {
    return prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                name: String(name).trim(),
                email: normalizarEmail(email),
                password,
                emailVerified: false,
            },
        });

        await criarLoteGratuito(tx, user.id);
        return user;
    });
}

module.exports = {
    buscarUsuarioPorEmail,
    buscarUsuarioPorId,
    criarUsuario,
    normalizarEmail,
    paraRespostaPublica,
};
