const router = require('express').Router();
const controller = require('../controllers/order.controller');
const { requireUser } = require('../middleware/auth.middleware');

router.use(requireUser); // Must be logged in

router.post('/create', controller.createOrder);
router.post('/verify-payment', controller.verifyPayment);
router.get('/', controller.getUserOrders);

module.exports = router;
