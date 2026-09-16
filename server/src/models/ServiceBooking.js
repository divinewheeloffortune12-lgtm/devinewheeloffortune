const mongoose = require('mongoose');

const serviceBookingSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
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
  
}, { timestamps: true });

module.exports = mongoose.model('ServiceBooking', serviceBookingSchema);
