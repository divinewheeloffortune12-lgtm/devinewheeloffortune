const mongoose = require('mongoose');
const ServiceBooking = require('../models/ServiceBooking');
const Service = require('../models/Service');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Setup Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy',
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
    
    if (!customerName || !mobile || !serviceId || !address) {
      throw Object.assign(new Error('Missing required booking information'), { statusCode: 400 });
    }

    // 1. Verify service exists and get price from backend
    const service = await Service.findById(serviceId);
    if (!service || !service.isActive) {
      throw Object.assign(new Error('Selected service is invalid or unavailable'), { statusCode: 400 });
    }

    const amount = service.price;

    // 2. Create Razorpay Order
    const razorpayOptions = {
      amount: amount * 100, // in paise
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
      customerName,
      mobile,
      service: service._id,
      address,
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

    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy';
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', secret)
                                    .update(body.toString())
                                    .digest('hex');
                                    
    const isAuthentic = expectedSignature === razorpay_signature;
    
    if (!isAuthentic) {
      throw Object.assign(new Error('Invalid payment signature'), { statusCode: 400 });
    }
    
    // Verify order
    const booking = await ServiceBooking.findOne({ razorpayOrderId: razorpay_order_id });
    if (!booking) {
      throw Object.assign(new Error('Booking not found'), { statusCode: 404 });
    }
    
    // Update status safely
    booking.paymentStatus = 'PAID';
    booking.status = 'CONFIRMED';
    booking.razorpayPaymentId = razorpay_payment_id;
    await booking.save();
    
    res.json({
      success: true,
      message: 'Payment verified and booking confirmed successfully',
      data: { bookingId: booking._id }
    });
    
  } catch (error) {
    next(error);
  }
};
