const User = require('../models/User');
const AdminUser = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id, type) => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters');
  }
  return jwt.sign({ id, type }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const sendTokenResponse = (user, type, statusCode, res) => {
  const token = generateToken(user._id, type);
  const cookieName = type === 'admin' ? 'adminToken' : 'token';

  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  };

  user.passwordHash = undefined; // Don't send password hash back

  res
    .status(statusCode)
    .cookie(cookieName, token, options)
    .json({
      success: true,
      token,
      data: user,
    });
};

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password } = req.body;
    const normalizedEmail = String(email).trim().toLowerCase();

    // Check if user already exists
    let user = await User.findOne({ email: normalizedEmail });
    if (user) {
      if (user.authProvider === 'google') {
         return res.status(400).json({ success: false, message: 'Account already exists. Please login with Google.' });
      }
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    user = await User.create({
      name,
      email: normalizedEmail,
      passwordHash,
      authProvider: 'local'
    });

    sendTokenResponse(user, 'user', 201, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: String(email).trim().toLowerCase() }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.authProvider === 'google' && !user.passwordHash) {
       return res.status(401).json({ success: false, message: 'Please login with Google.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(user, 'user', 200, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    
    if (!credential || typeof credential !== 'string' || !process.env.GOOGLE_CLIENT_ID) {
      return res.status(400).json({ success: false, message: 'Google token required' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { email, name, sub: googleId, email_verified } = payload;

    let user = await User.findOne({ email });

    if (user) {
      // If user exists but is local, we link the googleId
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'both';
        user.emailVerified = email_verified || user.emailVerified;
        await user.save();
      }
    } else {
      user = await User.create({
        name,
        email,
        googleId,
        authProvider: 'google',
        emailVerified: Boolean(email_verified),
      });
    }

    sendTokenResponse(user, 'user', 200, res);
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401).json({ success: false, message: 'Google authentication failed' });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

exports.getMe = async (req, res) => {
  try {
    let token = req.cookies && req.cookies.token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(200).json({ success: true, data: null });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'user') return res.status(200).json({ success: true, data: null });

    const user = await User.findById(decoded.id).select('-passwordHash -googleId');
    if (!user || user.status !== 'active') return res.status(200).json({ success: true, data: null });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(200).json({ success: true, data: null });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    
    // First-time setup: If absolutely zero admins exist in the DB, create this one.
    const adminCount = await AdminUser.countDocuments();
    let admin;
    
    if (adminCount === 0) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password.trim(), salt);
      admin = await AdminUser.create({
        email: normalizedEmail,
        passwordHash,
        role: 'super_admin',
        status: 'active'
      });
      console.log(`First-time admin setup complete for: ${normalizedEmail}`);
    } else {
      admin = await AdminUser.findOne({ email: normalizedEmail });
      
      if (!admin) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password.trim(), admin.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    }

    sendTokenResponse(admin, 'admin', 200, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.adminLogout = (req, res) => {
  res.clearCookie('adminToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  });
  res.status(200).json({ success: true, message: 'Admin logged out successfully' });
};

exports.getAdminMe = async (req, res) => {
  res.status(200).json({ success: true, data: req.admin });
};
