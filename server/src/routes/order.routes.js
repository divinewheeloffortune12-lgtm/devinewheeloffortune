const router = require('express').Router();
const controller = require('../controllers/order.controller');
const { requireUser, requireAdmin } = require('../middleware/auth.middleware');
const { paymentLimiter, receiptLimiter } = require('../middleware/rateLimiter');

// Public route for Razorpay webhook — NO auth, NO CSRF, NO rate limit
// (Razorpay servers call this directly; body parsing handled specially in app.js)
router.post('/webhook', controller.razorpayWebhook);

// Public route for shipping config — needed on checkout page before order creation
router.get('/shipping-config', async (req, res, next) => {
  try {
    const ShippingConfig = require('../models/ShippingConfig');
    const config = await ShippingConfig.getConfig();
    res.json({ success: true, data: { shippingCharge: 0, freeShippingThreshold: config.freeShippingThreshold } });
  } catch (error) {
    next(error);
  }
});

// SECURITY FIX: shipping-config-reset mutates state — must be admin-only.
// Previously it was unprotected (accessible by anyone on the internet).
router.post('/shipping-config-reset', requireAdmin, async (req, res, next) => {
  try {
    const ShippingConfig = require('../models/ShippingConfig');
    const config = await ShippingConfig.getConfig();
    config.shippingCharge = 0;
    await config.save();
    res.json({ success: true, data: config });
  } catch (error) {
    next(error);
  }
});

router.use(requireUser); // All routes below require user authentication

router.post('/create', paymentLimiter, controller.createOrder);
// SECURITY FIX: Apply paymentLimiter to verify-payment to prevent HMAC verification spam
router.post('/verify-payment', paymentLimiter, controller.verifyPayment);
router.get('/', controller.getUserOrders);
// Add rate limiter to receipt download to prevent data scraping
router.get('/:orderId/receipt', receiptLimiter, controller.getOrderReceipt);
router.post('/:orderId/cancel-request', controller.requestCancellation);

module.exports = router;
