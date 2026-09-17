const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  passwordHash: {
    type: String,
    required: function() {
      return this.authProvider === 'local';
    },
  },
  authProvider: {
    type: String,
    enum: ['local', 'google', 'both'],
    default: 'local',
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ['user'],
    default: 'user',
  },
  status: {
    type: String,
    enum: ['active', 'blocked', 'deleted'],
    default: 'active',
  },
  blockedUntil: {
    type: Date,
  },
  mobile: {
    type: String,
  },
  profileImage: {
    type: String,
  },
  address: {
    addressLine1: String,
    addressLine2: String,
    landmark: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },
  profileUpdates: [{
    type: Date
  }]
}, { timestamps: true });

userSchema.index({ createdAt: -1 });
userSchema.index({ status: 1 });
userSchema.index({ email: 1, status: 1 });

module.exports = mongoose.model('User', userSchema);
