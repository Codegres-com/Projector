const express = require('express');
const router = express.Router();
const credentialController = require('../controllers/credentialController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, credentialController.getCredentials);
router.post('/', authenticate, credentialController.createCredential);
router.put('/:id', authenticate, credentialController.updateCredential);
router.delete('/:id', authenticate, credentialController.deleteCredential);

module.exports = router;
