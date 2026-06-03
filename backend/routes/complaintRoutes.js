const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const complaintController = require('../controllers/complaintController');
const authenticateToken = require('../middlewares/authMiddleware');

const uploadDir = process.env.VERCEL
  ? path.join('/tmp', process.env.UPLOAD_DIR || 'uploads')
  : path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');

// Ensure the uploads folder exists
const fs = require('fs');
if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch (e) {
    console.warn("⚠️ Uploads folder creation warning:", e.message);
  }
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname || ''));
  }
});

const upload = multer({ storage: storage });

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
