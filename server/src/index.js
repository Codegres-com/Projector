const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const passport = require('passport');
const connectDB = require('./config/db');
const seedAdmin = require('./utils/seeder');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB().then(() => {
  seedAdmin();
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Passport Config
require('./config/passport')(passport);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/projects', require('./routes/projects'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running', timestamp: new Date() });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
