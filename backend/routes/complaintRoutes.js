const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const complaintController = require('../controllers/complaintController');
const authenticateToken = require('../middlewares/authMiddleware');

const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
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
