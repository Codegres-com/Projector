const Credential = require('../models/Credential');

// @desc    Get all credentials for a project
// @route   GET /api/credentials?projectId=:projectId
// @access  Private
exports.getCredentials = async (req, res) => {
  const { projectId } = req.query;

  try {
    const query = projectId ? { project: projectId } : {};
    const credentials = await Credential.find(query).sort({ createdAt: -1 });
    res.json(credentials);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Create a new credential
// @route   POST /api/credentials
// @access  Private
exports.createCredential = async (req, res) => {
  const { project, title, url, username, password, description } = req.body;

  try {
    const newCredential = new Credential({
      project,
      title,
      url,
      username,
      password,
      description
    });

    const credential = await newCredential.save();
    res.json(credential);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Update credential
// @route   PUT /api/credentials/:id
// @access  Private
exports.updateCredential = async (req, res) => {
  const { title, url, username, password, description } = req.body;

  try {
    let credential = await Credential.findById(req.params.id);

    if (!credential) {
      return res.status(404).json({ message: 'Credential not found' });
    }

    credential.title = title || credential.title;
    credential.url = url !== undefined ? url : credential.url;
    credential.username = username !== undefined ? username : credential.username;
    credential.password = password || credential.password;
    credential.description = description !== undefined ? description : credential.description;

    await credential.save();
    res.json(credential);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Delete credential
// @route   DELETE /api/credentials/:id
// @access  Private
exports.deleteCredential = async (req, res) => {
  try {
    const credential = await Credential.findById(req.params.id);

    if (!credential) {
      return res.status(404).json({ message: 'Credential not found' });
    }

    await Credential.deleteOne({ _id: req.params.id });
    res.json({ message: 'Credential removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
