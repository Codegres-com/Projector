const Bug = require('../models/Bug');

// Get all bugs for a project
exports.getBugs = async (req, res) => {
  try {
    const { projectId } = req.query;
     if (!projectId) {
        return res.status(400).json({ msg: 'Project ID is required' });
    }
    const bugs = await Bug.find({ project: projectId })
      .populate('reporter', 'name email')
      .populate('assignee', 'name email')
      .sort({ createdAt: -1 });
    res.json(bugs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Create a bug
exports.createBug = async (req, res) => {
  try {
    const { title, description, severity, status, reproductionSteps, project, assignee } = req.body;

    const newBug = new Bug({
      title,
      description,
      severity,
      status,
      reproductionSteps,
      project,
      assignee,
      reporter: req.user.id // From auth middleware
    });

    const bug = await newBug.save();
    await bug.populate(['reporter', 'assignee']);

    res.json(bug);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update a bug
exports.updateBug = async (req, res) => {
  try {
    const { title, description, severity, status, reproductionSteps, assignee } = req.body;

    let bug = await Bug.findById(req.params.id);
    if (!bug) return res.status(404).json({ msg: 'Bug not found' });

    bug.title = title || bug.title;
    bug.description = description !== undefined ? description : bug.description;
    bug.severity = severity || bug.severity;
    bug.status = status || bug.status;
    bug.reproductionSteps = reproductionSteps !== undefined ? reproductionSteps : bug.reproductionSteps;
    bug.assignee = assignee || bug.assignee;

    await bug.save();
    await bug.populate(['reporter', 'assignee']);

    res.json(bug);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Delete a bug
exports.deleteBug = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id);
    if (!bug) return res.status(404).json({ msg: 'Bug not found' });

    await Bug.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Bug removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
