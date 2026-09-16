const Product = require('../models/Product');
const Category = require('../models/Category');
const cloudinary = require('../config/cloudinary');
const mongoose = require('mongoose');

const uploadImage = (buffer) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(
    { folder: 'astrology_ecommerce/products', resource_type: 'image' },
    (error, result) => (error ? reject(error) : resolve(result)),
  );
  stream.end(buffer);
});

exports.createProduct = async (req, res) => {
  try {
    const { name, slug, category, price, discount, stock, description, sizes, tags, isFeatured } = req.body;

    const parsedPrice = Number(price);
    const parsedDiscount = discount ? Number(discount) : 0;
    const parsedStock = stock === undefined ? 0 : Number(stock);
    if (!name || !slug || !mongoose.isValidObjectId(category) || !Number.isFinite(parsedPrice) || !Number.isInteger(parsedStock) || parsedPrice < 0 || parsedStock < 0 || parsedDiscount < 0 || parsedDiscount > 100) {
      return res.status(400).json({ success: false, message: 'Please provide all valid required fields' });
    }
    if (!req.files?.length) {
      return res.status(400).json({ success: false, message: 'At least one product image is required' });
    }
    const categoryExists = await Category.exists({ _id: category, status: 'active' });
    if (!categoryExists) {
      return res.status(400).json({ success: false, message: 'Category does not exist or is inactive' });
    }

    let parsedSizes = [];
    if (sizes) {
      try {
        parsedSizes = JSON.parse(sizes);
      } catch (e) {
        parsedSizes = typeof sizes === 'string' ? sizes.split(',').map(s => s.trim()).filter(Boolean) : [];
      }
    }

    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = JSON.parse(tags);
      } catch (e) {
        parsedTags = typeof tags === 'string' ? tags.split(',').map(s => s.trim()).filter(Boolean) : [];
      }
    }

    const uploads = [];
    try {
      for (const file of req.files) uploads.push(await uploadImage(file.buffer));
    } catch (uploadError) {
      await Promise.allSettled(uploads.map(({ public_id }) => cloudinary.uploader.destroy(public_id)));
      throw uploadError;
    }

    let newProduct;
    try {
      newProduct = await Product.create({
        name,
        slug,
        category,
        price: parsedPrice,
        discount: parsedDiscount,
        stock: parsedStock,
        description,
        sizes: parsedSizes,
        tags: parsedTags,
        isFeatured: isFeatured === 'true' || isFeatured === true,
        images: uploads.map(({ secure_url }) => secure_url),
        imagePublicIds: uploads.map(({ public_id }) => public_id),
      });
    } catch (databaseError) {
      await Promise.allSettled(uploads.map(({ public_id }) => cloudinary.uploader.destroy(public_id)));
      throw databaseError;
    }

    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Product slug already exists' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = { isDeleted: false };
    if (req.query.category) {
      query.category = req.query.category;
    }

    const products = await Product.find(query)
      .populate('category', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: products
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product || product.isDeleted) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Soft delete
    product.isDeleted = true;
    product.deletedAt = new Date();
    product.deletedBy = req.admin._id;
    await product.save();

    res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getDeletedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isDeleted: true })
      .populate('category', 'name')
      .populate('deletedBy', 'email')
      .sort({ deletedAt: -1 });

    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
