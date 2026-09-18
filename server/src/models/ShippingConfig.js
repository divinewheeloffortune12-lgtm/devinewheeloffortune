const mongoose = require('mongoose');

const shippingConfigSchema = new mongoose.Schema({
  shippingCharge: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  freeShippingThreshold: {
    type: Number,
    required: true,
    default: 500,
    min: 0,
  },
}, { timestamps: true });

// Helper to get the single config document (upsert pattern)
shippingConfigSchema.statics.getConfig = async function () {
  let config = await this.findOne();
  if (!config) {
    config = await this.create({});
  }
  return config;
};

module.exports = mongoose.model('ShippingConfig', shippingConfigSchema);
