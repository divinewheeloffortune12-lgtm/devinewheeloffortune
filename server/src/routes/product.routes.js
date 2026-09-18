const router = require('express').Router();
const { listProducts, getProductBySlug, validateCart } = require('../controllers/product.controller');
const { optionalUser } = require('../middleware/auth.middleware');

router.post('/validate-cart', optionalUser, validateCart);
router.get('/', optionalUser, listProducts);
router.get('/:slug', optionalUser, getProductBySlug);
module.exports = router;
