require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later' },
});
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Data sanitization
app.use(mongoSanitize());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'TaskFlow Pro API is running', timestamp: new Date() });
});

// Serve static assets in production
const path = require('path');
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));

  app.get('*', (req, res) => {
    if (req.originalUrl.startsWith('/api')) {
      return res.status(404).json({ success: false, message: 'API route not found' });
    }
    res.sendFile(path.resolve(__dirname, '../../client', 'dist', 'index.html'));
  });
} else {
  app.use('*', (req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
  });
}

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    app.listen(PORT, async () => {
      console.log(`🚀 TaskFlow Pro server running on port ${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV}`);
      
      // Auto-seed if database is empty
      try {
        const User = require('./models/User');
        const count = await User.countDocuments();
        if (count === 0) {
          console.log('Database is empty. Seeding dummy data...');
          const seedDB = require('./seed');
          await seedDB();
        }
      } catch (err) {
        console.error('Auto-seed error:', err.message);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
