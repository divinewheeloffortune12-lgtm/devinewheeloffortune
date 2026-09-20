const mongoose = require('mongoose');
const Category = require('../models/Category');
const cloudinary = require('../config/cloudinary');
const slugify = (value) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const uploadImage = (buffer) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(
    { folder: 'astrology_ecommerce/categories', resource_type: 'image' },
    (error, result) => (error ? reject(error) : resolve(result)),
  );
  stream.end(buffer);
});

exports.list = async (req, res, next) => { 
  try { 
    res.json({ success: true, data: await Category.find().populate('parent', 'name').sort({ sortOrder: 1, name: 1 }).lean() }); 
  } catch (error) { 
    next(error); 
  } 
};

exports.create = async (req, res, next) => { 
  try { 
    const { name, slug, description, image, note, parent, sortOrder, status } = req.body; 
    const finalSlug = slugify(slug || name || ''); 
    
    let imageUrl = image;
    if (req.file) {
      try {
        const uploadResult = await uploadImage(req.file.buffer);
        imageUrl = uploadResult.secure_url;
      } catch (uploadError) {
        return next(uploadError);
      }
    }

    if (!name?.trim() || !finalSlug || !imageUrl?.trim() || !note?.trim()) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Name, image, note and a valid slug are required.' } }); 
    }
    
    if (parent && !mongoose.isValidObjectId(parent)) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid parent category.' } }); 
    }
    
    let uniqueSlug = finalSlug;
    let slugExists = await Category.exists({ slug: uniqueSlug });
    if (slugExists) {
      uniqueSlug = `${finalSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    
    const data = await Category.create({ 
      name: name.trim(), 
      slug: uniqueSlug, 
      description, 
      image: imageUrl, 
      note, 
      parent: parent || null, 
      sortOrder: Number.isInteger(Number(sortOrder)) ? Number(sortOrder) : 0, 
      status: status === 'inactive' ? 'inactive' : 'active' 
    }); 
    
    res.status(201).json({ success: true, data }); 
  } catch (error) { 
    next(error); 
  } 
};

exports.update = async (req, res, next) => { 
  try { 
    const category = await Category.findById(req.params.id); 
    if (!category) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Category not found.' } }); 
    
    const fields = ['name', 'description', 'note', 'status', 'sortOrder']; 
    fields.forEach((field) => { 
      if (req.body[field] !== undefined) category[field] = req.body[field]; 
    }); 
    
    if (req.file) {
      try {
        const uploadResult = await uploadImage(req.file.buffer);
        category.image = uploadResult.secure_url;
      } catch (uploadError) {
        return next(uploadError);
      }
    } else if (req.body.image !== undefined) {
      category.image = req.body.image;
    }

    if (req.body.slug !== undefined) {
      let candidateSlug = slugify(req.body.slug);
      let slugExists = await Category.exists({ slug: candidateSlug, _id: { $ne: category._id } });
      if (slugExists) {
        candidateSlug = `${candidateSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
      }
      category.slug = candidateSlug;
    }
    if (req.body.parent !== undefined) { 
      if (req.body.parent && (!mongoose.isValidObjectId(req.body.parent) || req.body.parent === req.params.id)) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid parent category.' } }); 
      }
      category.parent = req.body.parent || null; 
    } 
    
    await category.save(); 
    res.json({ success: true, data: category }); 
  } catch (error) { 
    next(error); 
  } 
};

exports.archive = async (req, res, next) => { 
  try { 
    const category = await Category.findById(req.params.id); 
    if (!category) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Category not found.' } }); 
    
    const Product = require('../models/Product');
    // Hard delete all products in this category
    const productsToDelete = await Product.find({ category: category._id });
    const productIds = productsToDelete.map(p => p._id);
    
    // Cleanup product images from cloudinary
    productsToDelete.forEach(product => {
      if (product.imagePublicIds && product.imagePublicIds.length > 0) {
        Promise.allSettled(product.imagePublicIds.map(id => cloudinary.uploader.destroy(id))).catch(console.error);
      }
    });

    await Product.deleteMany({ category: category._id });
    
    // Completely delete the category as requested by user
    await Category.findByIdAndDelete(category._id);
    
    res.json({ success: true, message: 'Category and all associated products deleted successfully.' }); 
  } catch (error) { 
    next(error); 
  } 
};
