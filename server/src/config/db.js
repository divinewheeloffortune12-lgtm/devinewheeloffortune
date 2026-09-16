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
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
