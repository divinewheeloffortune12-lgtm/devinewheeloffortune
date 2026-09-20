require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const result = await User.deleteMany({ status: 'deleted' });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

run();
