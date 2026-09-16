const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

exports.getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments({ isDeleted: false });
    
    // Fallback if Order doesn't exist yet
    let totalSales = 0;
    let recentSales = [];
    try {
      totalSales = await Order.countDocuments();
      recentSales = await Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email').lean();
    } catch (err) {
      // Order model might not be fully implemented in phase 3 yet
    }

    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt').lean();
    const topProducts = await Product.find({ isDeleted: false }).sort({ createdAt: -1 }).limit(5).select('name price stock category images').populate('category', 'name').lean();

    res.json({
      success: true,
      data: {
        totals: {
          users: totalUsers,
          products: totalProducts,
          sales: totalSales,
          revenue: 0 // Stub for future revenue calculation
        },
        recentUsers,
        recentSales,
        topProducts
      }
    });
  } catch (error) {
    next(error);
  }
};
