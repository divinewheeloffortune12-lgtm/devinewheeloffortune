const User = require('../models/User');
const AdminUser = require('../models/Admin');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id, type) => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters');
  }
  return jwt.sign({ id, type }, process.env.JWT_SECRET, {
    expiresIn: '7d', // Auto logout after 1 week
  });
};

const sendTokenResponse = (user, type, statusCode, res) => {
  const token = generateToken(user._id, type);
  const cookieName = type === 'admin' ? 'adminToken' : 'token';

  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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


exports.googleAuth = async (req, res) => {
  try {
    const { credential, intent } = req.body; // intent should be 'login' or 'signup'
    
    if (!credential || typeof credential !== 'string' || !process.env.GOOGLE_CLIENT_ID) {
      return res.status(400).json({ success: false, message: 'Google token required' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID.trim(),
    });
    
    const payload = ticket.getPayload();
    const { email, name, sub: googleId, email_verified } = payload;
    const normalizedEmail = String(email).toLowerCase();

    let user = await User.findOne({ email: normalizedEmail });

    if (intent === 'login') {
      if (!user) {
        return res.status(404).json({ success: false, message: 'Account not found. Please sign up first.' });
      }
      if (user.status === 'deleted') {
        return res.status(401).json({ success: false, message: 'Account has been deactivated.' });
      }
      
      // If user exists but is local (due to old data), convert them to Google auth
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        user.emailVerified = email_verified || user.emailVerified;
        user.passwordHash = undefined; // Remove password
        await user.save();
      }
    } else if (intent === 'signup') {
      if (user) {
        if (user.status === 'deleted') {
          // Reactivate account
          user.status = 'active';
          user.name = name;
          user.googleId = googleId;
          user.authProvider = 'google';
          user.emailVerified = email_verified || user.emailVerified;
          user.passwordHash = undefined;
          await user.save();
        } else {
          return res.status(400).json({ success: false, message: 'Account already exists. Please log in.' });
        }
      } else {
        // Create new user
        user = await User.create({
          name,
          email: normalizedEmail,
          googleId,
          authProvider: 'google',
          emailVerified: Boolean(email_verified),
        });
      }
    } else {
      return res.status(400).json({ success: false, message: 'Invalid intent specified.' });
    }

    sendTokenResponse(user, 'user', 200, res);
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401).json({ success: false, message: 'Google authentication failed: ' + error.message });
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
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
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
    
    // SECURITY: Removed auto-creation of admin when zero admins exist.
    // Admin accounts must be created via the seed script (npm run admin:create)
    // or the auto-seed in db.js on first connection.
    const admin = await AdminUser.findOne({ email: normalizedEmail });
      
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password.trim(), admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
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
