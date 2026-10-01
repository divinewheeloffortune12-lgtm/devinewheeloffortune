const mongoose = require('mongoose');
const Order = require('../models/Order');
const ServiceBooking = require('../models/ServiceBooking');

class RetentionPolicy {
  /**
   * Run the cleanup job for expired data.
   */
  static async runCleanup() {
    try {
      console.log('Running Data Retention Cleanup...');
      const now = new Date();
      const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

      // FAILED/PENDING TEMPORARY DATA -> eligible after 48 hours
      // We ONLY delete if paymentStatus is not PAID and not REFUNDED
      // and status is not CONFIRMED, PROCESSING, SHIPPED, DELIVERED, COMPLETED
      
      const orderFilter = {
        createdAt: { $lt: fortyEightHoursAgo },
        paymentStatus: { $nin: ['PAID', 'REFUNDED'] },
        status: { $nin: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] }
      };

      const deletedOrders = await Order.deleteMany(orderFilter);
      if (deletedOrders.deletedCount > 0) {
        console.log(`Deleted ${deletedOrders.deletedCount} old pending/failed orders.`);
      }

      const bookingFilter = {
        createdAt: { $lt: fortyEightHoursAgo },
        paymentStatus: { $nin: ['PAID', 'REFUNDED'] },
        status: { $nin: ['CONFIRMED', 'COMPLETED'] }
      };

      const deletedBookings = await ServiceBooking.deleteMany(bookingFilter);
      if (deletedBookings.deletedCount > 0) {
        console.log(`Deleted ${deletedBookings.deletedCount} old pending/failed bookings.`);
      }

    } catch (error) {
      console.error('Data Retention Cleanup failed:', error);
    }
  }

  /**
   * Start a recurring cleanup schedule (e.g., every 6 hours)
   */
  static startSchedule() {
    // Run once on startup
    setTimeout(() => this.runCleanup(), 5000);
    // Then every 6 hours
    setInterval(() => this.runCleanup(), 6 * 60 * 60 * 1000);
  }
}

module.exports = RetentionPolicy;
