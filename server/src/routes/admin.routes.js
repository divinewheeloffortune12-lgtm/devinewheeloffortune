const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const adminBookingController = require('../controllers/adminBooking.controller');
const { requireAdmin } = require('../middleware/auth.middleware');
const categoryController = require('../controllers/adminCategory.controller');
const feedbackController = require('../controllers/adminFeedback.controller');

const { 
  createProduct, 
  getProducts, 
  deleteProduct, 
  getDeletedProducts,
  toggleProductAvailability
} = require('../controllers/adminProduct.controller');

const { 
  getUsers, 
  updateUserStatus 
} = require('../controllers/adminUser.controller');

const adminStatsController = require('../controllers/adminStats.controller');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, callback) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      return callback(new Error('Only JPEG, PNG, and WebP images are allowed'));
    }
    return callback(null, true);
  },
});

// ALL routes here are strictly protected by requireAdmin
router.use(requireAdmin);

// Stats
router.get('/stats', adminStatsController.getStats);

// Products
router.post('/products', upload.array('images', 5), createProduct);
router.get('/products', getProducts);
router.delete('/products/:id', deleteProduct);
router.patch('/products/:id/availability', toggleProductAvailability);
router.get('/products/deleted/all', getDeletedProducts);

// Categories: archive only, never delete categories referenced by products.
router.get('/categories', categoryController.list);
router.post('/categories', categoryController.create);
router.patch('/categories/:id', categoryController.update);
router.delete('/categories/:id', categoryController.archive);

// Users
router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);
router.get('/feedback', feedbackController.list);
router.patch('/feedback/:id', feedbackController.updateStatus);
router.delete('/feedback/:id', feedbackController.deleteMessage);

const Order = require('../models/Order');
const { VALID_TRANSITIONS } = require('../controllers/order.controller');

// Sales & Orders — with pagination
router.get('/sales', async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email mobile')
        .populate('products.product', 'name price images')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
});

// Update order status with state machine validation
router.put('/sales/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;

    // Validate the target status is a valid enum value
    const validStatuses = ['PENDING_PAYMENT', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // State machine: validate the transition is allowed
    const allowedNextStatuses = VALID_TRANSITIONS[order.status] || [];
    if (!allowedNextStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from ${order.status} to ${status}. Allowed transitions: ${allowedNextStatuses.join(', ') || 'none'}`
      });
    }

    // Prevent marking unpaid orders as shipped/delivered
    if (['SHIPPED', 'DELIVERED'].includes(status) && order.paymentStatus !== 'PAID') {
      return res.status(400).json({
        success: false,
        message: 'Cannot ship/deliver an order that has not been paid'
      });
    }

    order.status = status;
    order.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: req.admin._id,
      reason: `Admin status update`
    });

    await order.save();

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
});

// Admin receipt access
router.get('/orders/:orderId/receipt', async (req, res, next) => {
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
          name: order.user?.name || 'Unknown',
          email: order.user?.email || 'Unknown',
          mobile: order.user?.mobile,
          address: order.user?.address,
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
        statusHistory: order.statusHistory,
        orderDate: order.createdAt,
        paidAt: order.paidAt,
      }
    });
  } catch (error) {
    next(error);
  }
});

// Stubs for future modules
router.get('/reports', (req, res) => res.json({ success: true, data: [] }));
router.get('/announcements', (req, res) => res.json({ success: true, data: [] }));

// Service Bookings
router.get('/bookings', adminBookingController.getAllBookings);
router.put('/bookings/:id/status', adminBookingController.updateBookingStatus);

module.exports = router;
