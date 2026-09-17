const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { paymentLimiter } = require('../middleware/rateLimiter');

// Public route to get services for booking
router.get('/services', bookingController.getAllServices);

// Creating booking order — rate limited to prevent abuse
router.post('/create-order', paymentLimiter, bookingController.createBookingOrder);

// Verifying Razorpay payment
router.post('/verify-payment', bookingController.verifyBookingPayment);

module.exports = router;
