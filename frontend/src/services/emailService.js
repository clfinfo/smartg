/**
 * EmailJS Service — EcoSmart City Smart Reporting System
 *
 * Service ID:   service_eph2ioa
 * Template ID:  template_b1678xg
 * Public Key:   8uoyVl_vrUXAem4M9
 *
 * Template variables used:
 *   {{to_email}}   — recipient email (dynamic per user)
 *   {{name}}       — user's name
 *   {{email}}      — user's email (reply-to)
 *   {{issue_type}} — type of complaint
 *   {{location}}   — complaint location
 *   {{message}}    — complaint description
 */

import emailjs from '@emailjs/browser'

const SERVICE_ID  = 'service_eph2ioa'
const TEMPLATE_ID = 'template_b1678xg'
const PUBLIC_KEY  = '8uoyVl_vrUXAem4M9'

// ─── Core send function ───────────────────────────────────────────────────────
const sendEmail = async (params) => {
  if (!params.to_email) {
    console.warn('📧 EmailJS skipped — no to_email provided')
    return { success: false }
  }
  try {
    const result = await emailjs.send(SERVICE_ID, TEMPLATE_ID, params, PUBLIC_KEY)
    console.log(`📧 Email sent to ${params.to_email} — status: ${result.status}`)
    return { success: true }
  } catch (error) {
    console.log(error)
    return { success: false, error }
  }
}

// ─── 1. Complaint Submitted Email ─────────────────────────────────────────────
export const sendComplaintSubmittedEmail = async ({
  userName, userEmail, issueType, location, description, complaintId, dateTime
}) => {
  return sendEmail({
    to_email:   userEmail,
    name:       userName    || 'Citizen',
    email:      userEmail,
    issue_type: issueType   || 'General Issue',
    location:   location    || 'Not specified',
    message:    description || `Complaint ID: ${complaintId}`,
    date_time:  dateTime    || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
  })
}

// ─── 2. Status Update Email ───────────────────────────────────────────────────
export const sendStatusUpdateEmail = async ({
  userName, userEmail, complaintId, newStatus, issueType, worker, dateTime
}) => {
  const statusMessages = {
    'Pending':     'Your complaint is pending review by our team.',
    'In Progress': 'Great news! Our team is actively working on your complaint.',
    'Completed':   'Your complaint has been successfully resolved. Thank you!',
    'Resolved':    'Your complaint has been successfully resolved. Thank you for contributing to a cleaner Karnataka!',
  }
  return sendEmail({
    to_email:   userEmail,
    name:       userName    || 'Citizen',
    email:      userEmail,
    issue_type: issueType   || '—',
    location:   complaintId || '—',
    message:    `${statusMessages[newStatus] || `Status updated to: ${newStatus}.`}${worker && worker !== 'Unassigned' ? ` Assigned worker: ${worker}.` : ''}`,
    date_time:  dateTime    || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
  })
}

// ─── 3. Login Alert Email ─────────────────────────────────────────────────────
export const sendLoginAlertEmail = async (user) => {
  if (!user?.email) return { success: false }
  return sendEmail({
    to_email:   user.email,
    name:       user.name  || 'Citizen',
    email:      user.email,
    issue_type: 'Login Alert',
    location:   'EcoSmart City Portal',
    message:    'You have successfully logged into your EcoSmart City account. If this was not you, please secure your account immediately.',
    date_time:  new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
  })
}
