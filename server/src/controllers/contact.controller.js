const { validationResult } = require('express-validator');
const ContactMessage = require('../models/ContactMessage');
exports.createMessage = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Please correct the highlighted fields', details: errors.array() } });
    const message = await ContactMessage.create({ name: req.body.name, email: req.body.email, phone: req.body.phone, subject: req.body.subject, message: req.body.message });
    res.status(201).json({ success: true, data: { id: message._id }, message: 'Your message has been received.' });
  } catch (error) { next(error); }
};
