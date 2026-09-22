const mongoose = require('mongoose');

const serviceBookingSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String, required: true },
  notes: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  address: { type: String, required: true },
  
  amount: { type: Number, required: true },
  
  status: {
    type: String,
    enum: ['PENDING_PAYMENT', 'CONFIRMED', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING_PAYMENT',
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PAID', 'FAILED'],
    default: 'PENDING',
  },
  
  razorpayOrderId: { type: String, unique: true, sparse: true },
  razorpayPaymentId: { type: String, unique: true, sparse: true },
  
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  }
}, { timestamps: true });

serviceBookingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('ServiceBooking', serviceBookingSchema);
