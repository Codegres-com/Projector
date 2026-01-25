const express = require('express');
const router = express.Router();
const decisionLogController = require('../controllers/decisionLogController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, decisionLogController.getDecisionLogs);
router.post('/', authenticate, decisionLogController.createDecisionLog);
router.put('/:id', authenticate, decisionLogController.updateDecisionLog);
router.delete('/:id', authenticate, decisionLogController.deleteDecisionLog);

module.exports = router;
