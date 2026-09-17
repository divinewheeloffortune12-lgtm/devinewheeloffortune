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
    const { 
      name, slug, category, price, discount, stock, description, sizes, tags, isFeatured,
      isShippingRequired, shippingType, shippingCharge, freeShipping, estimatedDeliveryTime, weight,
      dimensions_length, dimensions_width, dimensions_height
    } = req.body;

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
        isShippingRequired: isShippingRequired === 'true' || isShippingRequired === true,
        shippingType: shippingType || 'standard',
        shippingCharge: shippingCharge ? Number(shippingCharge) : 0,
        freeShipping: freeShipping === 'true' || freeShipping === true,
        estimatedDeliveryTime,
        weight: weight ? Number(weight) : undefined,
        dimensions: {
          length: dimensions_length ? Number(dimensions_length) : undefined,
          width: dimensions_width ? Number(dimensions_width) : undefined,
          height: dimensions_height ? Number(dimensions_height) : undefined
        }
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

exports.toggleProductAvailability = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || product.isDeleted) return res.status(404).json({ success: false, message: 'Product not found' });
    
    product.availability = !product.availability;
    await product.save();
    
    res.status(200).json({ success: true, data: product });
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

exports.updateProduct = async (req, res) => {
  try {
    const { 
      name, slug, category, price, discount, stock, description, sizes, tags, isFeatured,
      isShippingRequired, shippingType, shippingCharge, freeShipping, estimatedDeliveryTime, weight,
      dimensions_length, dimensions_width, dimensions_height, existingImages
    } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product || product.isDeleted) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const parsedPrice = Number(price);
    const parsedDiscount = discount ? Number(discount) : 0;
    const parsedStock = stock === undefined ? product.stock : Number(stock);
    
    if (!name || !slug || !mongoose.isValidObjectId(category) || !Number.isFinite(parsedPrice) || !Number.isInteger(parsedStock) || parsedPrice < 0 || parsedStock < 0 || parsedDiscount < 0 || parsedDiscount > 100) {
      return res.status(400).json({ success: false, message: 'Please provide all valid required fields' });
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

    // Handle existing images retained
    let retainedImages = [];
    if (existingImages) {
       try {
         retainedImages = JSON.parse(existingImages);
       } catch(e) {
         retainedImages = typeof existingImages === 'string' ? [existingImages] : [];
       }
    }

    // Determine which images to delete from cloudinary
    const imagesToDelete = product.images.map((url, i) => ({ url, public_id: product.imagePublicIds[i] }))
                                         .filter(img => !retainedImages.includes(img.url));

    const uploads = [];
    try {
      if (req.files && req.files.length) {
        for (const file of req.files) uploads.push(await uploadImage(file.buffer));
      }
    } catch (uploadError) {
      await Promise.allSettled(uploads.map(({ public_id }) => cloudinary.uploader.destroy(public_id)));
      throw uploadError;
    }

    if (retainedImages.length === 0 && uploads.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one product image is required' });
    }

    // Cleanup deleted images async
    if (imagesToDelete.length > 0) {
      Promise.allSettled(imagesToDelete.map(img => cloudinary.uploader.destroy(img.public_id))).catch(console.error);
    }

    const finalImages = [];
    const finalPublicIds = [];
    
    // Reconstruct images array based on retained + new
    product.images.forEach((url, i) => {
      if (retainedImages.includes(url)) {
        finalImages.push(url);
        finalPublicIds.push(product.imagePublicIds[i]);
      }
    });
    uploads.forEach(u => {
      finalImages.push(u.secure_url);
      finalPublicIds.push(u.public_id);
    });

    product.name = name;
    product.slug = slug;
    product.category = category;
    product.price = parsedPrice;
    product.discount = parsedDiscount;
    product.stock = parsedStock;
    product.description = description;
    product.sizes = parsedSizes;
    product.tags = parsedTags;
    product.isFeatured = isFeatured === 'true' || isFeatured === true;
    product.images = finalImages;
    product.imagePublicIds = finalPublicIds;
    
    // Shipping fields
    if (isShippingRequired !== undefined) product.isShippingRequired = isShippingRequired === 'true' || isShippingRequired === true;
    if (shippingType) product.shippingType = shippingType;
    if (shippingCharge !== undefined) product.shippingCharge = Number(shippingCharge) || 0;
    if (freeShipping !== undefined) product.freeShipping = freeShipping === 'true' || freeShipping === true;
    if (estimatedDeliveryTime !== undefined) product.estimatedDeliveryTime = estimatedDeliveryTime;
    if (weight !== undefined) product.weight = Number(weight) || undefined;
    if (dimensions_length || dimensions_width || dimensions_height) {
      product.dimensions = {
        length: Number(dimensions_length) || undefined,
        width: Number(dimensions_width) || undefined,
        height: Number(dimensions_height) || undefined
      };
    }

    await product.save();

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Product slug already exists' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

 e x p o r t s . g e t P r o d u c t B y I d   =   a s y n c   ( r e q ,   r e s )   = >   { 
     t r y   { 
         c o n s t   p r o d u c t   =   a w a i t   P r o d u c t . f i n d B y I d ( r e q . p a r a m s . i d ) . p o p u l a t e ( " c a t e g o r y " ,   " n a m e " ) ; 
         i f   ( ! p r o d u c t   | |   p r o d u c t . i s D e l e t e d )   { 
             r e t u r n   r e s . s t a t u s ( 4 0 4 ) . j s o n ( {   s u c c e s s :   f a l s e ,   m e s s a g e :   " P r o d u c t   n o t   f o u n d "   } ) ; 
         } 
         r e s . s t a t u s ( 2 0 0 ) . j s o n ( {   s u c c e s s :   t r u e ,   d a t a :   p r o d u c t   } ) ; 
     }   c a t c h   ( e r r o r )   { 
         c o n s o l e . e r r o r ( e r r o r ) ; 
         r e s . s t a t u s ( 5 0 0 ) . j s o n ( {   s u c c e s s :   f a l s e ,   m e s s a g e :   " S e r v e r   e r r o r "   } ) ; 
     } 
 } ; 
  
 