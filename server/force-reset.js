const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const AdminUser = require('./src/models/Admin');

const run = async () => {
  try {
    const email = process.argv[2] || process.env.ADMIN_EMAIL || 'divinewheeloffortune@gmail.com';
    const password = process.argv[3] || process.env.ADMIN_PASSWORD || 'nattasha@2026v1';

    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log(`Resetting admin password for ${email}`);
    
    let admin = await AdminUser.findOne({ email });
    
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password.trim(), salt);
    
    if (admin) {
      admin.passwordHash = passwordHash;
      await admin.save();
      console.log(`Existing Admin password successfully reset!`);
    } else {
      admin = await AdminUser.create({
        email,
        passwordHash,
        role: 'super_admin',
        status: 'active'
      });
      console.log(`New Admin successfully created!`);
    }
    
    console.log(`You can now log in with email: ${email} and the provided password.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

run();
