const express = require('express');

const router = express.Router();

const {
    listarRedacoes,
    buscarRedacao,
    obterEstatisticas,
    criarEExecutarCorrecao
} = require('../controllers/redacao.controller');

const {
    executarCorrecao
} = require('../services/correcao.service');

const { requireAuth } = require('../middlewares/auth.middleware');
const { csrfProtection } = require('../middlewares/csrf.middleware');
const { readRateLimiter, aiRateLimiterPerUser, aiRateLimiterPerIp } = require('../middlewares/rateLimit.middleware');

// Todas as rotas de redação exigem um usuário autenticado + token CSRF válido para métodos de escrita.
router.use(requireAuth);
router.use(csrfProtection);
router.use(readRateLimiter);

// GET /api/redacoes — listar redações do usuário autenticado
router.get('/', listarRedacoes);

// GET /api/redacoes/stats — estatísticas do dashboard do usuário autenticado
router.get('/stats', obterEstatisticas);

// GET /api/redacoes/:id — buscar redação por ID (somente se pertencer ao usuário autenticado)
router.get('/:id', buscarRedacao);

// POST /api/redacoes — criar nova redação vinculada ao usuário autenticado
router.post('/', aiRateLimiterPerUser, aiRateLimiterPerIp, criarEExecutarCorrecao);

// POST /api/redacoes/corrigir — autoriza crédito e cria a redação atomicamente.
router.post('/corrigir', aiRateLimiterPerUser, aiRateLimiterPerIp, criarEExecutarCorrecao);

// POST /api/redacoes/:id/corrigir — corrigir redação com IA (protegida por rate limit + cota diária)
router.post('/:id/corrigir', aiRateLimiterPerUser, aiRateLimiterPerIp, async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(404).json({ erro: 'Redação não encontrada' });
        }

        // Propriedade da redação e cota diária são verificadas dentro do service (anti-IDOR).
        const resultado = await executarCorrecao(id, req.user.id);

        return res.status(200).json(resultado);

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ erro: error.message, codigo: error.code });
        }

        console.error(error);

        return res.status(500).json({
            erro: 'Erro ao corrigir redação'
        });
    }
});

module.exports = router;