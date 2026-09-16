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
  mrp: {
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

// Pre-save middleware to automatically calculate discount if missing or update it based on mrp/price
productSchema.pre('save', function(next) {
  if (this.mrp > 0 && this.price > 0 && this.mrp > this.price) {
    this.discount = Math.round(((this.mrp - this.price) / this.mrp) * 100);
  } else {
    this.discount = 0;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
