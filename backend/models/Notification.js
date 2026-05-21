const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  // Who receives this notification
  recipient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // null = admin-only
  recipient_role: { type: String, enum: ['user', 'admin', 'both'], default: 'admin' },

  // What triggered it
  type: {
    type: String,
    enum: ['new_complaint', 'status_update', 'worker_assigned', 'complaint_deleted', 'login_alert'],
    required: true
  },

  // Readable message
  title: { type: String, required: true },
  message: { type: String, required: true },

  // Related complaint info
  complaint_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', default: null },
  custom_id: { type: String, default: '' },
  issue_type: { type: String, default: '' },
  location: { type: String, default: '' },

  // State
  is_read: { type: Boolean, default: false },
  email_status: { type: String, enum: ['Pending', 'Sent', 'Failed', 'None'], default: 'None' },
  email_sent_at: { type: Date, default: null },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);
