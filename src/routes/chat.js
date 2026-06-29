const express = require('express');
const router = express.Router();
const { chat, chatLimiter } = require('../controllers/chatController');

// Public route — rate limited
router.post('/', chatLimiter, chat);

module.exports = router;
