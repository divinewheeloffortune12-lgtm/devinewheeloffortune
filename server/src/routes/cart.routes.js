const router = require('express').Router();
const { requireUser } = require('../middleware/auth.middleware');
const controller = require('../controllers/cart.controller');
router.use(requireUser);
router.get('/', controller.getCart);
router.post('/items', controller.addItem);
router.patch('/items/:itemId', controller.updateItem);
router.delete('/items/:itemId', controller.removeItem);
module.exports = router;
