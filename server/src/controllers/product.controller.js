const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const sortFields = { newest: { createdAt: -1 }, 'price-asc': { price: 1, _id: 1 }, 'price-desc': { price: -1, _id: 1 }, name: { name: 1, _id: 1 } };

exports.listProducts = async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(48, Math.max(1, Number.parseInt(req.query.limit, 10) || 12));
    const query = { isDeleted: { $ne: true }, availability: { $ne: false } };
    if (req.query.category) {
      if (!mongoose.isValidObjectId(req.query.category)) {
        const cat = await Category.findOne({ slug: req.query.category });
        if (!cat) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Category not found' } });
        query.category = cat._id;
      } else {
        query.category = req.query.category;
      }
    }
    if (typeof req.query.q === 'string' && req.query.q.trim()) {
      const term = req.query.q.trim();
      if (term.length > 80) return res.status(400).json({ success: false, error: { code: 'INVALID_SEARCH', message: 'Search must be 80 characters or fewer' } });
      query.name = { $regex: escapeRegex(term), $options: 'i' };
    }
    const [products, total] = await Promise.all([
      Product.find(query).select('name slug category price discount tags isFeatured stock description images availability createdAt').populate('category', 'name').sort(sortFields[req.query.sort] || sortFields['price-desc']).skip((page - 1) * limit).limit(limit).lean(),
      Product.countDocuments(query),
    ]);
    res.json({ success: true, data: products, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

exports.getProductBySlug = async (req, res, next) => {
  try {
    const rawSlug = req.params.slug || '';
    const decodedSlug = decodeURIComponent(rawSlug).trim();
    const decodedSlugSpaces = decodeURIComponent(rawSlug.replace(/\+/g, ' ')).trim();
    const encodedSlug = encodeURIComponent(decodedSlug);
    
    const product = await Product.findOne({ 
      $or: [
        { slug: { $regex: new RegExp(`^\\s*${escapeRegex(decodedSlug)}\\s*$`, 'i') } },
        { slug: { $regex: new RegExp(`^\\s*${escapeRegex(decodedSlugSpaces)}\\s*$`, 'i') } },
        { slug: { $regex: new RegExp(`^\\s*${escapeRegex(encodedSlug)}\\s*$`, 'i') } },
        { slug: rawSlug }
      ],
      isDeleted: { $ne: true }, 
      availability: { $ne: false } 
    }).populate('category', 'name').lean();
    if (!product) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } });
    return res.json({ success: true, data: product });
  } catch (error) { return next(error); }
};

exports.validateCart = async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.json({ success: true, data: [] });
    }
    
    const products = await Product.find({ _id: { $in: items } })
      .select('name price stock availability isDeleted images slug description discount isShippingRequired shippingType shippingCharge freeShipping')
      .lean();
      
    return res.json({ success: true, data: products });
  } catch (error) {
    return next(error);
  }
};
