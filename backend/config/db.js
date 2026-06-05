const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

mongoose.set('bufferCommands', false);

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
  } catch (err) { console.error('❌ \Seeding Error:', err); }
}

let connectionPromise = null;

const connectDB = () => {
  if (connectionPromise) return connectionPromise;

  connectionPromise = (async () => {
    try {
      await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      mongoose.connection.dbError = false;
      console.log('MongoDB Connected Successfully');
      await seedDatabase();
    } catch (error) {
      mongoose.connection.dbError = true;
      mongoose.connection.dbErrorMessage = error.message;
      console.log('==============================================');
      console.log('Database Error: Could not connect to MongoDB.', error.message);
      console.log('Make sure MongoDB service is running locally.');
      console.log('Start it from: Services > MongoDB > Start');
      console.log('Or install from: mongodb.com/try/download/community');
      console.log('==============================================');
    }
  })();

  return connectionPromise;
};

module.exports = connectDB;
