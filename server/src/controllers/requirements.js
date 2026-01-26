const Requirement = require('../models/Requirement');

// @desc    Get all requirements
// @route   GET /api/requirements
// @access  Private
exports.getRequirements = async (req, res) => {
  try {
    const requirements = await Requirement.find()
      .populate('client', 'name company')
      .sort({ createdAt: -1 });
    res.json(requirements);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get single requirement
// @route   GET /api/requirements/:id
// @access  Private
exports.getRequirement = async (req, res) => {
  try {
    const requirement = await Requirement.findById(req.params.id).populate('client');
    if (!requirement) {
      return res.status(404).json({ msg: 'Requirement not found' });
    }
    res.json(requirement);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Requirement not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Create new requirement
// @route   POST /api/requirements
// @access  Private
exports.createRequirement = async (req, res) => {
  const { title, details, client } = req.body;

  try {
    const newRequirement = new Requirement({
      title,
      details,
      client
    });

    const requirement = await newRequirement.save();
    res.json(requirement);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update requirement
// @route   PUT /api/requirements/:id
// @access  Private
exports.updateRequirement = async (req, res) => {
  const { title, details, status } = req.body;

  try {
    let requirement = await Requirement.findById(req.params.id);
    if (!requirement) {
      return res.status(404).json({ msg: 'Requirement not found' });
    }

    requirement.title = title || requirement.title;
    requirement.details = details || requirement.details;
    requirement.status = status || requirement.status;

    await requirement.save();
    res.json(requirement);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Requirement not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Delete requirement
// @route   DELETE /api/requirements/:id
// @access  Private
exports.deleteRequirement = async (req, res) => {
  try {
    const requirement = await Requirement.findById(req.params.id);
    if (!requirement) {
      return res.status(404).json({ msg: 'Requirement not found' });
    }

    await requirement.deleteOne();
    res.json({ msg: 'Requirement removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Requirement not found' });
    }
    res.status(500).send('Server Error');
  }
};
