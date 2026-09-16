const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance
// In a real app, RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be in .env
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

// Create Order (Secure Price Calculation)
exports.createOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { shippingAddress } = req.body;
    if (!shippingAddress) {
      throw Object.assign(new Error('Shipping address is required'), { statusCode: 400 });
    }

    // 1. Fetch User's Cart
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      throw Object.assign(new Error('Cart is empty'), { statusCode: 400 });
    }

    // 2. Securely calculate total from DB
    let totalAmount = 0;
    const orderProducts = [];

    for (const item of cart.items) {
      const product = await Product.findById(item.product._id).session(session);
      if (!product || product.isDeleted || !product.availability) {
        throw Object.assign(new Error(`Product ${item.product.name} is unavailable`), { statusCode: 400 });
      }
      if (product.stock < item.quantity) {
        throw Object.assign(new Error(`Insufficient stock for ${product.name}`), { statusCode: 400 });
      }
      
      // Calculate total securely (ignoring any frontend prices)
      totalAmount += product.price * item.quantity;
      
      orderProducts.push({
        product: product._id,
        quantity: item.quantity,
        priceAtPurchase: product.price
      });
      
      // Decrement stock atomically
      product.stock -= item.quantity;
      await product.save({ session });
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 3. Create Razorpay Order
    const razorpayOptions = {
      amount: totalAmount * 100, // Razorpay works in paise
      currency: "INR",
      receipt: orderNumber,
    };
    
    let rzpOrder;
    try {
      rzpOrder = await razorpay.orders.create(razorpayOptions);
    } catch (rzpError) {
      console.error('Razorpay Error:', rzpError);
      throw Object.assign(new Error('Failed to initiate payment gateway'), { statusCode: 502 });
    }

    // 4. Create Order in our DB
    const order = new Order({
      user: req.user._id,
      products: orderProducts,
      orderNumber,
      totalAmount,
      shippingAddress,
      razorpayOrderId: rzpOrder.id,
      status: 'PENDING_PAYMENT',
      paymentStatus: 'PENDING'
    });

    await order.save({ session });
    
    // Clear cart after order creation
    cart.items = [];
    await cart.save({ session });

    await session.commitTransaction();
    
    res.status(201).json({
      success: true,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        razorpayOrderId: rzpOrder.id,
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy'
      }
    });

  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// Verify Payment Signature securely
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw Object.assign(new Error('Payment verification parameters missing'), { statusCode: 400 });
    }

    // Reconstruct the expected signature using HMAC SHA256
    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_secret';
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', secret)
                                    .update(body.toString())
                                    .digest('hex');
                                    
    const isAuthentic = expectedSignature === razorpay_signature;
    
    if (!isAuthentic) {
      throw Object.assign(new Error('Invalid payment signature'), { statusCode: 400 });
    }
    
    // Payment is verified, update order status
    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    if (!order) {
      throw Object.assign(new Error('Order not found'), { statusCode: 404 });
    }
    
    order.paymentStatus = 'PAID';
    order.status = 'CONFIRMED';
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();
    
    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: { orderId: order._id, orderNumber: order.orderNumber }
    });
    
  } catch (error) {
    next(error);
  }
};

exports.getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('products.product', 'name images price')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};
