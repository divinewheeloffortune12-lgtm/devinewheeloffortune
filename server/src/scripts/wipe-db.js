const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const User = require('../models/User');
const Order = require('../models/Order');
const CancellationRequest = require('../models/CancellationRequest');
const Cart = require('../models/Cart');
const ContactMessage = require('../models/ContactMessage');
const Report = require('../models/Report');
const ServiceBooking = require('../models/ServiceBooking');

const wipeDatabase = async () => {
  try {
    const databaseUri = process.env.MONGODB_URI;
    if (!databaseUri) throw new Error('MONGODB_URI is not configured');
    
    await mongoose.connect(databaseUri);
    console.log('Connected to Database. Commencing hard wipe of user and transactional data...');

    const userRes = await User.deleteMany({});
    console.log(`Deleted ${userRes.deletedCount} Users.`);

    const orderRes = await Order.deleteMany({});
    console.log(`Deleted ${orderRes.deletedCount} Orders.`);

    const cancelRes = await CancellationRequest.deleteMany({});
    console.log(`Deleted ${cancelRes.deletedCount} CancellationRequests.`);

    const cartRes = await Cart.deleteMany({});
    console.log(`Deleted ${cartRes.deletedCount} Carts.`);

    const contactRes = await ContactMessage.deleteMany({});
    console.log(`Deleted ${contactRes.deletedCount} ContactMessages.`);

    const reportRes = await Report.deleteMany({});
    console.log(`Deleted ${reportRes.deletedCount} Reports.`);

    const bookingRes = await ServiceBooking.deleteMany({});
    console.log(`Deleted ${bookingRes.deletedCount} ServiceBookings.`);

    console.log('\n--- Database wipe complete ---');
    console.log('Categories, Products, Services, Blogs, Admins, and Announcements were kept intact.');

    process.exit(0);
  } catch (error) {
    console.error(`Error wiping database: ${error.message}`);
    process.exit(1);
  }
};

wipeDatabase();
