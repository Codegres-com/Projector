const express = require('express');
const router = express.Router();
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

router.use(authenticate);

router.get('/', checkPermission('tasks', 'read'), getTasks);
router.post('/', checkPermission('tasks', 'create'), createTask);
router.put('/:id', checkPermission('tasks', 'update'), updateTask);
router.delete('/:id', checkPermission('tasks', 'delete'), deleteTask);

module.exports = router;
