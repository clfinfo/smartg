const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const complaintController = require('../controllers/complaintController');
const authenticateToken = require('../middlewares/authMiddleware');

const uploadDir = process.env.VERCEL
  ? path.join('/tmp', process.env.UPLOAD_DIR || 'uploads')
  : path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');

// Ensure the writable tmp directory exists if on Vercel
if (process.env.VERCEL) {
  const fs = require('fs');
  try {
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  } catch (e) {
    console.warn("⚠️ Tmp uploads folder creation warning:", e.message);
  }
}

const upload = multer({ dest: uploadDir });

// Complaint API endpoints
router.post('/detect', authenticateToken, upload.single('image'), complaintController.detectImage);
router.post('/', authenticateToken, upload.single('image'), complaintController.createComplaint);
router.get('/', authenticateToken, complaintController.getComplaints);
router.put('/:id', authenticateToken, complaintController.updateComplaint);
router.delete('/:id', authenticateToken, complaintController.deleteComplaint);

// Required API endpoints for issues
router.post('/report', authenticateToken, upload.single('image'), complaintController.createComplaint);
router.get('/:id', authenticateToken, complaintController.getComplaintById);
router.put('/status', authenticateToken, complaintController.updateComplaintStatus);

module.exports = router;
