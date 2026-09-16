const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { protect } = require('../middleware/auth.middleware');

// Public route to get services for booking
router.get('/services', bookingController.getAllServices);

// Creating booking order
router.post('/create-order', bookingController.createBookingOrder);

// Verifying Razorpay payment
router.post('/verify-payment', bookingController.verifyBookingPayment);

module.exports = router;
