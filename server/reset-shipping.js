const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });
const ShippingConfig = require('./src/models/ShippingConfig');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log("Connected to MongoDB...");
  const config = await ShippingConfig.getConfig();
  console.log("Old Config:", config);
  config.shippingCharge = 0;
  await config.save();
  console.log("New Config:", await ShippingConfig.getConfig());
  process.exit(0);
}).catch(err => {
  console.error("Failed to connect:", err);
  process.exit(1);
});
