const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  custom_id: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  description: String,
  severity: { type: String, default: 'Medium' },
  district: { type: String, default: 'Bengaluru Urban' },
  location_str: String,
  location_lat: Number,
  location_lng: Number,
  image_path: String,
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  worker: { type: String, default: 'Unassigned' },
  
  // AI Image Recognition Fields
  ai_detected_category: { type: String },
  ai_confidence: { type: Number },
  ai_timestamp: { type: Date, default: Date.now },

  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Complaint', ComplaintSchema);
