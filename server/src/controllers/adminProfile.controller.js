const Admin = require('../models/Admin');
const cloudinary = require('../config/cloudinary');

exports.getProfile = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.admin._id).select('-passwordHash');
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    res.json({ success: true, data: admin });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    if (name) admin.name = name;
    if (email) {
      const existing = await Admin.findOne({ email, _id: { $ne: req.admin._id } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
      admin.email = email;
    }

    if (req.file) {
      try {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'astrology_ecommerce/admins', resource_type: 'image' },
          async (error, result) => {
            if (error) return next(error);
            admin.profileImage = result.secure_url;
            await admin.save();
            res.json({ success: true, data: { name: admin.name, email: admin.email, profileImage: admin.profileImage } });
          }
        );
        stream.end(req.file.buffer);
        return;
      } catch (uploadError) {
        return next(uploadError);
      }
    }

    await admin.save();
    res.json({ success: true, data: { name: admin.name, email: admin.email, profileImage: admin.profileImage } });
  } catch (error) {
    next(error);
  }
};
