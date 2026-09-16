const express = require('express');
const multer = require('multer');
const adminBookingController = require('../controllers/adminBooking.controller');
const { requireAdmin } = require('../middleware/auth.middleware');
const categoryController = require('../controllers/adminCategory.controller');
const feedbackController = require('../controllers/adminFeedback.controller');

const { 
  createProduct, 
  getProducts, 
  deleteProduct, 
  getDeletedProducts 
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

// Stubs for future modules
router.get('/reports', (req, res) => res.json({ success: true, data: [] }));
router.get('/announcements', (req, res) => res.json({ success: true, data: [] }));
router.get('/sales', (req, res) => res.json({ success: true, data: [] }));

// Service Bookings
router.get('/bookings', adminBookingController.getAllBookings);
router.put('/bookings/:id/status', adminBookingController.updateBookingStatus);

module.exports = router;
