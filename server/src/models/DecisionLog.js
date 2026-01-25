const mongoose = require('mongoose');

const DecisionLogSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Proposed', 'Approved', 'Rejected'],
    default: 'Proposed'
  },
  context: {
    type: String,
    required: true,
    trim: true
  },
  decision: {
    type: String,
    required: true,
    trim: true
  },
  rationale: {
    type: String,
    required: true,
    trim: true
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

DecisionLogSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('DecisionLog', DecisionLogSchema);
