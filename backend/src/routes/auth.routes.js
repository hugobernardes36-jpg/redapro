const express = require('express');
const router = express.Router();

const { csrf, me } = require('../controllers/auth.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

router.get('/csrf', csrf);
router.get('/me', requireAuth, me);

module.exports = router;

