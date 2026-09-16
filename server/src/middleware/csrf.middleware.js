const unsafeMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

// Browser cookie authentication needs origin validation for state-changing calls.
exports.requireTrustedOrigin = (req, res, next) => {
  if (!unsafeMethods.has(req.method)) return next();

  const origin = req.get('origin');
  const allowedOrigins = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push('http://localhost:5173', 'http://localhost:8080');
  }

  if (!origin || !allowedOrigins.includes(origin)) {
    return res.status(403).json({ success: false, message: 'Request origin is not allowed' });
  }
  return next();
};
