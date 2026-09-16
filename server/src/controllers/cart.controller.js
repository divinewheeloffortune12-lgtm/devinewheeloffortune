const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const loadCart = (userId) => Cart.findOne({ user: userId }).populate('items.product', 'name slug price mrp stock availability images');
const assertProduct = async (id, quantity) => {
  if (!mongoose.isValidObjectId(id) || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) throw Object.assign(new Error('Invalid cart item'), { statusCode: 400, code: 'INVALID_CART_ITEM' });
  const product = await Product.findOne({ _id: id, isDeleted: false, availability: true });
  if (!product) throw Object.assign(new Error('Product is unavailable'), { statusCode: 409, code: 'PRODUCT_UNAVAILABLE' });
  if (product.stock < quantity) throw Object.assign(new Error('Requested quantity is unavailable'), { statusCode: 409, code: 'OUT_OF_STOCK' });
  return product;
};

exports.getCart = async (req, res, next) => { try { res.json({ success: true, data: (await loadCart(req.user._id)) || { items: [] } }); } catch (error) { next(error); } };
exports.addItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    await assertProduct(productId, quantity);
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });
    const item = cart.items.find((entry) => entry.product.toString() === productId);
    const nextQuantity = (item?.quantity || 0) + quantity;
    await assertProduct(productId, nextQuantity);
    if (item) item.quantity = nextQuantity; else cart.items.push({ product: productId, quantity });
    await cart.save();
    res.status(201).json({ success: true, data: await loadCart(req.user._id) });
  } catch (error) { next(error); }
};
exports.updateItem = async (req, res, next) => { try { const quantity = Number(req.body.quantity); const cart = await Cart.findOne({ user: req.user._id }); const item = cart?.items.id(req.params.itemId); if (!item) throw Object.assign(new Error('Cart item not found'), { statusCode: 404, code: 'NOT_FOUND' }); await assertProduct(item.product.toString(), quantity); item.quantity = quantity; await cart.save(); res.json({ success: true, data: await loadCart(req.user._id) }); } catch (error) { next(error); } };
exports.removeItem = async (req, res, next) => { try { const cart = await Cart.findOne({ user: req.user._id }); if (!cart || !cart.items.id(req.params.itemId)) throw Object.assign(new Error('Cart item not found'), { statusCode: 404, code: 'NOT_FOUND' }); cart.items.pull(req.params.itemId); await cart.save(); res.json({ success: true, data: await loadCart(req.user._id) }); } catch (error) { next(error); } };
