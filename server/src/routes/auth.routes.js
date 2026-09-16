const express = require('express');
const { check } = require('express-validator');
const { 
  register, 
  login, 
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

router.post('/register', authLimiter, [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], register);

router.post('/login', authLimiter, login);
router.post('/google', authLimiter, googleAuth);
router.post('/logout', logout);
router.get('/me', requireUser, getMe);

// Admin Routes
router.post('/admin/login', adminLoginLimiter, adminLogin);
router.post('/admin/logout', adminLogout);
router.get('/admin/me', requireAdmin, getAdminMe);

module.exports = router;
