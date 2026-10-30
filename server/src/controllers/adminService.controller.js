const Service = require('../models/Service');
const cloudinary = require('../config/cloudinary');

/**
 * Extract a Cloudinary public_id from a secure URL.
 * Returns null if it cannot be determined.
 */
const getPublicIdFromUrl = (url) => {
  if (!url || !url.includes('cloudinary.com')) return null;
  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    // Remove version segment (v1234567890/) if present
    let path = parts[1].replace(/^v\d+\//, '');
    // Remove file extension
    path = path.replace(/\.[^/.]+$/, '');
    return path;
  } catch {
    return null;
  }
};

const uploadImage = (buffer) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(
    { folder: 'astrology/services', resource_type: 'image', format: 'webp', transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }] },
    (error, result) => (error ? reject(error) : resolve(result)),
  );
  stream.end(buffer);
});

const slugify = (value) => (value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

exports.createService = async (req, res, next) => {
  try {
    const { name, description, price, duration, isActive, slug } = req.body;
    let image = req.body.image;

    if (req.file) {
      const result = await uploadImage(req.file.buffer);
      image = result.secure_url;
    }

    const finalSlug = slugify(slug || name) || undefined;

    const service = await Service.create({
      name,
      slug: finalSlug,
      description,
      image,
      price,
      duration,
      isActive: isActive === 'true' || isActive === true
    });

    if (req.app?.locals?.invalidateCache) {
      req.app.locals.invalidateCache('/api/bookings/services');
    }

    res.status(201).json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
};

exports.updateService = async (req, res, next) => {
  try {
    const { name, description, price, duration, isActive, slug } = req.body;
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    if (req.file) {
      // FIX: Delete old Cloudinary image when replacing a service image
      const oldImageUrl = service.image;
      const result = await uploadImage(req.file.buffer);
      service.image = result.secure_url;
      // Async cleanup of old image
      if (oldImageUrl) {
        const oldPublicId = getPublicIdFromUrl(oldImageUrl);
        if (oldPublicId) {
          cloudinary.uploader.destroy(oldPublicId).catch((err) =>
            console.error(`[Cloudinary] Failed to delete old service image ${oldPublicId}:`, err)
          );
        }
      }
    } else if (req.body.image) {
      service.image = req.body.image;
    }

    if (name) {
      service.name = name;
      if (!service.slug || slug) {
        service.slug = slugify(slug || name);
      }
    } else if (slug) {
      service.slug = slugify(slug);
    }
    if (description !== undefined) service.description = description;
    if (price) service.price = price;
    if (duration !== undefined) service.duration = duration;
    if (isActive !== undefined) service.isActive = isActive === 'true' || isActive === true;

    await service.save();

    if (req.app?.locals?.invalidateCache) {
      req.app.locals.invalidateCache('/api/bookings/services');
    }

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
    // FIX: Clean up the service's Cloudinary image on deletion
    if (service.image) {
      const publicId = getPublicIdFromUrl(service.image);
      if (publicId) {
        cloudinary.uploader.destroy(publicId).catch((err) =>
          console.error(`[Cloudinary] Failed to delete service image ${publicId}:`, err)
        );
      }
    }

    if (req.app?.locals?.invalidateCache) {
      req.app.locals.invalidateCache('/api/bookings/services');
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
