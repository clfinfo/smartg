const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendLoginAlert, sendWelcomeEmail } = require('../services/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'node-super-secret-jwt-token-smart-reporting-2026';

// Phone regex: 10 digits, starts with 6-9
const PHONE_REGEX = /^[6-9]\d{9}$/;

// ─── Register ────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, district } = req.body;
    console.log('\n📝 Register Request Received:', { name, email, role: role || 'citizen' });

    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });

    // Phone validation
    if (phone && !PHONE_REGEX.test(phone))
      return res.status(400).json({ success: false, message: 'Phone must be a valid 10-digit Indian number starting with 6, 7, 8, or 9.' });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ success: false, message: 'Email already registered.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name, email,
      password: hashedPassword,
      role: role || 'citizen',
      phone: phone || '',
      district: district || 'Bengaluru Urban'
    });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    console.log('✅ User Registered Successfully:', email);
    console.log('─'.repeat(50));

    res.status(201).json({
      success: true,
      message: 'User Registered Successfully',
      token,
      user: {
        id: user._id, name: user.name, email: user.email,
        role: user.role, phone: user.phone, district: user.district,
        preferences: user.preferences
      }
    });
  } catch (err) {
    console.error('🔥 Registration Error:', err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ─── Login ───────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('\n📥 Login Request Received:', { email });

    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required.' });

    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password)) {
      console.log('❌ Invalid Credentials for:', email);
      return res.status(401).json({ success: false, message: 'Invalid Credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    console.log('✅ Login Successful for:', email, '| Role:', user.role);
    console.log('─'.repeat(50));

    // Send real-time login security alert email (async — don't block response)
    sendLoginAlert(user.email, user.name, req.headers['user-agent'] || 'Web Browser');

    res.status(200).json({
      success: true,
      message: 'Login Successful',
      token,
      user: {
        id: user._id, name: user.name, email: user.email,
        role: user.role, phone: user.phone || '', district: user.district || '',
        preferences: user.preferences
      }
    });
  } catch (err) {
    console.error('🔥 Login Error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Update Profile ──────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, district, preferences } = req.body;

    // Validate phone if provided
    if (phone && !PHONE_REGEX.test(phone))
      return res.status(400).json({ success: false, message: 'Phone must be a valid 10-digit Indian number starting with 6, 7, 8, or 9.' });

    const updates = {};
    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (district) updates.district = district;
    if (preferences) updates.preferences = preferences;

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id, name: user.name, email: user.email,
        role: user.role, phone: user.phone, district: user.district,
        preferences: user.preferences
      }
    });
  } catch (err) {
    // Mongoose validation error
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors).map(e => e.message).join(', ');
      return res.status(400).json({ success: false, message: msg });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};
