const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');
const {
  getEstimations,
  getEstimation,
  createEstimation,
  updateEstimation,
  deleteEstimation,
  generateAIEstimate
} = require('../controllers/estimations');

router.get('/', authenticate, checkPermission('estimations', 'read'), getEstimations);
router.get('/:id', authenticate, checkPermission('estimations', 'read'), getEstimation);
router.post('/', authenticate, checkPermission('estimations', 'create'), createEstimation);
router.put('/:id', authenticate, checkPermission('estimations', 'update'), updateEstimation);
router.delete('/:id', authenticate, checkPermission('estimations', 'delete'), deleteEstimation);
router.post('/ai-generate', authenticate, checkPermission('estimations', 'create'), generateAIEstimate);

module.exports = router;
