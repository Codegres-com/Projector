const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');
const {
  getRequirements,
  getRequirement,
  createRequirement,
  updateRequirement,
  deleteRequirement
} = require('../controllers/requirements');

router.get('/', authenticate, checkPermission('requirements', 'read'), getRequirements);
router.get('/:id', authenticate, checkPermission('requirements', 'read'), getRequirement);
router.post('/', authenticate, checkPermission('requirements', 'create'), createRequirement);
router.put('/:id', authenticate, checkPermission('requirements', 'update'), updateRequirement);
router.delete('/:id', authenticate, checkPermission('requirements', 'delete'), deleteRequirement);

module.exports = router;
