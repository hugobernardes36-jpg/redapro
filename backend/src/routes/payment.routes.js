const express = require('express');
const { requireAuth } = require('../middlewares/auth.middleware');
const { csrfProtection } = require('../middlewares/csrf.middleware');
const { checkout, webhook } = require('../controllers/payment.controller');

const router = express.Router();
router.post('/webhook', webhook);
router.use(requireAuth);
router.use(csrfProtection);
router.post('/checkout', checkout);

module.exports = router;
