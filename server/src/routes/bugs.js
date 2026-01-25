const express = require('express');
const router = express.Router();
const { getBugs, createBug, updateBug, deleteBug } = require('../controllers/bugController');
const { authenticate } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

router.use(authenticate);

router.get('/', checkPermission('bugs', 'read'), getBugs);
router.post('/', checkPermission('bugs', 'create'), createBug);
router.put('/:id', checkPermission('bugs', 'update'), updateBug);
router.delete('/:id', checkPermission('bugs', 'delete'), deleteBug);

module.exports = router;
