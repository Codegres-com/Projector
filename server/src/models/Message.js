const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  content: {
    type: String
  },
  attachments: [{
    type: String // URL or path to the file
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for faster queries
MessageSchema.index({ project: 1, createdAt: 1 });
MessageSchema.index({ sender: 1, recipient: 1, createdAt: 1 });

module.exports = mongoose.model('Message', MessageSchema);
