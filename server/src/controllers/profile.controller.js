const User = require('../models/User');
const Order = require('../models/Order');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash -googleId').populate('likedProducts');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    // Only show successfully paid orders in purchase history
    const orders = await Order.find({ user: req.user._id, paymentStatus: 'PAID' })
      .select('orderNumber products totalAmount shippingCharge status paymentStatus createdAt')
      .populate('products.product', 'name slug images')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.status(200).json({ success: true, data: orders });
  } catch (error) { next(error); }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Rate Limiting: max 4 updates per 24 hours
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Filter updates to only those within the last 24 hours
    user.profileUpdates = user.profileUpdates.filter(date => date > twentyFourHoursAgo);

    if (user.profileUpdates.length >= 4) {
      return res.status(429).json({ 
        success: false, 
        message: 'Profile update limit reached. You can only update your profile 4 times within a 24-hour period. Please try again later.' 
      });
    }

    // Mass assignment protection (explicitly extract fields)
    const { name, mobile, addressLine1, addressLine2, landmark, city, state, pincode, country } = req.body;

    if (name) user.name = name;
    if (mobile !== undefined) user.mobile = mobile;
    
    if (!user.address) user.address = {};
    if (addressLine1 !== undefined) user.address.addressLine1 = addressLine1;
    if (addressLine2 !== undefined) user.address.addressLine2 = addressLine2;
    if (landmark !== undefined) user.address.landmark = landmark;
    if (city !== undefined) user.address.city = city;
    if (state !== undefined) user.address.state = state;
    if (pincode !== undefined) user.address.pincode = pincode;
    if (country !== undefined) user.address.country = country;

    // Add this update to the tracking array
    user.profileUpdates.push(now);

    await user.save();

    // Send back the updated user without sensitive fields
    const updatedUser = await User.findById(user._id).select('-passwordHash -googleId');

    res.status(200).json({ success: true, data: updatedUser, message: 'Profile updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.addLike = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    if (!user.likedProducts.includes(productId)) {
      user.likedProducts.push(productId);
      await user.save();
    }
    res.json({ success: true, message: 'Product liked' });
  } catch (error) { next(error); }
};

exports.removeLike = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    user.likedProducts = user.likedProducts.filter(id => id.toString() !== productId);
    await user.save();
    res.json({ success: true, message: 'Product unliked' });
  } catch (error) { next(error); }
};
