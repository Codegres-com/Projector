const express = require('express');
const router = express.Router();
const passport = require('passport');
const Role = require('../models/Role');
const { checkPermission } = require('../middleware/rbac');

// Protect all routes
router.use(passport.authenticate('jwt', { session: false }));

// @route   GET api/roles
// @desc    Get all roles
// @access  Private (roles:read)
router.get('/', checkPermission('roles', 'read'), async (req, res) => {
  try {
    const roles = await Role.find();
    res.json(roles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/roles
// @desc    Create a new role
// @access  Private (roles:create)
router.post('/', checkPermission('roles', 'create'), async (req, res) => {
  const { name, description, permissions } = req.body;

  try {
    let role = await Role.findOne({ name });
    if (role) {
      return res.status(400).json({ msg: 'Role already exists' });
    }

    role = new Role({
      name,
      description,
      permissions,
      isSystem: false // Custom roles are never system roles
    });

    await role.save();
    res.json(role);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/roles/:id
// @desc    Update a role (permissions or details)
// @access  Private (roles:update)
router.put('/:id', checkPermission('roles', 'update'), async (req, res) => {
  const { name, description, permissions } = req.body;

  try {
    let role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ msg: 'Role not found' });
    }

    // Protection logic
    if (role.isSystem) {
      // If it is the Admin role, prevent ALL changes
      if (role.name === 'Admin') {
        return res.status(403).json({ msg: 'Cannot modify the Admin role' });
      }

      // For other system roles (PM, Developer, Client), prevent name change
      if (name && name !== role.name) {
         return res.status(403).json({ msg: 'Cannot rename system roles' });
      }

      // Allow updating description and permissions
    }

    // Update fields
    if (name) role.name = name;
    if (description) role.description = description;
    if (permissions) role.permissions = permissions;

    await role.save();
    res.json(role);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/roles/:id
// @desc    Delete a role
// @access  Private (roles:delete)
router.delete('/:id', checkPermission('roles', 'delete'), async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({ msg: 'Role not found' });
    }

    if (role.isSystem) {
      return res.status(403).json({ msg: 'Cannot delete system roles' });
    }

    // Check if role is in use
    const User = require('../models/User'); // Lazy load
    const userCount = await User.countDocuments({ role: role._id });
    if (userCount > 0) {
        return res.status(400).json({ msg: `Cannot delete role. It is assigned to ${userCount} users.` });
    }

    await role.deleteOne();
    res.json({ msg: 'Role removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
