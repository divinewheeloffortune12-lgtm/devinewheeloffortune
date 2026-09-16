const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  slug: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  description: { type: String, trim: true, maxlength: 1000 },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  image: {
    type: String,
    required: true,
  },
  note: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  sortOrder: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

categorySchema.index({ parent: 1, status: 1, sortOrder: 1 });

module.exports = mongoose.model('Category', categorySchema);
