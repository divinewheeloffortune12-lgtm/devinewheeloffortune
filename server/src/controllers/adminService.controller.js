const Service = require('../models/Service');
const cloudinary = require('../config/cloudinary');

const uploadImage = (buffer) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(
    { folder: 'astrology/services', resource_type: 'image', format: 'webp', transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }] },
    (error, result) => (error ? reject(error) : resolve(result)),
  );
  stream.end(buffer);
});

exports.createService = async (req, res, next) => {
  try {
    const { name, description, price, duration, isActive } = req.body;
    let image = req.body.image;

    if (req.file) {
      const result = await uploadImage(req.file.buffer);
      image = result.secure_url;
    }

    const service = await Service.create({
      name,
      description,
      image,
      price,
      duration,
      isActive: isActive === 'true' || isActive === true
    });

    res.status(201).json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
};

exports.updateService = async (req, res, next) => {
  try {
    const { name, description, price, duration, isActive } = req.body;
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    if (req.file) {
      const result = await uploadImage(req.file.buffer);
      service.image = result.secure_url;
    } else if (req.body.image) {
      service.image = req.body.image;
    }

    if (name) service.name = name;
    if (description !== undefined) service.description = description;
    if (price) service.price = price;
    if (duration !== undefined) service.duration = duration;
    if (isActive !== undefined) service.isActive = isActive === 'true' || isActive === true;

    await service.save();

    res.json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
};

exports.deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.getAllServices = async (req, res, next) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: services });
  } catch (error) {
    next(error);
  }
};
