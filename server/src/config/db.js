const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      // Use In-Memory DB if no URI provided
      console.log('No MONGO_URI found, starting in-memory MongoDB...');
      const mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
    }

    const conn = await mongoose.connect(mongoUri, {
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
