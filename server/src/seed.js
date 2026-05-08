require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');

const seedDB = async () => {
  try {
    // Only connect if not already connected
    if (mongoose.connection.readyState === 0) {
      console.log('Connecting to MongoDB for seeding...');
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('Connected to MongoDB');
    } else {
      console.log('Using existing database connection for seeding');
    }

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@taskflow.com',
      password: 'admin123',
      role: 'admin',
    });

    const member1 = await User.create({
      name: 'Sarah Chen',
      email: 'sarah@taskflow.com',
      password: 'password123',
      role: 'member',
    });

    const member2 = await User.create({
      name: 'James Wilson',
      email: 'james@taskflow.com',
      password: 'password123',
      role: 'member',
    });

    console.log('Created users');

    // Create projects
    const project1 = await Project.create({
      name: 'Website Redesign',
      description: 'Complete redesign of the company website with modern UI/UX',
      owner: admin._id,
      members: [
        { user: admin._id, role: 'admin' },
        { user: member1._id, role: 'member' },
        { user: member2._id, role: 'member' },
      ],
      color: '#6366f1',
    });

    const project2 = await Project.create({
      name: 'Mobile App Development',
      description: 'Build a cross-platform mobile application',
      owner: admin._id,
      members: [
        { user: admin._id, role: 'admin' },
        { user: member1._id, role: 'member' },
      ],
      color: '#8b5cf6',
    });

    console.log('Created projects');

    // Create tasks
    const tasks = [
      { title: 'Design homepage mockup', description: 'Create wireframes and high-fidelity mockups for the homepage', status: 'completed', priority: 'high', project: project1._id, assignee: member1._id, createdBy: admin._id, order: 0 },
      { title: 'Implement auth system', description: 'Build login, register, and password reset flows', status: 'in-progress', priority: 'urgent', project: project1._id, assignee: member2._id, createdBy: admin._id, order: 0 },
      { title: 'Setup CI/CD pipeline', description: 'Configure GitHub Actions for automated testing and deployment', status: 'todo', priority: 'medium', project: project1._id, assignee: admin._id, createdBy: admin._id, order: 0 },
      { title: 'Write API documentation', description: 'Document all REST API endpoints with examples', status: 'todo', priority: 'low', project: project1._id, assignee: member1._id, createdBy: admin._id, order: 1 },
      { title: 'Database optimization', description: 'Add indexes and optimize slow queries', status: 'in-review', priority: 'high', project: project1._id, assignee: member2._id, createdBy: admin._id, order: 0 },
      { title: 'Design app screens', description: 'Create UI designs for all mobile app screens', status: 'in-progress', priority: 'high', project: project2._id, assignee: member1._id, createdBy: admin._id, order: 0 },
      { title: 'Setup React Native project', description: 'Initialize the React Native project with required dependencies', status: 'completed', priority: 'medium', project: project2._id, assignee: member1._id, createdBy: admin._id, order: 0 },
      { title: 'Implement push notifications', description: 'Add push notification support for iOS and Android', status: 'todo', priority: 'medium', project: project2._id, assignee: null, createdBy: admin._id, order: 0 },
    ];

    await Task.insertMany(tasks);
    console.log('Created tasks');

    console.log('\n✅ Database seeded successfully!');
    console.log('\nTest Accounts:');
    console.log('Admin: admin@taskflow.com / admin123');
    console.log('Member: sarah@taskflow.com / password123');
    console.log('Member: james@taskflow.com / password123');

    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    console.error('Seed error:', error);
    if (require.main === module) {
      process.exit(1);
    }
  }
};

if (require.main === module) {
  seedDB();
}

module.exports = seedDB;
