const router = require('express').Router();
const controller = require('../controllers/order.controller');
const { requireUser } = require('../middleware/auth.middleware');
const { paymentLimiter } = require('../middleware/rateLimiter');

// Public route for Razorpay webhook — NO auth, NO CSRF, NO rate limit
// (Razorpay servers call this directly; body parsing handled specially in app.js)
router.post('/webhook', controller.razorpayWebhook);

// Public route for shipping config — needed on checkout page before order creation
router.get('/shipping-config', async (req, res, next) => {
  try {
    const ShippingConfig = require('../models/ShippingConfig');
    const config = await ShippingConfig.getConfig();
    res.json({ success: true, data: { shippingCharge: config.shippingCharge, freeShippingThreshold: config.freeShippingThreshold } });
  } catch (error) {
    next(error);
  }
});

router.use(requireUser); // Must be logged in

router.post('/create', paymentLimiter, controller.createOrder);
router.post('/verify-payment', controller.verifyPayment);
router.get('/', controller.getUserOrders);
router.get('/:orderId/receipt', controller.getOrderReceipt);

module.exports = router;
