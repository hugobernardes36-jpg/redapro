const prisma = require('../lib/prisma');
const validarRedacao = require('../validators/redacao.validator');

function normalizarCorrecao(correcao) {
    if (!correcao) {
        return null;
    }

    const dadosIa = (correcao.dadosIa && typeof correcao.dadosIa === 'object')
        ? correcao.dadosIa
        : {};

    return {
        ...correcao,
        ...dadosIa,
        status: correcao.status || 'CORRIGIDA',
        motivo: correcao.motivo || dadosIa.motivo || null,
        feedbackGeral: dadosIa.feedbackGeral || correcao.feedback || '',
    };
}

async function criarRedacao(req, res) {
    try {
        const { tema, texto } = req.body;
        // O userId nunca é aceito do cliente: vem exclusivamente da sessão autenticada.
        const userId = req.user.id;

        const validacao = validarRedacao({ tema, texto });

        if (!validacao.valida) {
            return res.status(400).json({
                erro: 'Redação inválida',
                detalhes: validacao.erros
            });
        }

        const redacao = await prisma.redacao.create({
            data: {
                userId,
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

async function listarRedacoes(req, res) {
    try {
        // Sempre filtra pelo usuário autenticado; nunca aceita userId vindo do cliente.
        const userId = req.user.id;

        const redacoes = await prisma.redacao.findMany({
            where: { userId },
            include: { correcao: true },
            orderBy: { createdAt: 'desc' }
        });

        const resultado = redacoes.map(r => ({
            id: r.id,
            tema: r.tema,
            texto: r.texto,
            createdAt: r.createdAt,
            status: r.correcao ? r.correcao.status : 'PENDENTE',
            notaFinal: r.correcao ? r.correcao.notaFinal : null,
            correcao: normalizarCorrecao(r.correcao)
        }));

        return res.json(resultado);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            erro: 'Erro ao listar redações'
        });
    }
}

async function buscarRedacao(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(404).json({
                erro: 'Redação não encontrada'
            });
        }

        const redacao = await prisma.redacao.findUnique({
            where: { id },
            include: {
                correcao: true,
                user: { select: { name: true } }
            }
        });

        // Retorna 404 tanto para redação inexistente quanto para redação de outro usuário,
        // evitando revelar a existência de IDs que não pertencem ao solicitante (anti-IDOR).
        if (!redacao || redacao.userId !== req.user.id) {
            return res.status(404).json({
                erro: 'Redação não encontrada'
            });
        }

        const correcaoNormalizada = normalizarCorrecao(redacao.correcao);

        return res.json({
            id: redacao.id,
            tema: redacao.tema,
            texto: redacao.texto,
            createdAt: redacao.createdAt,
            status: correcaoNormalizada ? correcaoNormalizada.status : 'PENDENTE',
            notaFinal: correcaoNormalizada ? correcaoNormalizada.notaFinal : null,
            correcao: correcaoNormalizada,
            usuario: redacao.user.name
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            erro: 'Erro ao buscar redação'
        });
    }
}

async function obterEstatisticas(req, res) {
    try {
        // Estatísticas sempre restritas ao usuário autenticado.
        const userId = req.user.id;

        const redacoes = await prisma.redacao.findMany({
            where: { userId },
            include: { correcao: true },
            orderBy: { createdAt: 'desc' }
        });

        const corrigidas = redacoes.filter(r => r.correcao);
        const notas = corrigidas.map(r => r.correcao.notaFinal);

        const stats = {
            essaysCount: redacoes.length,
            correctedCount: corrigidas.length,
            averageScore: notas.length > 0
                ? Math.round(notas.reduce((a, b) => a + b, 0) / notas.length)
                : 0,
            bestScore: notas.length > 0 ? Math.max(...notas) : 0,
            lastScore: notas.length > 0 ? notas[0] : 0,
        };

        return res.json(stats);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            erro: 'Erro ao obter estatísticas'
        });
    }
}

module.exports = {
    criarRedacao,
    listarRedacoes,
    buscarRedacao,
    obterEstatisticas
};