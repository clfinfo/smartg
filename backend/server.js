const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { Server } = require("socket.io");
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

// Socket.IO Room Connection Handling
io.on('connection', (socket) => {
  const { userId, role } = socket.handshake.query;
  console.log(`🔌 Client connected [Socket ID: ${socket.id}] | Role: ${role || 'unknown'} | User ID: ${userId || 'guest'}`);

  if (role === 'admin') {
    socket.join('admin');
    console.log(`🛡️ Socket ${socket.id} joined 'admin' room`);
  }
  if (userId) {
    socket.join(`user_${userId}`);
    console.log(`👤 Socket ${socket.id} joined private room 'user_${userId}'`);
  }

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected [Socket ID: ${socket.id}]`);
  });
});

const PORT = process.env.PORT || 5000;

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.io = io;
  next();
});

const uploadDir = process.env.VERCEL
  ? path.join('/tmp', process.env.UPLOAD_DIR || 'uploads')
  : path.join(__dirname, process.env.UPLOAD_DIR || 'uploads');
try {
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
} catch (err) {
  console.warn("⚠️ Uploads folder creation skipped (read-only filesystem in serverless environments):", err.message);
}
app.use('/uploads', express.static(uploadDir));

// ─── MongoDB Connection ─────────────────────────────────────────────────────
const dbPromise = connectDB();

// ─── DB Connection Check Middleware ─────────────────────────────────────────
app.use('/api', async (req, res, next) => {
  const mongoose = require('mongoose');
  await dbPromise; // Ensure database connection attempt is completed before processing queries
  if (mongoose.connection.dbError) {
    return res.status(503).json({
      success: false,
      message: `Database connection error: ${mongoose.connection.dbErrorMessage || 'Could not connect to MongoDB'}. Please verify that MONGODB_URI is correctly configured in your Vercel project environment variables, and ensure your database network whitelist permits external access (0.0.0.0/0).`
    });
  }
  next();
});

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/issues', complaintRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/config', (req, res) => {
  res.json({ success: true, maps_api_key: process.env.MAPS_API_KEY });
});

app.get('/', (req, res) => {
  res.send('Backend Server Running');
});

// ─── Server Start ───────────────────────────────────────────────────────────
if (require.main === module && !process.env.VERCEL) {
  server.listen(PORT, () => console.log(`🚀 Server Running on Port ${PORT}`));
}

module.exports = app;
