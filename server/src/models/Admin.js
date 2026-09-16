const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['super_admin', 'staff'],
    default: 'super_admin',
  },
  status: {
    type: String,
    enum: ['active', 'disabled'],
    default: 'active',
  },
}, { timestamps: true });

module.exports = mongoose.model('AdminUser', adminSchema);
