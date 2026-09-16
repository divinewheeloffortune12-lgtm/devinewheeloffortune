const rateLimit = require('express-rate-limit');

// Protects all auth routes (login, register)
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes.'
  }
});

// Protects admin login route strictly
exports.adminLoginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 10, // start blocking after 10 requests
  message: {
    success: false,
    message: 'Too many admin login attempts from this IP, please try again after an hour.'
  }
});

// Protects general API routes to prevent generic DDoS
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // higher limit in dev
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  }
});
