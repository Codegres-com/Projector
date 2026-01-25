const Task = require('../models/Task');

// Get all tasks for a project
exports.getTasks = async (req, res) => {
  try {
    const { projectId } = req.query;
    if (!projectId) {
        return res.status(400).json({ msg: 'Project ID is required' });
    }
    const tasks = await Task.find({ project: projectId })
      .populate('assignee', 'name email')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Create a task
exports.createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, project, assignee } = req.body;

    const newTask = new Task({
      title,
      description,
      status,
      priority,
      dueDate,
      project,
      assignee
    });

    const task = await newTask.save();
    // Populate assignee for immediate frontend update
    await task.populate('assignee', 'name email');

    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignee } = req.body;

    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: 'Task not found' });

    task.title = title || task.title;
    task.description = description !== undefined ? description : task.description;
    task.status = status || task.status;
    task.priority = priority || task.priority;
    task.dueDate = dueDate || task.dueDate;
    task.assignee = assignee || task.assignee;

    await task.save();
    await task.populate('assignee', 'name email');

    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: 'Task not found' });

    await Task.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Task removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
