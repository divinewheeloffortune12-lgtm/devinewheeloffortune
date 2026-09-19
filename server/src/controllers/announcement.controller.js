const Announcement = require('../models/Announcement');
const { validationResult } = require('express-validator');

exports.listPublic = async (req, res, next) => { 
  try { 
    const query = { status: 'published' };
    if (req.user) {
      query.$or = [{ user: { $exists: false } }, { user: null }, { user: req.user._id }];
    } else {
      query.$or = [{ user: { $exists: false } }, { user: null }];
    }
    const data = await Announcement.find(query).select('title content type createdAt').sort({ createdAt: -1 }).limit(20).lean(); 
    res.json({ success: true, data }); 
  } catch (error) { next(error); } 
};

exports.listAdmin = async (req, res, next) => {
  try { 
    const data = await Announcement.find()
      .populate('createdBy', 'email')
      .populate('user', 'email name')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean(); 
    res.json({ success: true, data }); 
  } catch (error) { next(error); } 
};

exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid announcement', details: errors.array() } });
    }
    const data = await Announcement.create({
      title: req.body.title,
      content: req.body.content,
      type: req.body.type || 'info',
      status: req.body.status || 'draft',
      user: req.body.user || null,
      createdBy: req.admin ? req.admin._id : null
    });
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid announcement', details: errors.array() } });
    }
    const data = await Announcement.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          title: req.body.title,
          content: req.body.content,
          type: req.body.type,
          status: req.body.status
        }
      },
      { new: true, runValidators: true }
    );
    if (!data) return res.status(404).json({ success: false, error: { message: 'Announcement not found.' } });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.archive = async (req, res, next) => {
  try {
    const data = await Announcement.findByIdAndUpdate(req.params.id, { status: 'archived' }, { new: true });
    if (!data) return res.status(404).json({ success: false, error: { message: 'Announcement not found.' } });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.delete = async (req, res, next) => {
  try {
    const data = await Announcement.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, error: { message: 'Announcement not found.' } });
    res.json({ success: true, data: {} });
  } catch (error) { next(error); }
};

// Internal method for system-generated announcements
exports.createSystemAnnouncement = async ({ title, content, type, userId }) => {
  try {
    // Make it idempotent by checking if similar announcement exists recently (within 24 hours) for this user
    const recent = await Announcement.findOne({
      title,
      user: userId,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    if (recent) return recent;

    return await Announcement.create({
      title,
      content,
      type,
      status: 'published',
      user: userId
    });
  } catch (error) {
    console.error('Failed to create system announcement:', error);
  }
};
