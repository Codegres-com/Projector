const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@projector.com' });

    if (adminExists) {
      console.log('Admin user already exists');
      return;
    }

    const admin = new User({
      name: 'Admin User',
      email: 'admin@projector.com',
      password: 'password123',
      role: 'Admin',
      skills: 'Management, Architecture',
      availability: 'Full-time'
    });

    await admin.save();
    console.log('Admin user created successfully');
  } catch (err) {
    console.error('Seeding error:', err);
  }
};

module.exports = seedAdmin;
