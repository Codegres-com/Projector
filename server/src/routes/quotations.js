const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');
const {
  getQuotations,
  getQuotation,
  createQuotation,
  updateQuotation,
  deleteQuotation
} = require('../controllers/quotations');

router.get('/', authenticate, checkPermission('quotations', 'read'), getQuotations);
router.get('/:id', authenticate, checkPermission('quotations', 'read'), getQuotation);
router.post('/', authenticate, checkPermission('quotations', 'create'), createQuotation);
router.put('/:id', authenticate, checkPermission('quotations', 'update'), updateQuotation);
router.delete('/:id', authenticate, checkPermission('quotations', 'delete'), deleteQuotation);

module.exports = router;
