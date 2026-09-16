const express = require('express');
const { getProfile, updateProfile, getMyOrders } = require('../controllers/profile.controller');
const { requireUser } = require('../middleware/auth.middleware');

const router = express.Router();

// All profile routes require authentication
router.use(requireUser);

router.get('/', getProfile);
router.get('/orders', getMyOrders);
router.patch('/', updateProfile);

module.exports = router;
