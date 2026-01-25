const Document = require('../models/Document');
const fs = require('fs');
const path = require('path');

// Get all documents for a project
exports.getDocuments = async (req, res) => {
  try {
    const { projectId } = req.query;
     if (!projectId) {
        return res.status(400).json({ msg: 'Project ID is required' });
    }
    const docs = await Document.find({ project: projectId })
      .populate('uploader', 'name email')
      .sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Upload a document
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }
    const { project } = req.body;

    const newDoc = new Document({
      title: req.body.title || req.file.originalname,
      filePath: req.file.path, // This is relative or absolute path depending on multer config
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      project,
      uploader: req.user.id
    });

    const doc = await newDoc.save();
    await doc.populate('uploader', 'name email');

    res.json(doc);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Delete a document
exports.deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ msg: 'Document not found' });

    // Try to delete file from disk
    const fullPath = path.resolve(doc.filePath);
    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
    }

    await Document.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Document removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
