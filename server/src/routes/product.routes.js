const router = require('express').Router();
const { listProducts, getProductBySlug } = require('../controllers/product.controller');
const { optionalUser } = require('../middleware/auth.middleware');

router.get('/', optionalUser, listProducts);
router.get('/:slug', optionalUser, getProductBySlug);
module.exports = router;
