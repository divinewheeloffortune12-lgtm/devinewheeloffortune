const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { paymentLimiter } = require('../middleware/rateLimiter');
const { optionalUser } = require('../middleware/auth.middleware');

// Public route to get services for booking
router.get('/services', bookingController.getAllServices);

// Creating booking order — rate limited to prevent abuse
router.post('/create-order', optionalUser, paymentLimiter, bookingController.createBookingOrder);

// Verifying Razorpay payment
router.post('/verify-payment', bookingController.verifyBookingPayment);

// Get User's Bookings
const { requireUser } = require('../middleware/auth.middleware');
router.get('/my-bookings', requireUser, bookingController.getUserBookings);

module.exports = router;
