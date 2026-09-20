const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const cleanDeletedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const deletedUsers = await User.find({ status: 'deleted' });

    if (deletedUsers.length > 0) {
      const result = await User.deleteMany({ status: 'deleted' });
    } else {
    }

    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
};

cleanDeletedUsers();
