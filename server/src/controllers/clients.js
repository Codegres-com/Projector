const Client = require('../models/Client');

// @desc    Get all clients
// @route   GET /api/clients
// @access  Private
exports.getClients = async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.json(clients);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get single client
// @route   GET /api/clients/:id
// @access  Private
exports.getClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ msg: 'Client not found' });
    }
    res.json(client);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Client not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Create new client
// @route   POST /api/clients
// @access  Private
exports.createClient = async (req, res) => {
  const { name, company, email, phone, address } = req.body;

  try {
    const newClient = new Client({
      name,
      company,
      email,
      phone,
      address
    });

    const client = await newClient.save();
    res.json(client);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Private
exports.updateClient = async (req, res) => {
  const { name, company, email, phone, address } = req.body;

  try {
    let client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ msg: 'Client not found' });
    }

    client.name = name || client.name;
    client.company = company || client.company;
    client.email = email || client.email;
    client.phone = phone || client.phone;
    client.address = address || client.address;

    await client.save();
    res.json(client);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Client not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Delete client
// @route   DELETE /api/clients/:id
// @access  Private
exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ msg: 'Client not found' });
    }

    await client.deleteOne();
    res.json({ msg: 'Client removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Client not found' });
    }
    res.status(500).send('Server Error');
  }
};
