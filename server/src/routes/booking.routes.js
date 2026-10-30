const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { paymentLimiter } = require('../middleware/rateLimiter');
const { requireUser } = require('../middleware/auth.middleware');

const cacheMiddleware = (durationSecs) => (req, res, next) => {
  if (req.app?.locals?.cacheMiddleware) {
    return req.app.locals.cacheMiddleware(durationSecs)(req, res, next);
  }
  next();
};

// Public route to get services for booking (cached 2 min)
router.get('/services', cacheMiddleware(120), bookingController.getAllServices);
router.get('/services/:slug', cacheMiddleware(120), bookingController.getServiceBySlug);

// Creating booking order — rate limited to prevent abuse
router.post('/create-order', requireUser, paymentLimiter, bookingController.createBookingOrder);

// Verifying Razorpay payment
router.post('/verify-payment', bookingController.verifyBookingPayment);

// Get User's Bookings
router.get('/my-bookings', requireUser, bookingController.getUserBookings);

module.exports = router;
