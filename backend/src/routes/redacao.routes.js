const express = require('express');

const router = express.Router();

const {
    criarRedacao,
    listarRedacoes,
    buscarRedacao,
    obterEstatisticas
} = require('../controllers/redacao.controller');

const {
    executarCorrecao
} = require('../services/correcao.service');

// GET /api/redacoes?userId=1 — listar redações do usuário
router.get('/', listarRedacoes);

// GET /api/redacoes/stats/:userId — estatísticas do dashboard
router.get('/stats/:userId', obterEstatisticas);

// GET /api/redacoes/:id — buscar redação por ID
router.get('/:id', buscarRedacao);

// POST /api/redacoes — criar nova redação
router.post('/', criarRedacao);

// POST /api/redacoes/:id/corrigir — corrigir redação com IA
router.post('/:id/corrigir', async (req, res) => {
    try {
        const resultado = await executarCorrecao(req.params.id);

        return res.status(200).json(resultado);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            erro: error.message
        });
    }
});

module.exports = router;