const mongoose = require('mongoose');

const connectDB = async () => {
  const dbUri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL;

  if (!dbUri) {
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ Error: MONGODB_URI is not defined in environment variables.');
      process.exit(1);
    }
    console.log('No MongoDB URI found. Starting In-Memory Database for development...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      await mongoose.connect(mongoServer.getUri());
      console.log('In-Memory MongoDB Connected');
      return;
    } catch (err) {
      console.error('Failed to start In-Memory DB:', err.message);
      process.exit(1);
    }
  }

  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(dbUri, {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
    });
    console.log(`🚀 MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error(`❌ Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
