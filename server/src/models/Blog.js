const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  excerpt: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  author: {
    type: String,
    default: 'Nattasha Sharma',
  },
  keywords: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published'
  },
  showOnHomepage: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

blogSchema.index({ slug: 1 });
blogSchema.index({ status: 1 });
blogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Blog', blogSchema);
