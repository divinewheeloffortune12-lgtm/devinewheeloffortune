require('dotenv').config({ path: __dirname + '/../../.env' });
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');

async function cleanSoftDeleted() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const productsResult = await Product.deleteMany({ isDeleted: true });
    console.log(`Deleted ${productsResult.deletedCount} soft-deleted products.`);

    const categoriesResult = await Category.deleteMany({ isDeleted: true });
    console.log(`Deleted ${categoriesResult.deletedCount} soft-deleted categories.`);

    process.exit(0);
  } catch (error) {
    console.error('Error cleaning soft deleted records:', error);
    process.exit(1);
  }
}

cleanSoftDeleted();
