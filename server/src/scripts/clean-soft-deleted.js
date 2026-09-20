require('dotenv').config({ path: __dirname + '/../../.env' });
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');

async function cleanSoftDeleted() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const productsResult = await Product.deleteMany({ isDeleted: true });

    const categoriesResult = await Category.deleteMany({ isDeleted: true });

    process.exit(0);
  } catch (error) {
    console.error('Error cleaning soft deleted records:', error);
    process.exit(1);
  }
}

cleanSoftDeleted();
