const mongoose = require('mongoose');

const deletedUserSchema = new mongoose.Schema({
  originalId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  name: String,
  email: String,
  mobile: String,
  role: {
    type: String,
    default: 'user'
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  deletedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: 'deleted'
  },
  originalCreatedAt: Date
});

module.exports = mongoose.model('DeletedUser', deletedUserSchema);
