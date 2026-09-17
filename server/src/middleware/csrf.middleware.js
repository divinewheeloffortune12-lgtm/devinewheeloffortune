const unsafeMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

// Browser cookie authentication needs origin validation for state-changing calls.
exports.requireTrustedOrigin = (req, res, next) => {
  // 1. Exclude webhook routes since they come from external servers, not browsers.
  // The webhook handler has its own HMAC signature verification.
  if (req.originalUrl.includes('/webhook')) {
    return next();
  }

  // 2. Only check unsafe methods
  if (!unsafeMethods.has(req.method)) return next();

  // 3. Origin check
  const origin = req.get('origin');
  
  // If there's no origin, it's not a browser (e.g. mobile app, curl).
  // In a strict setup you might block this, but typically you allow non-browser clients 
  // if they authenticate via Bearer token. Since our web frontend always sends Origin,
  // we check it when present. 
  if (!origin) return next();

  const allowedOrigins = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  // Add the known production domains just to be safe
  allowedOrigins.push('https://divinewheeloffortune.com', 'https://www.divinewheeloffortune.com');

  if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push('http://localhost:5173', 'http://localhost:8080', 'http://127.0.0.1:5173', 'http://127.0.0.1:8080');
  }

  // Allow Vercel preview URLs dynamically
  if (origin.endsWith('.vercel.app')) {
    return next();
  }

  if (!allowedOrigins.includes(origin)) {
    return res.status(403).json({ success: false, message: 'Request origin is not allowed' });
  }
  
  return next();
};
