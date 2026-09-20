const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const databaseUri = process.env.MONGODB_URI;
    if (!databaseUri) throw new Error('MONGODB_URI is not configured');
    const conn = await mongoose.connect(databaseUri, { 
      serverSelectionTimeoutMS: 10_000,
      maxPoolSize: 100
    });
    
    // Auto-seed Admin User (initial seed only — never force-reset password)
    try {
      const AdminUser = require('../models/Admin');
      const bcrypt = require('bcryptjs');
      const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
      const password = process.env.ADMIN_PASSWORD;
      if (email && password) {
        const exists = await AdminUser.exists({ email });
        if (!exists) {
          await AdminUser.create({ 
            email, 
            passwordHash: await bcrypt.hash(password, 12), 
            role: 'super_admin', 
            status: 'active' 
          });
        }
        // NOTE: Removed force-reset of admin password on every startup.
        // If you need to reset, use: npm run admin:create
      }
    } catch (seedErr) {
      console.error(`Error auto-seeding admin: ${seedErr.message}`);
    }
    
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;