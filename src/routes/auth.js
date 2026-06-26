const express = require('express');
const router = express.Router();
const { verifyPin } = require('../controllers/authController');
const rateLimit = require('express-rate-limit');

// Strict rate limit on PIN attempts — 5 tries per 15 minutes per IP
const pinLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/verify-pin', pinLimiter, verifyPin);

module.exports = router;
