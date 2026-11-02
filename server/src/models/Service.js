const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, unique: true, sparse: true },
  description: { type: String },
  image: { type: String },
  price: { type: Number, required: true },
  duration: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

serviceSchema.index({ slug: 1 });

module.exports = mongoose.model('Service', serviceSchema);

