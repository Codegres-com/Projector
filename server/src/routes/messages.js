const express = require('express');
const router = express.Router();
const { sendMessage, getMessages } = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(authenticate);

// Limit attachments to 5 files per message for now
router.post('/', upload.array('attachments', 5), sendMessage);
router.get('/', getMessages);

module.exports = router;
