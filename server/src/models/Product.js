const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  description: {
    type: String,
  },
  sizes: [{
    type: String
  }],
  tags: [{
    type: String
  }],
  isFeatured: {
    type: Boolean,
    default: false
  },
  images: [{
    type: String,
    required: true,
  }],
  imagePublicIds: [{
    type: String,
  }],
  availability: {
    type: Boolean,
    default: true,
  },
  // Shipping Information
  isShippingRequired: {
    type: Boolean,
    default: true,
  },
  shippingType: {
    type: String,
    enum: ['standard', 'express', 'digital', 'pickup'],
    default: 'standard'
  },
  shippingCharge: {
    type: Number,
    default: 0
  },
  freeShipping: {
    type: Boolean,
    default: false
  },
  estimatedDeliveryTime: {
    type: String, // e.g. "3-5 business days"
  },
  weight: {
    type: Number, // in kg or grams, depending on store convention
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  // Deletion logic
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser',
    default: null,
  }
}, { timestamps: true });

productSchema.index({ category: 1, isDeleted: 1, createdAt: -1 });
productSchema.index({ availability: 1, stock: 1 });

module.exports = mongoose.model('Product', productSchema);
