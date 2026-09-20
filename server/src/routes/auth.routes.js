const express = require('express');
const { check } = require('express-validator');
const {
  logout,
  googleAuth,
  getMe,
  adminLogin,
  adminLogout,
  getAdminMe
} = require('../controllers/auth.controller');
const { requireUser, requireAdmin } = require('../middleware/auth.middleware');
const { authLimiter, adminLoginLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Removed local register and login routes
router.post('/google', authLimiter, googleAuth);
router.post('/logout', logout);
router.get('/me', getMe);

// Admin Routes
router.post('/admin/login', adminLoginLimiter, adminLogin);
router.post('/admin/logout', adminLogout);
router.get('/admin/me', requireAdmin, getAdminMe);

module.exports = router;
