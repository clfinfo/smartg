require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecosmart_city';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB:', MONGO_URI);

  // Remove existing demo accounts so we can recreate them cleanly
  await User.deleteMany({ email: { $in: ['admin@karnataka.gov.in', 'citizen@karnataka.gov.in'] } });

  const [adminPwd, citizenPwd] = await Promise.all([
    bcrypt.hash('admin1234', 10),
    bcrypt.hash('demo1234', 10),
  ]);

  await User.create([
    { name: 'Admin Kumar',  email: 'admin@karnataka.gov.in',   password: adminPwd,   role: 'admin'   },
    { name: 'Rahul Sharma', email: 'citizen@karnataka.gov.in', password: citizenPwd, role: 'citizen' },
  ]);

  console.log('');
  console.log('✅ Demo accounts created:');
  console.log('   Admin   → admin@karnataka.gov.in   / admin1234');
  console.log('   Citizen → citizen@karnataka.gov.in / demo1234');
  await mongoose.disconnect();
}

seed().catch(err => { console.error('Seed failed:', err.message); process.exit(1); });
