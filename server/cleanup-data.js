// cleanup-data.js — Deletes all users, orders, payments, announcements, etc.
// Keeps: Products, Categories
const mongoose = require('mongoose');
require('dotenv').config();

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('MONGODB_URI not set'); process.exit(1); }
  
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');
  
  const db = mongoose.connection.db;
  
  // Collections to DELETE (all data)
  const toDelete = [
    'users',
    'orders', 
    'cancellationrequests',
    'announcements',
    'carts',
    'shippingconfigs',
    'servicebookings',
  ];
  
  for (const name of toDelete) {
    try {
      const result = await db.collection(name).deleteMany({});
      console.log(`Deleted ${result.deletedCount} documents from "${name}"`);
    } catch (err) {
      console.log(`Collection "${name}" not found or empty, skipping.`);
    }
  }
  
  // Verify kept collections
  const productsCount = await db.collection('products').countDocuments();
  const categoriesCount = await db.collection('categories').countDocuments();
  console.log(`\nKept: ${productsCount} products, ${categoriesCount} categories`);
  
  // Also reset any isDeleted products back to visible
  const resetResult = await db.collection('products').updateMany(
    { isDeleted: true },
    { $set: { isDeleted: false, deletedAt: null, deletedBy: null, availability: true } }
  );
  console.log(`Reset ${resetResult.modifiedCount} soft-deleted products back to visible`);
  
  await mongoose.disconnect();
  console.log('\nCleanup complete! Only products and categories remain.');
}

main().catch(err => { console.error(err); process.exit(1); });
