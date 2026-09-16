const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const databaseUri = process.env.MONGODB_URI;
    if (!databaseUri) throw new Error('MONGODB_URI is not configured');
    const conn = await mongoose.connect(databaseUri, { 
      serverSelectionTimeoutMS: 10_000,
      maxPoolSize: 100 // High connection pool for 20k concurrent users
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Auto-seed Admin User
    try {
      const AdminUser = require('../models/Admin');
      const bcrypt = require('bcryptjs');
      const email = (process.env.ADMIN_EMAIL || 'divinewheeloffortune@gmail.com').trim().toLowerCase();
      const password = process.env.ADMIN_PASSWORD || 'nattasha@2026v1';
      if (email && password) {
        const exists = await AdminUser.exists({ email });
        if (!exists) {
          await AdminUser.create({ 
            email, 
            passwordHash: await bcrypt.hash(password, 12), 
            role: 'super_admin', 
            status: 'active' 
          });
          console.log(`Auto-seeded admin: ${email}`);
        } else {
          // Force update password for testing (remove in production if needed, but useful for fixing locked accounts)
          await AdminUser.updateOne({ email }, { passwordHash: await bcrypt.hash(password, 12) });
          console.log(`Ensured admin password matches env for: ${email}`);
        }
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
