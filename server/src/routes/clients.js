const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');
const {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient
} = require('../controllers/clients');

router.get('/', authenticate, checkPermission('clients', 'read'), getClients);
router.get('/:id', authenticate, checkPermission('clients', 'read'), getClient);
router.post('/', authenticate, checkPermission('clients', 'create'), createClient);
router.put('/:id', authenticate, checkPermission('clients', 'update'), updateClient);
router.delete('/:id', authenticate, checkPermission('clients', 'delete'), deleteClient);

module.exports = router;
