const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecosmart_city';

async function seedDatabase() {
  try {
    const count = await User.countDocuments();
    if (count === 0) {
      console.log('🚀 Seeding default accounts...');
      const hashedAdm = await bcrypt.hash('admin1234', 10);
      const hashedCit = await bcrypt.hash('demo1234', 10);
      
      await User.create([
        { name: 'Admin Kumar', email: 'admin@karnataka.gov.in', password: hashedAdm, role: 'admin' },
        { name: 'Rahul Sharma', email: 'citizen@karnataka.gov.in', password: hashedCit, role: 'citizen' }
      ]);
      console.log('✅ Default accounts seeded: admin@karnataka.gov.in / citizen@karnataka.gov.in');
    }
  } catch (err) { console.error('❌ Seeding Error:', err); }
}

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB Connected Successfully');
    await seedDatabase();
  } catch (error) {
    console.log('==============================================');
    console.log('Database Error: Could not connect to MongoDB.');
    console.log('Make sure MongoDB service is running locally.');
    console.log('Start it from: Services > MongoDB > Start');
    console.log('Or install from: mongodb.com/try/download/community');
    console.log('==============================================');
    // Do NOT exit - keep server running so frontend can still load
  }
};

module.exports = connectDB;
