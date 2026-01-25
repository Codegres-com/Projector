const express = require('express');
const router = express.Router();
const { getDocuments, uploadDocument, deleteDocument } = require('../controllers/documentController');
const { authenticate } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');
const upload = require('../middleware/upload');

router.use(authenticate);

router.get('/', checkPermission('documents', 'read'), getDocuments);
router.post('/', checkPermission('documents', 'create'), upload.single('file'), uploadDocument);
router.delete('/:id', checkPermission('documents', 'delete'), deleteDocument);

module.exports = router;
