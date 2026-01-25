const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser, getUserById } = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

router.use(authenticate); // All routes protected by JWT

// Team Management Routes
router.get('/', checkPermission('team', 'read'), getUsers);
router.post('/', checkPermission('team', 'create'), createUser);
router.get('/:id', checkPermission('team', 'read'), getUserById);
router.put('/:id', checkPermission('team', 'update'), updateUser);
router.delete('/:id', checkPermission('team', 'delete'), deleteUser);

module.exports = router;
