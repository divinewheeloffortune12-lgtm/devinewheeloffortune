const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variantSku: { type: String, default: null },
  quantity: { type: Number, required: true, min: 1, max: 99 },
}, { _id: true });

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  items: { type: [itemSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
