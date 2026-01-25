const express = require('express');
const router = express.Router();
const { getProjects, getProjectById, createProject, updateProject, deleteProject } = require('../controllers/projectController');
const { authenticate } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

router.use(authenticate); // All routes protected

router.get('/', checkPermission('projects', 'read'), getProjects);
router.get('/:id', checkPermission('projects', 'read'), getProjectById);
router.post('/', checkPermission('projects', 'create'), createProject);
router.put('/:id', checkPermission('projects', 'update'), updateProject);
router.delete('/:id', checkPermission('projects', 'delete'), deleteProject);

module.exports = router;
