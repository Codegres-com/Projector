const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Private
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).send('Server error');
  }
};

// @desc    Create a new user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
  const { name, email, password, role, skills, availability } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password,
      role,
      skills,
      availability
    });

    await user.save();

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin (or Self?)
exports.updateUser = async (req, res) => {
  const { name, email, role, skills, availability, password } = req.body;

  // Build user object
  const userFields = {};
  if (name) userFields.name = name;
  if (email) userFields.email = email;
  if (role) userFields.role = role;
  if (skills) userFields.skills = skills;
  if (availability) userFields.availability = availability;
  if (password) userFields.password = password; // Will be hashed by pre-save hook? No, pre-save hook is on 'save()', if I use findByIdAndUpdate it might bypass middleware unless configured.
  // Better to use findById, update fields, and save() to trigger middleware if password changes.

  try {
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check permissions? Admin can update anyone. User can update themselves?
    // For now, let's restrict to Admin for simplicity as per requirements (Team Management module).
    // Or check if req.user.role === 'Admin' || req.user.id === req.params.id

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (skills) user.skills = skills;
    if (availability) user.availability = availability;
    if (password) user.password = password;

    await user.save();

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    // findByIdAndDelete does not return the doc in the same way sometimes, checking existence first is safer or use findById
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.deleteOne({ _id: req.params.id });

    res.json({ message: 'User removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
