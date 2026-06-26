const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const {
  submitBooking, getAllBookings, updateBookingStatus,
} = require('../controllers/bookingController');

// Rate limit visitor inquiry submissions — 3 per hour per IP
const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { success: false, message: 'Too many inquiries submitted. Please try again in an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public — visitor contact form
router.post('/', bookingLimiter, submitBooking);

// Admin-protected — view and manage inquiries
router.get('/',        authMiddleware, getAllBookings);
router.patch('/:id/status', authMiddleware, updateBookingStatus);

module.exports = router;
