require('dotenv').config();
const mongoose = require('mongoose');
const Blog = require('./src/models/Blog');

async function updateBlogs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/astrology');
    console.log('Connected to MongoDB');
    
    // Using strict: false and timestamps: false to ensure we can update createdAt
    const result = await Blog.updateMany({}, {
      $set: { createdAt: new Date("2026-09-23T00:00:00.000Z") }
    }, { timestamps: false, strict: false });
    
    console.log(`Successfully updated ${result.modifiedCount} blog(s).`);
  } catch (error) {
    console.error('Error updating blogs:', error);
  } finally {
    mongoose.connection.close();
  }
}

updateBlogs();
