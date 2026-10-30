const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const compression = require('compression');

const authRoutes = require('./routes/auth.routes');
const categoryRoutes = require('./routes/category.routes');
const cartRoutes = require('./routes/cart.routes');
const productRoutes = require('./routes/product.routes');
const contactRoutes = require('./routes/contact.routes');
const announcementRoutes = require('./routes/announcement.routes');
const bookingRoutes = require('./routes/booking.routes');
const blogRoutes = require('./routes/blog.routes');
const { apiLimiter } = require('./middleware/rateLimiter');
const { requireTrustedOrigin } = require('./middleware/csrf.middleware');

// Connect to Database
connectDB();

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

// Security Middleware — use same-origin-allow-popups so Google OAuth
// popup can postMessage back to the opener while retaining COOP protection.
app.use(helmet({
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' }
}));

// Parse FRONTEND_URL which may be comma-separated
const frontendUrls = (process.env.FRONTEND_URL || '')
  .split(',')
  .map(u => u.trim())
  .filter(Boolean);

const allowedOrigins = [
  ...frontendUrls,
  'https://divinewheeloffortune.com',
  'https://www.divinewheeloffortune.com',
];

// Deduplicate
const uniqueOrigins = [...new Set(allowedOrigins)];

// Add dev origins only outside production
if (process.env.NODE_ENV !== 'production') {
  uniqueOrigins.push(
    'http://localhost:5173',
    'http://localhost:8080',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:8080'
  );
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, webhooks)
    if (!origin) return callback(null, true);

    // Allow Vercel preview domains
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    if (uniqueOrigins.indexOf(origin) === -1) {
      return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'));
    }

    return callback(null, true);
  },
  credentials: true,
  exposedHeaders: ['x-rtb-fingerprint-id', 'request-id'],
}));

// Webhook route needs raw body for HMAC signature verification.
// Must be registered BEFORE express.json() parses the body.
app.use('/api/orders/webhook', express.raw({ type: 'application/json' }));

app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(requireTrustedOrigin);

// Apply rate limiting to all requests
app.use('/api/', apiLimiter);

const adminRoutes = require('./routes/admin.routes');
const profileRoutes = require('./routes/profile.routes');
const orderRoutes = require('./routes/order.routes');

/**
 * Simple in-memory cache for read-heavy public GET endpoints.
 *
 * Design notes:
 * - Cache is keyed by full URL (path + query string).
 * - Cache is only populated for successful (2xx) JSON responses.
 * - The cache is intentionally short-lived (2–5 min) to limit stale-data exposure.
 * - Admin mutations bypass the cache entirely (admin routes don't use cacheMiddleware).
 * - The exported `invalidateCache` function allows admin write operations to
 *   proactively clear relevant cache keys (future enhancement).
 *
 * Limitation: This is a single-instance in-process cache. It is NOT shared across
 * multiple server processes or Render instances. For multi-instance deployments,
 * replace with Redis or a similar shared cache.
 */
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
    // Only cache successful responses to avoid caching errors
    if (res.statusCode >= 200 && res.statusCode < 300 && body?.success !== false) {
      cache.set(key, { data: body, expiry: Date.now() + durationSecs * 1000 });
    }
    originalJson(body);
  };
  next();
};

/**
 * Invalidate all cache entries whose keys start with a given prefix.
 * Call this from admin write handlers to immediately surface changes.
 * Example: invalidateCache('/api/products') after creating/updating a product.
 */
const invalidateCache = (prefix) => {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
};

// Export for use in controllers and routes
app.locals.invalidateCache = invalidateCache;
app.locals.cacheMiddleware = cacheMiddleware;

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
app.use('/api/blogs', cacheMiddleware(300), blogRoutes);

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

// Centralized error handler
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

// Process-level error handlers for production stability
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't crash — log and continue
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // For truly unexpected errors, give in-flight requests 5s to finish, then exit
  if (process.env.NODE_ENV === 'production') {
    setTimeout(() => process.exit(1), 5000);
  }
});

if (require.main === module) {
  const RetentionPolicy = require('./services/retention.service');
  RetentionPolicy.startSchedule();

  app.listen(PORT, () => {
  });
}

module.exports = app;
