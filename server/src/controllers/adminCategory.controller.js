const mongoose = require('mongoose');
const Category = require('../models/Category');
const slugify = (value) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
exports.list = async (req, res, next) => { try { res.json({ success: true, data: await Category.find().populate('parent', 'name').sort({ sortOrder: 1, name: 1 }).lean() }); } catch (error) { next(error); } };
exports.create = async (req, res, next) => { try { const { name, slug, description, image, note, parent, sortOrder, status } = req.body; const finalSlug = slugify(slug || name || ''); if (!name?.trim() || !finalSlug || !image?.trim() || !note?.trim()) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Name, image, note and a valid slug are required.' } }); if (parent && !mongoose.isValidObjectId(parent)) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid parent category.' } }); const data = await Category.create({ name: name.trim(), slug: finalSlug, description, image, note, parent: parent || null, sortOrder: Number.isInteger(Number(sortOrder)) ? Number(sortOrder) : 0, status: status === 'inactive' ? 'inactive' : 'active' }); res.status(201).json({ success: true, data }); } catch (error) { next(error); } };
exports.update = async (req, res, next) => { try { const category = await Category.findById(req.params.id); if (!category) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Category not found.' } }); const fields = ['name', 'description', 'image', 'note', 'status', 'sortOrder']; fields.forEach((field) => { if (req.body[field] !== undefined) category[field] = req.body[field]; }); if (req.body.slug !== undefined) category.slug = slugify(req.body.slug); if (req.body.parent !== undefined) { if (req.body.parent && (!mongoose.isValidObjectId(req.body.parent) || req.body.parent === req.params.id)) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid parent category.' } }); category.parent = req.body.parent || null; } await category.save(); res.json({ success: true, data: category }); } catch (error) { next(error); } };
exports.archive = async (req, res, next) => { 
  try { 
    const category = await Category.findById(req.params.id); 
    if (!category) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Category not found.' } }); 
    
    const Product = require('../models/Product');
    // Soft delete all products in this category
    await Product.updateMany(
      { category: category._id }, 
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );
    
    // Completely delete the category as requested by user
    await Category.findByIdAndDelete(category._id);
    
    res.json({ success: true, message: 'Category and all associated products deleted successfully.' }); 
  } catch (error) { 
    next(error); 
  } 
};
