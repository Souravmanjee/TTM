const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  try {
    // Try to connect to the provided URI first
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2000 // Short timeout to quickly fallback
    });
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.log('Local MongoDB not found. Starting In-Memory Database as fallback...');
    try {
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log(`In-Memory MongoDB Connected: ${mongoUri}`);
      console.log('⚠️ Warning: Data will be lost when the server stops.');
    } catch (memError) {
      console.error(`Database connection error: ${memError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
