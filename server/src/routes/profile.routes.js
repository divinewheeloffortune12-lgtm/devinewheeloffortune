const express = require('express');
const { getProfile, updateProfile, getMyOrders } = require('../controllers/profile.controller');
const { requireUser } = require('../middleware/auth.middleware');

const router = express.Router();

// All profile routes require authentication
router.use(requireUser);

router.get('/', getProfile);
router.get('/orders', getMyOrders);
router.patch('/', updateProfile);

// Liked Products
const { addLike, removeLike } = require('../controllers/profile.controller');
router.post('/likes/:productId', addLike);
router.delete('/likes/:productId', removeLike);

module.exports = router;
