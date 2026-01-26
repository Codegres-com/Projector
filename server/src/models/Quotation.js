const mongoose = require('mongoose');

const QuotationSchema = new mongoose.Schema({
  estimation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Estimation',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Sent', 'Approved', 'Rejected'],
    default: 'Draft'
  },
  validUntil: {
    type: Date,
    required: true
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

QuotationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Quotation', QuotationSchema);
