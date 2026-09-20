const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const cleanDeletedUsers = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const deletedUsers = await User.find({ status: 'deleted' });
    console.log(`Found ${deletedUsers.length} users with status: 'deleted'.`);

    if (deletedUsers.length > 0) {
      console.log('Deleting users...');
      const result = await User.deleteMany({ status: 'deleted' });
      console.log(`Successfully deleted ${result.deletedCount} users.`);
    } else {
      console.log('No users to delete.');
    }

    console.log('Cleanup complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
};

cleanDeletedUsers();
