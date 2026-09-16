const router = require('express').Router();
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { createMessage } = require('../controllers/contact.controller');
const limiter = rateLimit({ windowMs: 24 * 60 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false, message: { success: false, error: { code: 'RATE_LIMITED', message: 'You can only send 100 messages per day.' } } });
router.post('/', limiter, [body('name').trim().isLength({ min: 2, max: 100 }), body('email').isEmail().normalizeEmail(), body('phone').optional({ checkFalsy: true }).trim().isLength({ max: 25 }), body('subject').trim().isLength({ min: 3, max: 160 }), body('message').trim().isLength({ min: 10, max: 3000 })], createMessage);
module.exports = router;
