const express = require('express');
const router = express.Router();
const { getProjects, getProjectById, createProject, updateProject, deleteProject } = require('../controllers/projectController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate); // All routes protected

router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

module.exports = router;
