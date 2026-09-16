require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const AdminUser = require('../models/Admin');

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 12) throw new Error('Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters in server/.env');
  await connectDB();
  if (await AdminUser.exists({ email })) throw new Error('An admin with this email already exists; reset its password through an audited admin-recovery process.');
  await AdminUser.create({ email, passwordHash: await bcrypt.hash(password, 12), role: 'super_admin', status: 'active' });
  console.log(`Admin account created for ${email}`);
  process.exit(0);
}
main().catch((error) => { console.error(error.message); process.exit(1); });
