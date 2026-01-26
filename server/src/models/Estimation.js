const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  role: { type: String, default: 'Developer' },
  hours: { type: Number, required: true },
  rate: { type: Number, required: true },
  cost: { type: Number, required: true }
}, { _id: false });

const EstimationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  requirement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Requirement',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  items: [ItemSchema],
  ironTriangle: {
    fixed: [{
      type: String,
      enum: ['Scope', 'Time', 'Cost']
    }], // Should contain exactly 2 items
    flexible: {
      type: String,
      enum: ['Scope', 'Time', 'Cost']
    }
  },
  currency: {
    type: String,
    default: 'USD'
  },
  totalHours: {
    type: Number,
    default: 0
  },
  totalCost: {
    type: Number,
    default: 0
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

EstimationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Estimation', EstimationSchema);
