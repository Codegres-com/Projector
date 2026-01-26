const mongoose = require('mongoose');

const RequirementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  details: {
    type: String, // Rich text
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Finalized', 'Archived'],
    default: 'Draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

RequirementSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Requirement', RequirementSchema);
