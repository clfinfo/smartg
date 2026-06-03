const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { createAndEmit } = require('./notificationController');
const { sendStatusUpdateEmail, sendSMSAlert, sendComplaintSubmittedEmail } = require('../services/emailService');
const { detectImage } = require('../../AI/OpenCV/opencv_detector');
const { uploadImage } = require('../services/cloudinaryService');

// API controller to analyze and recognize uploaded images in real-time
exports.detectImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }

    console.log(`📸 [API Detect] Incoming image for AI analysis: ${req.file.filename} (${req.file.originalname})`);
    
    // Execute the real OpenCV image classifier
    const detection = await detectImage(req.file.path, req.file.originalname);
    
    if (!detection || !detection.success) {
      return res.status(500).json({ success: false, message: 'OpenCV detection failed internally' });
    }

    let previewUrl = `/uploads/${req.file.filename}`;
    try {
      const cloudUrl = await uploadImage(req.file.path);
      if (cloudUrl) previewUrl = cloudUrl;
    } catch (_) { /* fallback to local path */ }

    res.json({
      success: true,
      detected_category: detection.detected_category,
      confidence: detection.confidence,
      timestamp: detection.timestamp || new Date(),
      metrics: detection.metrics,
      image_url: previewUrl
    });
  } catch (err) {
    console.error("AI Detection Controller Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/complaints
exports.createComplaint = async (req, res) => {
  try {
    const { type, description, severity, district, location_str, location_lat, location_lng } = req.body;
    
    if (!location_lat || !location_lng || isNaN(location_lat) || isNaN(location_lng)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing GPS coordinates' });
    }

    const custom_id = 'CMP-' + Date.now();

    let finalType = type || 'Garbage Overflow';
    let aiDetected = null;
    let aiConfidence = null;

    // Run AI Detection automatically if an image is attached during submit
    if (req.file) {
      try {
        console.log(`🤖 [Submit flow] Running OpenCV detection on submitted image: ${req.file.filename}`);
        const result = await detectImage(req.file.path, req.file.originalname);
        if (result && result.success) {
          aiDetected = result.detected_category;
          aiConfidence = result.confidence;
          
          // If no type was specified by the user, default to the AI detection result
          if (!type && aiDetected && aiDetected !== "Unable to identify problem correctly") {
            finalType = aiDetected;
          }
        }
      } catch (cvErr) {
        console.warn("OpenCV submit auto-detect failed, using fallback type:", cvErr.message);
      }
    }

    // Upload image to Cloudinary for persistent storage (Vercel ephemeral filesystem fix)
    let imagePath = null;
    if (req.file) {
      try {
        const cloudUrl = await uploadImage(req.file.path);
        imagePath = cloudUrl || `/uploads/${req.file.filename}`;
      } catch (uploadErr) {
        console.warn('Cloudinary upload failed, using local path:', uploadErr.message);
        imagePath = `/uploads/${req.file.filename}`;
      }
    }

    const complaint = new Complaint({
      custom_id,
      user: req.user.id,
      type: finalType,
      description,
      severity,
      district,
      location_str,
      location_lat,
      location_lng,
      image_path: imagePath,

      // Persist AI metrics in MongoDB
      ai_detected_category: aiDetected,
      ai_confidence: aiConfidence,
      ai_timestamp: new Date()
    });
    
    await complaint.save();

    const user = await User.findById(req.user.id);
    const userName = user ? user.name : 'A Citizen';
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN');
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    // 1. Admin notification — new complaint reported
    await createAndEmit(req.io, {
      recipient_role: 'admin',
      type: 'new_complaint',
      title: 'New Complaint Submitted',
      message: `${userName} reported a ${finalType} issue at ${location_str || district || 'Unknown location'} on ${dateStr} at ${timeStr}.`,
      complaint_id: complaint._id,
      custom_id,
      issue_type: finalType,
      location: location_str || district || 'Unknown'
    });

    // 2. User confirmation notification
    await createAndEmit(req.io, {
      recipient_id: req.user.id,
      recipient_role: 'user',
      type: 'new_complaint',
      title: 'Report Submitted Successfully',
      message: `Your ${finalType} report (${custom_id}) has been submitted successfully on ${dateStr} at ${timeStr}. We will review it shortly.`,
      complaint_id: complaint._id,
      custom_id,
      issue_type: finalType,
      location: location_str || district || ''
    });

    // Send Email to the user directly via NodeMailer
    if (user && user.email) {
      sendComplaintSubmittedEmail(
        user.email,
        userName,
        custom_id,
        finalType,
        location_str || district || 'Unknown location'
      );
    }

    // Emit complaint to all (for live map etc.)
    req.io.emit('new_complaint', complaint);

    res.status(201).json({ success: true, message: 'Complaint filed successfully', data: complaint });
  } catch (err) {
    console.error("❌ createComplaint Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/complaints
exports.getComplaints = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { user: req.user.id };
    const complaints = await Complaint.find(filter).populate('user', 'name email').sort({ created_at: -1 });
    res.json({ success: true, data: complaints });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/issues/:id
exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate('user', 'name email');
    if (!complaint) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/complaints/:id
exports.updateComplaint = async (req, res) => {
  try {
    const { status, worker } = req.body;
    const complaint = await Complaint.findById(req.params.id).populate('user');
    if (!complaint) return res.status(404).json({ success: false, message: 'Not found' });

    const prevStatus = complaint.status;
    complaint.status = status || complaint.status;
    complaint.worker = worker || complaint.worker;
    complaint.updated_at = Date.now();
    await complaint.save();

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN');
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    // Notify only the complaint owner about status change
    if (complaint.user && prevStatus !== complaint.status) {
      await createAndEmit(req.io, {
        recipient_id: complaint.user._id,
        recipient_role: 'user',
        type: 'status_update',
        title: 'Complaint Status Updated',
        message: `Your complaint ${complaint.custom_id} status has been updated to "${complaint.status}" on ${dateStr} at ${timeStr}.${complaint.worker && complaint.worker !== 'Unassigned' ? ` Assigned worker: ${complaint.worker}.` : ''}`,
        complaint_id: complaint._id,
        custom_id: complaint.custom_id,
        issue_type: complaint.type,
        location: complaint.location_str || ''
      });
    }

    // Notify user about worker assignment separately if worker changed
    if (complaint.user && worker && worker !== 'Unassigned' && worker !== complaint.worker) {
      await createAndEmit(req.io, {
        recipient_id: complaint.user._id,
        recipient_role: 'user',
        type: 'worker_assigned',
        title: 'Worker Assigned to Your Complaint',
        message: `A worker (${worker}) has been assigned to your complaint ${complaint.custom_id}.`,
        complaint_id: complaint._id,
        custom_id: complaint.custom_id,
        issue_type: complaint.type,
        location: complaint.location_str || ''
      });
    }

    // Emit status update for real-time UI
    req.io.emit('status_update', complaint);

    // Check preferences and send email/SMS
    if (complaint.user?.email) {
      const complaintUser = await User.findById(complaint.user._id);
      const prefs = complaintUser?.preferences || {};
      if (prefs.email_notifications !== false) {
        sendStatusUpdateEmail(
          complaint.user.email,
          complaint.user.name,
          complaint.custom_id,
          complaint.status,
          worker && worker !== 'Unassigned' ? `Assigned worker: ${worker}` : ''
        );
      }
      if (prefs.sms_alerts && complaintUser?.phone) {
        sendSMSAlert(complaintUser.phone, complaint.status);
      }
    }

    res.json({ success: true, message: 'Updated successfully', data: complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/issues/status
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.body;
    req.params.id = id;
    return exports.updateComplaint(req, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/complaints/:id
exports.deleteComplaint = async (req, res) => {
  try {
    await Complaint.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
