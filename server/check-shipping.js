const mongoose = require('mongoose');
const ShippingConfig = require('./src/models/ShippingConfig');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const config = await ShippingConfig.getConfig();
  console.log("Current DB Config:", config);
  
  // Set it to what the admin probably wanted (0)?
  // Let's just read first.
  process.exit(0);
});
