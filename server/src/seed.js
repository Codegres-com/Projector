const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

const seedUsers = async () => {
  try {
    await connectDB();

    const adminExists = await User.findOne({ email: 'admin@projector.com' });

    if (adminExists) {
      console.log('Admin user already exists');
      process.exit();
    }

    const admin = new User({
      name: 'Admin User',
      email: 'admin@projector.com',
      password: 'password123', // Will be hashed by pre-save
      role: 'Admin',
      skills: 'Management, Architecture',
      availability: 'Full-time'
    });

    await admin.save();

    console.log('Admin user created successfully');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedUsers();
