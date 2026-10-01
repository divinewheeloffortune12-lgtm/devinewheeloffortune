const mongoose = require('mongoose');
require('dotenv').config();

async function migrate() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB for migration');

  const db = mongoose.connection.db;

  try {
    await db.collection('orders').dropIndex('expiresAt_1');
    console.log('Dropped TTL index from orders collection.');
  } catch (err) {
    console.log('Index expiresAt_1 not found on orders collection or already dropped.');
  }

  try {
    await db.collection('servicebookings').dropIndex('expiresAt_1');
    console.log('Dropped TTL index from servicebookings collection.');
  } catch (err) {
    console.log('Index expiresAt_1 not found on servicebookings collection or already dropped.');
  }
  
  // Clean up any stray expiresAt fields in successful orders to be extra safe
  const ordersRes = await db.collection('orders').updateMany(
    { paymentStatus: 'PAID' },
    { $unset: { expiresAt: 1 } }
  );
  console.log(`Cleaned up expiresAt field from ${ordersRes.modifiedCount} successful orders.`);

  const bookingsRes = await db.collection('servicebookings').updateMany(
    { paymentStatus: 'PAID' },
    { $unset: { expiresAt: 1 } }
  );
  console.log(`Cleaned up expiresAt field from ${bookingsRes.modifiedCount} successful bookings.`);

  await mongoose.disconnect();
  console.log('Migration complete.');
}

migrate().catch(console.error);
