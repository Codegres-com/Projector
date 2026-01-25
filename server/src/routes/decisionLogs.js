const express = require('express');
const router = express.Router();
const decisionLogController = require('../controllers/decisionLogController');
const { authenticate } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

router.use(authenticate);

router.get('/', checkPermission('decisionLogs', 'read'), decisionLogController.getDecisionLogs);
router.post('/', checkPermission('decisionLogs', 'create'), decisionLogController.createDecisionLog);
router.put('/:id', checkPermission('decisionLogs', 'update'), decisionLogController.updateDecisionLog);
router.delete('/:id', checkPermission('decisionLogs', 'delete'), decisionLogController.deleteDecisionLog);

module.exports = router;
