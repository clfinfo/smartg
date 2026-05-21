const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['citizen', 'admin'], default: 'citizen' },

  // Validated phone: 10-digit Indian mobile number
  phone: {
    type: String,
    default: '',
    validate: {
      validator: (v) => v === '' || /^[6-9]\d{9}$/.test(v),
      message: 'Phone must be a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.'
    }
  },

  // Correctly spelled "district" field
  district: { type: String, default: 'Bengaluru Urban' },

  // User notification preferences
  preferences: {
    email_notifications: { type: Boolean, default: true },
    sms_alerts: { type: Boolean, default: false },
    push_notifications: { type: Boolean, default: true },
    anonymous_reporting: { type: Boolean, default: false }
  },

  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
