const nodemailer = require('nodemailer');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');

// ─── Gmail SMTP Transporter ─────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify transporter on startup
transporter.verify((err, success) => {
  if (err) {
    console.error('❌ [Nodemailer] Gmail SMTP verification FAILED:', err.message);
  } else {
    console.log('✅ [Nodemailer] Gmail SMTP connected successfully — ready to send emails');
    console.log(`   → Sender: ${process.env.EMAIL_USER}`);
  }
});

/**
 * Send email via Gmail SMTP. Logs message ID or exact error.
 */
async function sendEmail({ to, subject, html }) {
  const from = `"EcoSmart City" <${process.env.EMAIL_USER}>`;
  try {
    const info = await transporter.sendMail({ from, to, subject, html });
    console.log(`✅ [Email Sent Successfully] To: ${to} | Subject: ${subject}`);
    console.log(`   → Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`❌ [Email Send FAILED] To: ${to} | Subject: ${subject}`);
    console.error(`   → Error: ${err.message}`);
    throw err;
  }
}

// ─── 1. LOGIN SECURITY EMAIL ────────────────────────────────────────────────
exports.sendLoginAlert = async (toEmail, userName, device = 'Web Browser') => {
  console.log(`📧 [Email Engine] Sending Login alert to: ${toEmail}...`);

  const timestamp = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'short'
  });

  const subject = 'Successful Login - Smart Reporting System';
  const html = `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:550px;margin:20px auto;background:#0b0f19;color:#e2e8f0;border-radius:16px;overflow:hidden;border:1px solid #1e293b;">
      <div style="background:linear-gradient(135deg,#0ea5e9,#0284c7);padding:30px 35px;text-align:center;">
        <span style="font-size:45px;">🔐</span>
        <h1 style="margin:10px 0 0;color:#fff;font-size:22px;">Successful Login</h1>
        <p style="margin:4px 0 0;color:#93c5fd;font-size:13px;">EcoSmart City Reporting System</p>
      </div>
      <div style="padding:30px 35px;">
        <p style="font-size:16px;margin-top:0;">Dear <strong>${userName}</strong>,</p>
        <p style="color:#94a3b8;line-height:1.7;font-size:14.5px;">Your account has been successfully accessed.</p>
        <div style="background:#131b2e;border:1px solid #1e293b;border-radius:12px;padding:20px;margin:25px 0;">
          <p style="margin:0 0 12px;color:#38bdf8;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;">Connection Details</p>
          <p style="margin:0;font-size:14px;color:#e2e8f0;"><strong>Email:</strong> ${toEmail}</p>
          <p style="margin:8px 0 0;font-size:14px;color:#e2e8f0;"><strong>Date & Time:</strong> ${timestamp}</p>
          <p style="margin:8px 0 0;font-size:14px;color:#e2e8f0;"><strong>Device:</strong> ${device}</p>
        </div>
      </div>
      <div style="padding:20px;border-top:1px solid #1e293b;text-align:center;color:#475569;font-size:11px;background:#070a13;">EcoSmart City — Karnataka Smart Reporting System</div>
    </div>`;

  // Save notification
  let recipientId = null;
  try { const user = await User.findOne({ email: toEmail }); if (user) recipientId = user._id; } catch (e) {}

  const notification = new Notification({
    recipient_id: recipientId, recipient_role: 'user', type: 'login_alert',
    title: subject, message: `Login from ${device} on ${timestamp}.`, email_status: 'Pending'
  });
  await notification.save();

  try {
    await sendEmail({ to: toEmail, subject, html });
    notification.email_status = 'Sent';
    notification.email_sent_at = new Date();
    await notification.save();
  } catch (err) {
    notification.email_status = 'Failed';
    await notification.save();
  }
};

// ─── 2. COMPLAINT SUBMITTED EMAIL ───────────────────────────────────────────
exports.sendComplaintSubmittedEmail = async (toEmail, userName, complaintId, issueType, locationStr) => {
  console.log(`📧 [Email Engine] Sending Complaint confirmation to: ${toEmail}...`);

  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
  const subject = `Complaint Submitted - ID: ${complaintId}`;
  const html = `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:550px;margin:20px auto;background:#0b0f19;color:#e2e8f0;border-radius:16px;overflow:hidden;border:1px solid #1e293b;">
      <div style="background:linear-gradient(135deg,#10b981,#059669);padding:30px 35px;text-align:center;">
        <span style="font-size:45px;">📝</span>
        <h1 style="margin:10px 0 0;color:#fff;font-size:22px;">Complaint Submitted</h1>
        <p style="margin:4px 0 0;color:#a7f3d0;font-size:13px;">EcoSmart City Reporting System</p>
      </div>
      <div style="padding:30px 35px;">
        <p style="font-size:16px;margin-top:0;">Dear <strong>${userName}</strong>,</p>
        <p style="color:#94a3b8;line-height:1.7;font-size:14.5px;">Your civic complaint has been registered successfully.</p>
        <div style="background:#131b2e;border:1px solid #1e293b;border-radius:12px;padding:20px;margin:25px 0;">
          <p style="margin:0 0 12px;color:#34d399;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;">Complaint Details</p>
          <p style="margin:0;font-size:14px;color:#e2e8f0;"><strong>ID:</strong> <span style="font-family:monospace;color:#60a5fa;">${complaintId}</span></p>
          <p style="margin:8px 0 0;font-size:14px;color:#e2e8f0;"><strong>Category:</strong> ${issueType}</p>
          <p style="margin:8px 0 0;font-size:14px;color:#e2e8f0;"><strong>Location:</strong> ${locationStr}</p>
          <p style="margin:8px 0 0;font-size:14px;color:#e2e8f0;"><strong>Status:</strong> <span style="color:#f59e0b;font-weight:600;">Pending</span></p>
        </div>
        <p style="font-size:13px;color:#64748b;">Submitted on: ${timestamp}</p>
      </div>
      <div style="padding:20px;border-top:1px solid #1e293b;text-align:center;color:#475569;font-size:11px;background:#070a13;">EcoSmart City — Karnataka Smart Reporting System</div>
    </div>`;

  let recipientId = null, complaintMongoId = null;
  try {
    const user = await User.findOne({ email: toEmail }); if (user) recipientId = user._id;
    const complaint = await Complaint.findOne({ custom_id: complaintId }); if (complaint) complaintMongoId = complaint._id;
  } catch (e) {}

  const notification = new Notification({
    recipient_id: recipientId, recipient_role: 'user', type: 'new_complaint',
    title: subject, message: `Complaint ${complaintId} filed under '${issueType}'.`,
    complaint_id: complaintMongoId, custom_id: complaintId, issue_type: issueType, location: locationStr, email_status: 'Pending'
  });
  await notification.save();

  try {
    await sendEmail({ to: toEmail, subject, html });
    notification.email_status = 'Sent';
    notification.email_sent_at = new Date();
    await notification.save();
  } catch (err) {
    notification.email_status = 'Failed';
    await notification.save();
  }
};

// ─── 3. STATUS UPDATE EMAIL ────────────────────────────────────────────────
exports.sendStatusUpdateEmail = async (toEmail, userName, complaintId, newStatus, remarks = '') => {
  console.log(`📧 [Email Engine] Sending Status update to: ${toEmail}...`);

  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
  const subject = `Status Update - Complaint ID: ${complaintId}`;
  const statusColor = newStatus === 'Resolved' ? '#10b981' : newStatus === 'In Progress' ? '#3b82f6' : '#f59e0b';
  const html = `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:550px;margin:20px auto;background:#0b0f19;color:#e2e8f0;border-radius:16px;overflow:hidden;border:1px solid #1e293b;">
      <div style="background:linear-gradient(135deg,${statusColor},#0f172a);padding:30px 35px;text-align:center;">
        <span style="font-size:45px;">📋</span>
        <h1 style="margin:10px 0 0;color:#fff;font-size:22px;">Status Updated</h1>
        <p style="margin:4px 0 0;color:#94a3b8;font-size:13px;">EcoSmart City Reporting System</p>
      </div>
      <div style="padding:30px 35px;">
        <p style="font-size:16px;margin-top:0;">Dear <strong>${userName}</strong>,</p>
        <div style="background:#131b2e;border:1px solid #1e293b;border-radius:12px;padding:20px;margin:25px 0;">
          <p style="margin:0;font-size:14px;color:#e2e8f0;"><strong>Complaint ID:</strong> <span style="font-family:monospace;color:#60a5fa;">${complaintId}</span></p>
          <p style="margin:10px 0 0;font-size:14px;color:#e2e8f0;"><strong>New Status:</strong> <span style="color:${statusColor};font-weight:700;">${newStatus}</span></p>
          ${remarks ? `<p style="margin:10px 0 0;font-size:14px;color:#e2e8f0;"><strong>Remarks:</strong> ${remarks}</p>` : ''}
        </div>
        <p style="font-size:13px;color:#64748b;">Updated on: ${timestamp}</p>
      </div>
      <div style="padding:20px;border-top:1px solid #1e293b;text-align:center;color:#475569;font-size:11px;background:#070a13;">EcoSmart City — Karnataka Smart Reporting System</div>
    </div>`;

  let recipientId = null, complaintMongoId = null;
  try {
    const user = await User.findOne({ email: toEmail }); if (user) recipientId = user._id;
    const complaint = await Complaint.findOne({ custom_id: complaintId }); if (complaint) complaintMongoId = complaint._id;
  } catch (e) {}

  const notification = new Notification({
    recipient_id: recipientId, recipient_role: 'user', type: 'status_update',
    title: subject, message: `Complaint ${complaintId} status: "${newStatus}".`,
    complaint_id: complaintMongoId, custom_id: complaintId, email_status: 'Pending'
  });
  await notification.save();

  try {
    await sendEmail({ to: toEmail, subject, html });
    notification.email_status = 'Sent';
    notification.email_sent_at = new Date();
    await notification.save();
  } catch (err) {
    notification.email_status = 'Failed';
    await notification.save();
  }
};

// ─── 4. SMS Alert (log-only) ────────────────────────────────────────────────
exports.sendSMSAlert = async (phone, newStatus) => {
  if (!phone || !/^[6-9]\d{9}$/.test(phone)) return;
  console.log(`📱 SMS [to +91${phone}]: Status updated to ${newStatus}`);
};
