const express = require('express');
const { requireAuth } = require('../middlewares/auth.middleware');
const { csrfProtection } = require('../middlewares/csrf.middleware');
const { listarPacotes, saldo } = require('../controllers/credit.controller');

const router = express.Router();
router.use(requireAuth);
router.get('/packages', listarPacotes);
router.get('/', saldo);
router.use(csrfProtection);

module.exports = router;
