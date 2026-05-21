const Notification = require('../models/Notification');

// Helper to create & emit a notification
const createAndEmit = async (io, data) => {
  const notif = await new Notification(data).save();
  if (data.recipient_role === 'admin' || data.recipient_role === 'both') {
    // Emit specifically to the 'admin' Socket.IO room
    io.to('admin').emit('admin_notification', notif);
    // Fallback general broadcast
    io.emit('admin_notification', notif);
  }
  if ((data.recipient_role === 'user' || data.recipient_role === 'both') && data.recipient_id) {
    // Emit specifically to the private user's Socket.IO room
    io.to(`user_${data.recipient_id}`).emit(`user_notification_${data.recipient_id}`, notif);
    // Fallback general broadcast
    io.emit(`user_notification_${data.recipient_id}`, notif);
  }
  return notif;
};

exports.createAndEmit = createAndEmit;

// GET /api/notifications
// Admin gets admin notifications; users get their own
exports.getNotifications = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'admin') {
      filter = { recipient_role: { $in: ['admin', 'both'] } };
    } else {
      filter = {
        $or: [
          { recipient_id: req.user.id, recipient_role: { $in: ['user', 'both'] } },
        ]
      };
    }
    const notifications = await Notification.find(filter).sort({ created_at: -1 }).limit(50);
    const unread = await Notification.countDocuments({ ...filter, is_read: false });
    res.json({ success: true, data: notifications, unread });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const notif = await Notification.findByIdAndUpdate(
      req.params.id,
      { is_read: true },
      { new: true }
    );
    if (!notif) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: notif });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/notifications/read-all
exports.markAllAsRead = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'admin') {
      filter = { recipient_role: { $in: ['admin', 'both'] }, is_read: false };
    } else {
      filter = { recipient_id: req.user.id, is_read: false };
    }
    await Notification.updateMany(filter, { is_read: true });
    res.json({ success: true, message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/notifications/:id
exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
