const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

const authRoutes = require('./routes/auth.routes');
const categoryRoutes = require('./routes/category.routes');
const cartRoutes = require('./routes/cart.routes');
const productRoutes = require('./routes/product.routes');
const contactRoutes = require('./routes/contact.routes');
const announcementRoutes = require('./routes/announcement.routes');
const bookingRoutes = require('./routes/booking.routes');
const { apiLimiter } = require('./middleware/rateLimiter');
const { requireTrustedOrigin } = require('./middleware/csrf.middleware');

// Connect to Database
connectDB();

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet({
  crossOriginOpenerPolicy: false
}));

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8080',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:8080',
  'https://divinewheeloffortune.com',
  'https://www.divinewheeloffortune.com',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Local origins are never accepted by a production deployment.
    if (process.env.NODE_ENV !== 'production' && (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'))) {
      return callback(null, true);
    }

    // Allow Vercel domains
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'));
    }

    return callback(null, true);
  },
  credentials: true,
}));
app.use(express.json({ limit: '10kb' })); // Limit body size against DOS
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(requireTrustedOrigin);

// Apply rate limiting to all requests
app.use('/api/', apiLimiter);

const adminRoutes = require('./routes/admin.routes');
const profileRoutes = require('./routes/profile.routes');
const orderRoutes = require('./routes/order.routes');

// Simple in-memory cache for high traffic (20k users)
const cache = new Map();
const cacheMiddleware = (durationSecs) => (req, res, next) => {
  if (req.method !== 'GET') return next();
  const key = req.originalUrl;
  const cachedResponse = cache.get(key);
  if (cachedResponse && cachedResponse.expiry > Date.now()) {
    return res.json(cachedResponse.data);
  }
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    cache.set(key, { data: body, expiry: Date.now() + durationSecs * 1000 });
    originalJson(body);
  };
  next();
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', cacheMiddleware(300), categoryRoutes); // 5 min cache
app.use('/api/products', cacheMiddleware(120), productRoutes); // 2 min cache
app.use('/api/contact', contactRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/bookings', bookingRoutes);

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Astrology E-commerce Server is running successfully.',
    data: {
      timestamp: new Date().toISOString()
    }
  });
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || (err.name === 'ValidationError' ? 400 : 500);
  if (process.env.NODE_ENV !== 'test' && statusCode >= 500) console.error(err);
  
  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: (statusCode >= 500 && !err.isOperational) ? 'Something went wrong on the server' : err.message
    }
  });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
