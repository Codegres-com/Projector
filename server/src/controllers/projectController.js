const Project = require('../models/Project');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('client', 'name email')
      .populate('manager', 'name email')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'name email')
      .populate('manager', 'name email')
      .populate('team', 'name email role skills availability');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(500).send('Server error');
  }
};

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res) => {
  const { name, description, status, startDate, endDate, client, manager, team } = req.body;

  try {
    const newProject = new Project({
      name,
      description,
      status,
      startDate,
      endDate,
      client,
      manager,
      team
    });

    const project = await newProject.save();

    // Populate the returned project so the frontend can display names immediately if needed
    // (Optional, but helpful)
    const populatedProject = await Project.findById(project._id)
      .populate('client', 'name')
      .populate('manager', 'name');

    res.json(populatedProject);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res) => {
  const { name, description, status, startDate, endDate, client, manager, team } = req.body;

  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.name = name || project.name;
    project.description = description !== undefined ? description : project.description;
    project.status = status || project.status;
    project.startDate = startDate !== undefined ? startDate : project.startDate;
    project.endDate = endDate !== undefined ? endDate : project.endDate;
    project.client = client !== undefined ? client : project.client;
    project.manager = manager !== undefined ? manager : project.manager;
    project.team = team !== undefined ? team : project.team;

    await project.save();

    const updatedProject = await Project.findById(req.params.id)
      .populate('client', 'name email')
      .populate('manager', 'name email')
      .populate('team', 'name email');

    res.json(updatedProject);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await Project.deleteOne({ _id: req.params.id });

    res.json({ message: 'Project removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
