const mongoose = require('mongoose');
const ServiceBooking = require('../models/ServiceBooking');
const Service = require('../models/Service');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Setup Razorpay — no dummy fallbacks
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('CRITICAL: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set');
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.getAllServices = async (req, res, next) => {
  try {
    const services = await Service.find({ isActive: true });
    res.json({ success: true, data: services });
  } catch (error) {
    next(error);
  }
};

exports.createBookingOrder = async (req, res, next) => {
  try {
    const { customerName, mobile, serviceId, address } = req.body;
    
    if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
      throw Object.assign(new Error('A valid name is required'), { statusCode: 400 });
    }
    if (!mobile || typeof mobile !== 'string' || mobile.trim().length < 10) {
      throw Object.assign(new Error('A valid mobile number is required'), { statusCode: 400 });
    }
    if (!serviceId || !mongoose.isValidObjectId(serviceId)) {
      throw Object.assign(new Error('A valid service must be selected'), { statusCode: 400 });
    }
    if (!address || typeof address !== 'string' || address.trim().length < 5) {
      throw Object.assign(new Error('A valid address is required'), { statusCode: 400 });
    }

    // 1. Verify service exists and get price from backend
    const service = await Service.findById(serviceId);
    if (!service || !service.isActive) {
      throw Object.assign(new Error('Selected service is invalid or unavailable'), { statusCode: 400 });
    }

    const amount = service.price;

    // 2. Create Razorpay Order
    const razorpayOptions = {
      amount: Math.round(amount * 100), // in paise
      currency: "INR",
      receipt: `BKG-${Date.now()}`,
    };
    
    let rzpOrder;
    try {
      rzpOrder = await razorpay.orders.create(razorpayOptions);
    } catch (rzpError) {
      console.error('Razorpay Error:', rzpError);
      throw Object.assign(new Error('Unable to initiate payment gateway. Please verify payment configuration.'), { 
        statusCode: 502, 
        isOperational: true,
        code: 'PAYMENT_GATEWAY_ERROR' 
      });
    }

    // 3. Create Booking Record
    const booking = new ServiceBooking({
      customerName: customerName.trim(),
      mobile: mobile.trim(),
      service: service._id,
      address: address.trim(),
      amount,
      razorpayOrderId: rzpOrder.id,
      status: 'PENDING_PAYMENT',
      paymentStatus: 'PENDING'
    });

    await booking.save();

    res.status(201).json({
      success: true,
      data: {
        bookingId: booking._id,
        amount: booking.amount,
        razorpayOrderId: rzpOrder.id,
        key: process.env.RAZORPAY_KEY_ID
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.verifyBookingPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw Object.assign(new Error('Payment verification parameters missing'), { statusCode: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      throw Object.assign(new Error('Payment configuration error'), { statusCode: 500 });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', secret)
                                    .update(body.toString())
                                    .digest('hex');
    
    // Timing-safe comparison
    if (expectedSignature.length !== razorpay_signature.length ||
        !crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpay_signature))) {
      throw Object.assign(new Error('Invalid payment signature'), { statusCode: 400 });
    }
    
    // Idempotent update — only update if still PENDING
    const booking = await ServiceBooking.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id, paymentStatus: 'PENDING' },
      {
        $set: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
          razorpayPaymentId: razorpay_payment_id,
        }
      },
      { new: true }
    );

    if (!booking) {
      // Either not found or already paid
      const existing = await ServiceBooking.findOne({ razorpayOrderId: razorpay_order_id });
      if (!existing) {
        throw Object.assign(new Error('Booking not found'), { statusCode: 404 });
      }
      // Already paid — return success (idempotent)
      return res.json({
        success: true,
        message: 'Payment already verified',
        data: { bookingId: existing._id }
      });
    }
    
    res.json({
      success: true,
      message: 'Payment verified and booking confirmed successfully',
      data: { bookingId: booking._id }
    });
    
  } catch (error) {
    next(error);
  }
};
