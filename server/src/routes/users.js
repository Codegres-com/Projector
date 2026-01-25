const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser, getUserById } = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate); // All routes protected

router.get('/', getUsers);
router.post('/', authorize('Admin'), createUser);
router.get('/:id', getUserById);
router.put('/:id', authorize('Admin'), updateUser);
router.delete('/:id', authorize('Admin'), deleteUser);

module.exports = router;
