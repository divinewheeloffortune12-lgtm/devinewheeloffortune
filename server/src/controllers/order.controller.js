const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance — NEVER fall back to dummy keys
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('CRITICAL: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set');
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Valid order status transitions (state machine)
const VALID_TRANSITIONS = {
  PENDING_PAYMENT: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
};

// Create Order (Secure Price Calculation)
exports.createOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { shippingAddress, items } = req.body;
    if (!shippingAddress || typeof shippingAddress !== 'string' || shippingAddress.trim().length < 5) {
      throw Object.assign(new Error('A valid shipping address is required'), { statusCode: 400 });
    }

    if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
      throw Object.assign(new Error('Cart must have between 1 and 50 items'), { statusCode: 400 });
    }

    // Securely calculate total from DB — ignoring any frontend prices
    let totalAmount = 0;
    const orderProducts = [];

    for (const item of items) {
      // Validate input types
      const quantity = Number(item.quantity);
      if (!mongoose.isValidObjectId(item.productId) || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        throw Object.assign(new Error('Invalid item in cart'), { statusCode: 400 });
      }

      const product = await Product.findById(item.productId).session(session);
      if (!product || product.isDeleted || !product.availability) {
        throw Object.assign(new Error(`Product is unavailable`), { statusCode: 400 });
      }
      if (product.stock < quantity) {
        throw Object.assign(new Error(`Insufficient stock for ${product.name}`), { statusCode: 400 });
      }
      
      // Calculate total securely (ignoring any frontend prices)
      totalAmount += product.price * quantity;
      
      orderProducts.push({
        product: product._id,
        quantity: quantity,
        priceAtPurchase: product.price
      });
    }

    if (totalAmount <= 0) {
      throw Object.assign(new Error('Order total must be greater than zero'), { statusCode: 400 });
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create Razorpay Order
    const razorpayOptions = {
      amount: Math.round(totalAmount * 100), // Razorpay works in paise — round to avoid floating point issues
      currency: "INR",
      receipt: orderNumber,
    };
    
    let rzpOrder;
    try {
      rzpOrder = await razorpay.orders.create(razorpayOptions);
    } catch (rzpError) {
      console.error('Razorpay Error:', rzpError);
      throw Object.assign(new Error('Failed to initiate payment gateway'), { statusCode: 502, isOperational: true });
    }

    // Create Order in our DB
    const order = new Order({
      user: req.user._id,
      products: orderProducts,
      orderNumber,
      totalAmount,
      shippingAddress: shippingAddress.trim(),
      razorpayOrderId: rzpOrder.id,
      status: 'PENDING_PAYMENT',
      paymentStatus: 'PENDING'
    });

    await order.save({ session });

    await session.commitTransaction();
    
    res.status(201).json({
      success: true,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        razorpayOrderId: rzpOrder.id,
        key: process.env.RAZORPAY_KEY_ID
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
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      throw Object.assign(new Error('Payment configuration error'), { statusCode: 500 });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', secret)
                                    .update(body.toString())
                                    .digest('hex');

    // Use timing-safe comparison to prevent timing attacks
    if (expectedSignature.length !== razorpay_signature.length ||
        !crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpay_signature))) {
      throw Object.assign(new Error('Invalid payment signature'), { statusCode: 400 });
    }
    
    // Payment is verified — find the order
    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    if (!order) {
      throw Object.assign(new Error('Order not found'), { statusCode: 404 });
    }

    // OWNERSHIP CHECK: Verify the order belongs to the authenticated user
    if (order.user.toString() !== req.user._id.toString()) {
      throw Object.assign(new Error('Access denied'), { statusCode: 403 });
    }
    
    // Idempotency: If already paid, return success without re-processing
    if (order.paymentStatus === 'PAID') {
      return res.json({ success: true, message: 'Payment already verified', data: { orderId: order._id, orderNumber: order.orderNumber } });
    }
    
    // Atomically decrement stock for all products to prevent race conditions
    for (const item of order.products) {
      const result = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
      if (!result) {
        // Stock is insufficient — this shouldn't happen if createOrder validated, but handle gracefully
        console.error(`Stock decrement failed for product ${item.product} on order ${order.orderNumber}`);
      }
    }
    
    // Update order status atomically
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: order._id, paymentStatus: 'PENDING' },
      {
        $set: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
          razorpayPaymentId: razorpay_payment_id,
          paidAt: new Date(),
        },
        $push: {
          statusHistory: { status: 'CONFIRMED', changedAt: new Date(), reason: 'Payment verified' }
        }
      },
      { new: true }
    );

    if (!updatedOrder) {
      // Already processed (race between verifyPayment and webhook) — return success
      return res.json({ success: true, message: 'Payment already processed', data: { orderId: order._id, orderNumber: order.orderNumber } });
    }
    
    res.json({ success: true, message: 'Payment verified and order placed successfully', data: { orderId: updatedOrder._id, orderNumber: updatedOrder.orderNumber } });
  } catch (error) {
    next(error);
  }
};

exports.razorpayWebhook = async (req, res, next) => {
  try {
    const secret = (process.env.RAZORPAY_WEBHOOK_SECRET || '').trim();
    if (!secret) {
      console.error('RAZORPAY_WEBHOOK_SECRET is not configured');
      return res.status(500).send('Webhook not configured');
    }

    const signature = req.headers['x-razorpay-signature'];
    if (!signature) {
      return res.status(400).send('Missing signature');
    }

    // Use raw body for correct HMAC — the body is either a Buffer (from express.raw) or a string
    const rawBody = Buffer.isBuffer(req.body) ? req.body : JSON.stringify(req.body);

    const expectedSignature = crypto.createHmac('sha256', secret)
                                    .update(rawBody)
                                    .digest('hex');

    // Timing-safe comparison
    if (expectedSignature.length !== signature.length ||
        !crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature))) {
      return res.status(400).send('Invalid signature');
    }

    // Parse body if it was raw
    const payload = Buffer.isBuffer(req.body) ? JSON.parse(req.body.toString()) : req.body;
    const event = payload.event;

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payload.payment.entity;
      const razorpay_order_id = paymentEntity.order_id;
      const razorpay_payment_id = paymentEntity.id;

      // Handle Product Order — use atomic update for idempotency
      const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
      if (order && order.paymentStatus !== 'PAID') {
        // Atomically decrement stock
        for (const item of order.products) {
          await Product.findOneAndUpdate(
            { _id: item.product, stock: { $gte: item.quantity } },
            { $inc: { stock: -item.quantity } }
          );
        }

        // Atomically update order — only if still PENDING (idempotency)
        await Order.findOneAndUpdate(
          { _id: order._id, paymentStatus: 'PENDING' },
          {
            $set: {
              paymentStatus: 'PAID',
              status: 'CONFIRMED',
              razorpayPaymentId: razorpay_payment_id,
              paidAt: new Date(),
            },
            $push: {
              statusHistory: { status: 'CONFIRMED', changedAt: new Date(), reason: 'Webhook: payment captured' }
            }
          }
        );
      }

      // Handle Service Booking — same idempotent pattern
      const ServiceBooking = require('../models/ServiceBooking');
      await ServiceBooking.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id, paymentStatus: 'PENDING' },
        {
          $set: {
            paymentStatus: 'PAID',
            status: 'CONFIRMED',
            razorpayPaymentId: razorpay_payment_id,
          }
        }
      );
    }

    // Always return 200 to Razorpay to prevent retries for successfully processed webhooks
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    // Return 500 so Razorpay retries
    res.status(500).send('Internal Server Error');
  }
};

exports.getUserOrders = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));

    const [orders, total] = await Promise.all([
      Order.find({ user: req.user._id })
        .populate('products.product', 'name images price slug')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Order.countDocuments({ user: req.user._id })
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

// Get receipt data for a specific order (user must own the order)
exports.getOrderReceipt = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.orderId)) {
      throw Object.assign(new Error('Invalid order ID'), { statusCode: 400 });
    }

    const order = await Order.findById(req.params.orderId)
      .populate('products.product', 'name price images')
      .populate('user', 'name email mobile address')
      .lean();

    if (!order) {
      throw Object.assign(new Error('Order not found'), { statusCode: 404 });
    }

    // Ownership check
    if (order.user._id.toString() !== req.user._id.toString()) {
      throw Object.assign(new Error('Access denied'), { statusCode: 403 });
    }

    // Only allow receipt for paid orders
    if (order.paymentStatus !== 'PAID') {
      throw Object.assign(new Error('Receipt is only available for paid orders'), { statusCode: 400 });
    }

    res.json({
      success: true,
      data: {
        businessName: 'Divine Wheel Of Fortune',
        orderNumber: order.orderNumber,
        orderId: order._id,
        razorpayPaymentId: order.razorpayPaymentId,
        customer: {
          name: order.user.name,
          email: order.user.email,
        },
        items: order.products.map(p => ({
          name: p.product?.name || 'Item',
          quantity: p.quantity,
          unitPrice: p.priceAtPurchase,
          total: p.priceAtPurchase * p.quantity,
        })),
        totalAmount: order.totalAmount,
        shippingAddress: order.shippingAddress,
        paymentStatus: order.paymentStatus,
        orderStatus: order.status,
        orderDate: order.createdAt,
        paidAt: order.paidAt,
      }
    });
  } catch (error) {
    next(error);
  }
};

// Export valid transitions for use in admin routes
exports.VALID_TRANSITIONS = VALID_TRANSITIONS;
