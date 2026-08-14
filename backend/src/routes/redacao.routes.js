const express = require('express');

const router = express.Router();

const {
    criarRedacao
} = require('../controllers/redacao.controller');

const {
    executarCorrecao
} = require('../services/correcao.service');

router.post('/', criarRedacao);

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