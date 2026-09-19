const mongoose = require('mongoose');

const cancellationRequestSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reason: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser',
  },
  reviewedAt: {
    type: Date,
  },
  comments: {
    type: String, // admin comments on rejection
  }
}, { timestamps: true });

cancellationRequestSchema.index({ status: 1 });
cancellationRequestSchema.index({ order: 1 });
cancellationRequestSchema.index({ user: 1 });

module.exports = mongoose.model('CancellationRequest', cancellationRequestSchema);
