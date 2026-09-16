const Announcement = require('../models/Announcement');
const { validationResult } = require('express-validator');
exports.listPublic = async (req, res, next) => { try { const data = await Announcement.find({ status: 'published' }).select('title content type createdAt').sort({ createdAt: -1 }).limit(20).lean(); res.json({ success: true, data }); } catch (error) { next(error); } };
exports.listAdmin = async (req, res, next) => { try { const data = await Announcement.find().populate('createdBy', 'email').sort({ createdAt: -1 }).limit(100).lean(); res.json({ success: true, data }); } catch (error) { next(error); } };
exports.create = async (req, res, next) => { try { const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid announcement', details: errors.array() } }); const data = await Announcement.create({ title: req.body.title, content: req.body.content, type: req.body.type || 'info', status: req.body.status || 'draft', createdBy: req.admin._id }); res.status(201).json({ success: true, data }); } catch (error) { next(error); } };
exports.update = async (req, res, next) => { try { const data = await Announcement.findByIdAndUpdate(req.params.id, { $set: { title: req.body.title, content: req.body.content, type: req.body.type, status: req.body.status } }, { new: true, runValidators: true }); if (!data) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Announcement not found.' } }); res.json({ success: true, data }); } catch (error) { next(error); } };
exports.archive = async (req, res, next) => { try { const data = await Announcement.findByIdAndUpdate(req.params.id, { status: 'archived' }, { new: true }); if (!data) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Announcement not found.' } }); res.json({ success: true, data }); } catch (error) { next(error); } };
exports.update = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid announcement', details: errors.array() } });
    const data = await Announcement.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        content: req.body.content,
        type: req.body.type,
        status: req.body.status
      },
      { new: true, runValidators: true }
    );
    if (!data) return res.status(404).json({ success: false, error: { message: 'Announcement not found' } });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.delete = async (req, res, next) => {
  try {
    const data = await Announcement.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, error: { message: 'Announcement not found' } });
    res.json({ success: true, data: {} });
  } catch (error) { next(error); }
};
