const express = require('express');
const router = express.Router();
const credentialController = require('../controllers/credentialController');
const { authenticate } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

router.use(authenticate);

router.get('/', checkPermission('credentials', 'read'), credentialController.getCredentials);
router.post('/', checkPermission('credentials', 'create'), credentialController.createCredential);
router.put('/:id', checkPermission('credentials', 'update'), credentialController.updateCredential);
router.delete('/:id', checkPermission('credentials', 'delete'), credentialController.deleteCredential);

module.exports = router;
