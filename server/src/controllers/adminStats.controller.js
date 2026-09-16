const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const ServiceBooking = require('../models/ServiceBooking');

exports.getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments({ isDeleted: false });
    
    // Fetch paid orders and calculate order revenue
    const paidOrders = await Order.find({ paymentStatus: 'PAID' });
    const orderRevenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalSales = paidOrders.length;

    // Fetch paid bookings and calculate booking revenue
    const paidBookings = await ServiceBooking.find({ paymentStatus: 'PAID' });
    const bookingRevenue = paidBookings.reduce((sum, booking) => sum + booking.amount, 0);
    const totalBookings = paidBookings.length;

    const totalRevenue = orderRevenue + bookingRevenue;

    const recentSales = await Order.find({ paymentStatus: 'PAID' }).sort({ createdAt: -1 }).limit(5).populate('user', 'name email').lean();
    
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt').lean();
    const topProducts = await Product.find({ isDeleted: false }).sort({ createdAt: -1 }).limit(5).select('name price stock category images').populate('category', 'name').lean();

    res.json({
      success: true,
      data: {
        totals: {
          users: totalUsers,
          products: totalProducts,
          sales: totalSales,
          bookings: totalBookings,
          revenue: totalRevenue
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
