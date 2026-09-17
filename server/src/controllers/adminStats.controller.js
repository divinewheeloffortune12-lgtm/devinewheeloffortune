const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const ServiceBooking = require('../models/ServiceBooking');

exports.getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments({ isDeleted: false });
    
    // Efficient aggregation for total revenue and orders
    const orderStats = await Order.aggregate([
      { $match: { paymentStatus: 'PAID' } },
      { $group: { _id: null, revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
    ]);
    
    const bookingStats = await ServiceBooking.aggregate([
      { $match: { paymentStatus: 'PAID' } },
      { $group: { _id: null, revenue: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    const orderRevenue = orderStats[0]?.revenue || 0;
    const totalSales = orderStats[0]?.count || 0;
    
    const bookingRevenue = bookingStats[0]?.revenue || 0;
    const totalBookings = bookingStats[0]?.count || 0;

    const totalRevenue = orderRevenue + bookingRevenue;

    // Monthly revenue trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyOrders = await Order.aggregate([
      { $match: { paymentStatus: 'PAID', createdAt: { $gte: sixMonthsAgo } } },
      { $group: { 
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, 
          revenue: { $sum: '$totalAmount' } 
      } }
    ]);

    const monthlyBookings = await ServiceBooking.aggregate([
      { $match: { paymentStatus: 'PAID', createdAt: { $gte: sixMonthsAgo } } },
      { $group: { 
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, 
          revenue: { $sum: '$amount' } 
      } }
    ]);

    // Format chart data
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const chartData = [];
    
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      
      const ordRev = monthlyOrders.find(o => o._id.month === m && o._id.year === y)?.revenue || 0;
      const bkgRev = monthlyBookings.find(b => b._id.month === m && b._id.year === y)?.revenue || 0;
      
      chartData.push({
        name: monthNames[m - 1],
        revenue: ordRev + bkgRev
      });
    }

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
        chartData,
        recentUsers,
        recentSales,
        topProducts
      }
    });
  } catch (error) {
    next(error);
  }
};
