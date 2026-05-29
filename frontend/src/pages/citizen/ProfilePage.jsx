import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiEdit3, FiMapPin, FiMail, FiPhone, FiSave, FiX, FiCheck, FiAlertCircle } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { useComplaints } from '../../context/ComplaintsContext'
import { DISTRICTS } from '../../data/mockData'
import { getBackendUrl } from '../../config/backend'

const BACKEND = getBackendUrl()
const PHONE_REGEX = /^[6-9]\d{9}$/

const PREFS_CONFIG = [
  { key: 'email_notifications', label: 'Email Notifications', desc: 'Receive complaint status updates via email', default: true },
  { key: 'sms_alerts',          label: 'SMS Alerts',          desc: 'Get SMS when your complaint status changes', default: false },
  { key: 'anonymous_reporting', label: 'Anonymous Reporting', desc: 'Hide your name from public complaint list', default: false },
  { key: 'push_notifications',  label: 'Push Notifications',  desc: 'Browser notifications for real-time updates', default: true },
]

const Toggle = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
    <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
    <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:bg-primary-600 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
  </label>
)

const ProfilePage = () => {
  const { user, updateUser } = useAuth()
  const { complaints, totalCount, resolvedCount } = useComplaints()

  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    district: user?.district || 'Bengaluru Urban',
  })

  const [prefs, setPrefs] = useState({
    email_notifications: user?.preferences?.email_notifications ?? true,
    sms_alerts: user?.preferences?.sms_alerts ?? false,
    anonymous_reporting: user?.preferences?.anonymous_reporting ?? false,
    push_notifications: user?.preferences?.push_notifications ?? true,
  })

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const togglePref = async (key) => {
    const newPrefs = { ...prefs, [key]: !prefs[key] }
    setPrefs(newPrefs)
    // Save preference immediately
    try {
      await fetch(`${BACKEND}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ preferences: newPrefs })
      })
      updateUser({ preferences: newPrefs })
    } catch { }
  }

  const validatePhone = (phone) => {
    if (!phone) return true // optional
    return PHONE_REGEX.test(phone)
  }

  const saveProfile = async () => {
    setError('')
    setSuccess('')

    // Frontend phone validation
    if (form.phone && !validatePhone(form.phone)) {
      setError('Phone must be exactly 10 digits and start with 6, 7, 8, or 9. Example: 9876543210')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`${BACKEND}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ name: form.name, phone: form.phone, district: form.district })
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.message || 'Update failed')
        return
      }
      updateUser({ name: form.name, phone: form.phone, district: form.district })
      setSuccess('Profile updated successfully!')
      setEditing(false)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to save. Make sure backend is running.')
    } finally {
      setSaving(false)
    }
  }

  const cancelEdit = () => {
    setForm({ name: user?.name || '', phone: user?.phone || '', district: user?.district || 'Bengaluru Urban' })
    setError('')
    setEditing(false)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="section-title">👤 My Profile</h2>
        <p className="section-subtitle">Manage your account settings and notification preferences</p>
      </div>

      {/* Success / Error banners */}
      {success && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
          <FiCheck size={16} /> {success}
        </motion.div>
      )}
      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          <FiAlertCircle size={16} /> {error}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — Avatar + Stats */}
        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass p-6 rounded-2xl text-center">
            <div className="relative inline-block mb-4">
              <img src={user?.avatar} alt="Avatar"
                className="w-24 h-24 rounded-2xl mx-auto border-2 border-primary-500/30 bg-primary-900" />
            </div>
            <h3 className="text-white font-bold text-xl">{user?.name}</h3>
            <p className="text-primary-400 text-sm mt-1 capitalize">{user?.role || 'Citizen'}</p>
            <p className="text-gray-500 text-xs mt-1 flex items-center justify-center gap-1">
              <FiMapPin size={11} /> {user?.district || form.district}
            </p>
            <div className="flex gap-1 flex-wrap justify-center mt-3">
              <span className="bg-primary-900/50 border border-primary-500/30 text-primary-400 text-xs px-2 py-0.5 rounded-full">Verified ✓</span>
              <span className="bg-blue-900/50 border border-blue-500/30 text-blue-400 text-xs px-2 py-0.5 rounded-full capitalize">{user?.role || 'Citizen'}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-5 text-center">
              {[
                { v: totalCount, l: 'Reports' },
                { v: resolvedCount, l: 'Resolved' },
              ].map(s => (
                <div key={s.l} className="bg-white/5 rounded-xl p-3">
                  <p className="text-primary-400 font-black text-lg">{s.v}</p>
                  <p className="text-gray-600 text-xs">{s.l}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right — Account + Preferences */}
        <div className="lg:col-span-2 space-y-4">

          {/* Account Settings */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold">Account Settings</h3>
              <div className="flex gap-2">
                {editing && (
                  <button onClick={cancelEdit} className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl btn-secondary">
                    <FiX size={14} /> Cancel
                  </button>
                )}
                <button onClick={() => editing ? saveProfile() : setEditing(true)} disabled={saving}
                  className={`flex items-center gap-2 text-sm px-4 py-2 rounded-xl transition-all disabled:opacity-60 ${editing ? 'btn-primary' : 'btn-secondary'}`}>
                  {saving
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                    : editing ? <><FiSave size={14} /> Save</> : <><FiEdit3 size={14} /> Edit</>
                  }
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="text-gray-400 text-xs mb-1.5 block">Full Name</label>
                {editing
                  ? <input value={form.name} onChange={e => update('name', e.target.value)} className="input-field" placeholder="Your full name" />
                  : <p className="text-white py-3 px-4 bg-white/3 rounded-xl border border-white/5">{user?.name || '—'}</p>
                }
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="text-gray-400 text-xs mb-1.5 block flex items-center gap-1"><FiMail size={11} /> Email Address</label>
                <p className="text-white py-3 px-4 bg-white/3 rounded-xl border border-white/5 text-gray-400">{user?.email}</p>
              </div>

              {/* Phone Number */}
              <div>
                <label className="text-gray-400 text-xs mb-1.5 block flex items-center gap-1"><FiPhone size={11} /> Phone Number</label>
                {editing ? (
                  <div>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => {
                        const v = e.target.value.replace(/\D/g, '').slice(0, 10)
                        update('phone', v)
                      }}
                      className={`input-field ${form.phone && !validatePhone(form.phone) ? 'border-red-500/50' : ''}`}
                      placeholder="10-digit mobile number (e.g. 9876543210)"
                      maxLength={10}
                    />
                    {form.phone && !validatePhone(form.phone) && (
                      <p className="text-red-400 text-xs mt-1">
                        ⚠️ Must be 10 digits starting with 6, 7, 8, or 9
                      </p>
                    )}
                    {form.phone && validatePhone(form.phone) && (
                      <p className="text-green-400 text-xs mt-1">✓ Valid phone number</p>
                    )}
                  </div>
                ) : (
                  <p className="text-white py-3 px-4 bg-white/3 rounded-xl border border-white/5">
                    {user?.phone ? `+91 ${user.phone}` : '—'}
                  </p>
                )}
              </div>

              {/* District */}
              <div>
                <label className="text-gray-400 text-xs mb-1.5 block flex items-center gap-1"><FiMapPin size={11} /> District</label>
                {editing ? (
                  <select value={form.district} onChange={e => update('district', e.target.value)} className="input-field appearance-none">
                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                ) : (
                  <p className="text-white py-3 px-4 bg-white/3 rounded-xl border border-white/5">{user?.district || form.district}</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass p-6 rounded-2xl">
            <h3 className="text-white font-bold mb-4">📊 Recent Activity</h3>
            {complaints.length === 0 ? (
              <p className="text-gray-600 text-sm text-center py-4">No complaints submitted yet.</p>
            ) : (
              <div className="space-y-3">
                {complaints.slice(0, 4).map((c) => (
                  <div key={c._id || c.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/3 border border-white/5">
                    {c.photo
                      ? <img src={c.photo} alt={c.type} className="w-12 h-10 rounded-lg object-cover flex-shrink-0" />
                      : <div className="w-12 h-10 rounded-lg bg-white/5 flex items-center justify-center text-gray-600 text-xs flex-shrink-0">📷</div>
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{c.type}</p>
                      <p className="text-gray-500 text-xs">{c.date} · {c.location || c.district || '—'}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-lg font-semibold ${c.status === 'resolved' ? 'bg-green-500/20 text-green-400' : c.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {c.status === 'in-progress' ? 'In Progress' : c.status === 'resolved' ? 'Resolved' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Notification Preferences */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="glass p-6 rounded-2xl">
            <h3 className="text-white font-bold mb-1">⚙️ Notification Preferences</h3>
            <p className="text-gray-500 text-xs mb-5">Changes are saved automatically when you toggle.</p>
            <div className="space-y-4">
              {PREFS_CONFIG.map(p => (
                <div key={p.key} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-white text-sm font-medium">{p.label}</p>
                    <p className="text-gray-500 text-xs">{p.desc}</p>
                  </div>
                  <Toggle
                    checked={prefs[p.key] ?? p.default}
                    onChange={() => togglePref(p.key)}
                  />
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}

export default ProfilePage
