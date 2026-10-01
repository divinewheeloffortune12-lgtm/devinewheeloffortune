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
  getProductById,
  updateProduct,
  deleteProduct, 
  getDeletedProducts,
  toggleProductAvailability
} = require('../controllers/adminProduct.controller');

const { 
  getUsers, 
  updateUserStatus 
} = require('../controllers/adminUser.controller');

const adminStatsController = require('../controllers/adminStats.controller');
const adminProfileController = require('../controllers/adminProfile.controller');
const adminCancellationController = require('../controllers/adminCancellation.controller');

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

// Profile
router.get('/profile', adminProfileController.getProfile);
router.put('/profile', upload.single('profileImage'), adminProfileController.updateProfile);

// Stats
router.get('/stats', adminStatsController.getStats);

// Products
router.post('/products', upload.array('images', 5), createProduct);
router.put('/products/:id', upload.array('images', 5), updateProduct);
router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.delete('/products/:id', deleteProduct);
router.patch('/products/:id/availability', toggleProductAvailability);
router.get('/products/deleted/all', getDeletedProducts);

// Categories: archive only, never delete categories referenced by products.
router.get('/categories', categoryController.list);
router.post('/categories', upload.single('image'), categoryController.create);
router.patch('/categories/:id', upload.single('image'), categoryController.update);
router.delete('/categories/:id', categoryController.archive);



// Services (Admin)
const adminServiceController = require('../controllers/adminService.controller');
router.get('/services', adminServiceController.getAllServices);
router.post('/services', upload.single('image'), adminServiceController.createService);
router.put('/services/:id', upload.single('image'), adminServiceController.updateService);
router.delete('/services/:id', adminServiceController.deleteService);

// Users
router.get('/users/export', require('../controllers/adminUser.controller').exportUsers);
router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);
router.delete('/users/:id', require('../controllers/adminUser.controller').deleteUser);
router.get('/feedback', feedbackController.list);
router.patch('/feedback/:id', feedbackController.updateStatus);
router.delete('/feedback/:id', feedbackController.deleteMessage);

const Order = require('../models/Order');
const Announcement = require('../models/Announcement');
const { VALID_TRANSITIONS } = require('../controllers/order.controller');

// Sales & Orders
router.get('/sales/export', require('../controllers/adminSales.controller').exportSales);
router.get('/sales', async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));

    const filter = {};
    if (req.query.status && req.query.status !== 'all') {
      // Map PENDING and PENDING_PAYMENT to find both types of unprocessed orders
      if (req.query.status === 'PENDING' || req.query.status === 'PENDING_PAYMENT') {
        filter.status = { $in: ['PENDING', 'PENDING_PAYMENT'] };
      } else if (req.query.status === 'COMPLETED' || req.query.status === 'DELIVERED') {
        filter.status = { $in: ['COMPLETED', 'DELIVERED'] };
      } else {
        filter.status = req.query.status;
      }
    }
    
    if (req.query.dateRange && req.query.dateRange !== 'all') {
      const now = new Date();
      let startDate, endDate;
      
      switch (req.query.dateRange) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'yesterday':
          startDate = new Date(new Date().setDate(now.getDate() - 1));
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'last7days':
          startDate = new Date(new Date().setDate(now.getDate() - 7));
          break;
        case 'last30days':
          startDate = new Date(new Date().setDate(now.getDate() - 30));
          break;
        case 'thismonth':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
      }
      
      if (startDate) {
        filter.createdAt = { $gte: startDate };
        if (endDate) {
          filter.createdAt.$lt = endDate;
        }
      }
    }
    if (req.query.paymentStatus) {
      if (req.query.paymentStatus !== 'all') {
        filter.paymentStatus = req.query.paymentStatus;
      }
    }
    
    if (req.query.user) filter.user = req.query.user;
    
    const searchQuery = req.query.search ? req.query.search.toLowerCase() : '';

    const ServiceBooking = require('../models/ServiceBooking');

    // Fetch both collections
    const [orders, bookings] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email mobile')
        .populate('products.product', 'name price images')
        .lean(),
      ServiceBooking.find(filter)
        .populate('user', 'name email mobile')
        .populate('service', 'name price image')
        .lean()
    ]);

    // Add type identifiers
    orders.forEach(o => { o.type = 'Order'; });
    bookings.forEach(b => { 
      b.type = 'Booking'; 
      b.orderNumber = b._id.toString(); 
    });

    let combined = [...orders, ...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // In-memory search for populated fields
    if (searchQuery) {
      combined = combined.filter(item => {
        const orderNum = (item.orderNumber || '').toLowerCase();
        const rzp = (item.razorpayOrderId || '').toLowerCase();
        const cName = (item.customerName || item.user?.name || '').toLowerCase();
        const email = (item.email || item.user?.email || '').toLowerCase();
        const mobile = (item.mobile || item.user?.mobile || '').toLowerCase();
        return orderNum.includes(searchQuery) || 
               rzp.includes(searchQuery) || 
               cName.includes(searchQuery) || 
               email.includes(searchQuery) || 
               mobile.includes(searchQuery);
      });
    }

    const total = combined.length;
    
    let totalRevenue = 0;
    combined.forEach(item => {
      const amt = Number(item.totalAmount || item.amount || 0);
      // Only count revenue for PAID orders that are NOT cancelled or refunded
      if (!isNaN(amt) && item.paymentStatus === 'PAID' && item.status !== 'CANCELLED' && item.status !== 'REFUNDED') {
        totalRevenue += amt;
      }
    });

    const paginatedData = combined.slice((page - 1) * limit, page * limit);

    res.json({
      success: true,
      data: paginatedData,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit), totalRevenue }
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
    const validStatuses = ['PENDING', 'CANCELLED', 'REFUNDED', 'DELIVERED'];
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

    // Removed state machine, admin can set any status at any time

    // Prevent marking unpaid orders as delivered
    if (['DELIVERED'].includes(status) && order.paymentStatus !== 'PAID') {
      return res.status(400).json({
        success: false,
        message: 'Cannot deliver an order that has not been paid'
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

    // Create an announcement for the user
    let message = '';
    if (status === 'CANCELLED') {
      message = `Your order #${order.orderNumber} has been cancelled. Our team will contact you shortly.`;
    } else if (status === 'DELIVERED') {
      message = `Great news! Your order #${order.orderNumber} has been delivered.`;
    } else if (status === 'REFUNDED') {
      message = `Your order #${order.orderNumber} has been refunded.`;
    }

    if (message && order.user) {
      await Announcement.create({
        user: order.user,
        title: 'Order Status Update',
        content: message,
        isRead: false
      });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
});

// Cancellations
router.get('/cancellations', adminCancellationController.getCancellationRequests);
router.patch('/cancellations/:id', adminCancellationController.updateCancellationStatus);

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

// Shipping Configuration
const ShippingConfig = require('../models/ShippingConfig');

router.get('/shipping', async (req, res, next) => {
  try {
    const config = await ShippingConfig.getConfig();
    res.json({ success: true, data: config });
  } catch (error) {
    next(error);
  }
});

router.put('/shipping', async (req, res, next) => {
  try {
    const { shippingCharge, freeShippingThreshold } = req.body;
    const config = await ShippingConfig.getConfig();

    if (shippingCharge !== undefined) {
      if (typeof shippingCharge !== 'number' || shippingCharge < 0) {
        return res.status(400).json({ success: false, message: 'Shipping charge must be a non-negative number' });
      }
      config.shippingCharge = shippingCharge;
    }
    if (freeShippingThreshold !== undefined) {
      if (typeof freeShippingThreshold !== 'number' || freeShippingThreshold < 0) {
        return res.status(400).json({ success: false, message: 'Free shipping threshold must be a non-negative number' });
      }
      config.freeShippingThreshold = freeShippingThreshold;
    }

    await config.save();
    res.json({ success: true, data: config, message: 'Shipping configuration updated' });
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
