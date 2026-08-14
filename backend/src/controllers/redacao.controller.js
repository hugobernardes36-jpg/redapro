const prisma = require('../lib/prisma');
const validarRedacao = require('../validators/redacao.validator');
async function criarRedacao(req, res) {
    try {
        const { userId, tema, texto } = req.body;

        const validacao = validarRedacao({ tema, texto });

if (!validacao.valida) {
    return res.status(400).json({
        erro: 'Redação inválida',
        detalhes: validacao.erros
    });
}

        if (!userId || !tema || !texto) {
            return res.status(400).json({
                erro: 'userId, tema e texto são obrigatórios'
            });
        }

        const redacao = await prisma.redacao.create({
            data: {
                userId: Number(userId),
                tema,
                texto
            }
        });

        return res.status(201).json(redacao);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            erro: 'Erro ao criar redação'
        });
    }
}

module.exports = {
    criarRedacao
};