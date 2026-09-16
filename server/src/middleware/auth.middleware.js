const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AdminUser = require('../models/Admin');

exports.requireUser = async (req, res, next) => {
  try {
    let token;
    
    // Check for token in cookies
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token belongs to a User
    if (decoded.type !== 'user') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const user = await User.findById(decoded.id).select('-passwordHash -googleId');
    if (!user || user.status !== 'active') {
      return res.status(401).json({ success: false, message: 'User not found or inactive' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
};

exports.requireAdmin = async (req, res, next) => {
  try {
    let token;
    
    // Check for token in cookies
    if (req.cookies && req.cookies.adminToken) {
      token = req.cookies.adminToken;
    }
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized to access admin route' });
    }

    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token belongs to an Admin
    if (decoded.type !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const admin = await AdminUser.findById(decoded.id).select('-passwordHash');
    if (!admin || admin.status !== 'active') {
      return res.status(401).json({ success: false, message: 'Admin not found or inactive' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
};
