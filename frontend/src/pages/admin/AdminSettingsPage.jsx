import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiSave, FiShield, FiDatabase, FiBell, FiGlobe } from 'react-icons/fi'

const AdminSettingsPage = () => {
  const [saved, setSaved] = useState(false)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="section-title">⚙️ Admin Settings</h2>
        <p className="section-subtitle">Configure system-wide settings for EcoSmart City</p>
      </div>

      {[
        {
          icon: FiShield, title: 'Security Settings', items: [
            { label: 'Two-Factor Authentication', desc: 'Require 2FA for all admin accounts', type: 'toggle', default: true },
            { label: 'Session Timeout (minutes)', desc: 'Auto-logout after inactivity', type: 'number', default: 30 },
            { label: 'IP Whitelist', desc: 'Restrict access to specific IPs', type: 'text', default: '' },
          ]
        },
        {
          icon: FiBell, title: 'Alert Configuration', items: [
            { label: 'Critical Alert Threshold', desc: 'Notify when complaints exceed', type: 'number', default: 50 },
            { label: 'Email Alerts', desc: 'Send emails for critical issues', type: 'toggle', default: true },
            { label: 'SMS Alerts', desc: 'Send SMS to district officers', type: 'toggle', default: false },
          ]
        },
        {
          icon: FiGlobe, title: 'AI & Automation', items: [
            { label: 'AI Auto-Classification', desc: 'Automatically classify complaints using AI', type: 'toggle', default: true },
            { label: 'AI Confidence Threshold (%)', desc: 'Minimum confidence to auto-assign category', type: 'number', default: 80 },
            { label: 'Auto-Assign Workers', desc: 'Automatically assign nearby workers', type: 'toggle', default: false },
          ]
        },
      ].map((section, i) => (
        <motion.div key={section.title} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass p-6 rounded-2xl">
          <h3 className="text-white font-bold mb-5 flex items-center gap-2">
            <section.icon className="text-primary-400" size={18} /> {section.title}
          </h3>
          <div className="space-y-5">
            {section.items.map(item => (
              <div key={item.label} className="flex items-center justify-between gap-6">
                <div>
                  <p className="text-white text-sm font-medium">{item.label}</p>
                  <p className="text-gray-500 text-xs">{item.desc}</p>
                </div>
                {item.type === 'toggle' ? (
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input type="checkbox" defaultChecked={item.default} className="sr-only peer" />
                    <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:bg-primary-600 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
                  </label>
                ) : item.type === 'number' ? (
                  <input type="number" defaultValue={item.default} className="w-24 input-field py-2 text-sm text-right" />
                ) : (
                  <input type="text" defaultValue={item.default} placeholder="Enter value..." className="w-48 input-field py-2 text-sm" />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500) }}
        className="btn-primary w-full flex items-center justify-center gap-2 py-4">
        <FiSave /> {saved ? '✅ Settings Saved!' : 'Save All Settings'}
      </motion.button>
    </div>
  )
}

export default AdminSettingsPage
