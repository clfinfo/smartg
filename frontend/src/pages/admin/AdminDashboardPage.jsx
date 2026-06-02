import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { FiArrowRight, FiUsers, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useComplaints } from '../../context/ComplaintsContext'

const CATEGORY_COLORS = {
  Garbage: '#22c55e', Garbage_Overflow: '#22c55e', 'Garbage Overflow': '#22c55e',
  Pothole: '#ef4444', Potholes: '#ef4444',
  Drainage: '#3b82f6', 'Drainage Issue': '#3b82f6',
  Streetlight: '#eab308', 'Streetlight Problem': '#eab308',
  Water: '#06b6d4',
  Illegal: '#f97316', 'Illegal Dumping': '#f97316',
  Vandalism: '#d946ef',
  Other: '#a855f7',
}

const getCategoryColor = (type = '') => {
  const t = (type || '').toLowerCase();
  for (const [key, color] of Object.entries(CATEGORY_COLORS)) {
    if (t.includes(key.toLowerCase().replace('_', ' '))) return color;
  }
  return '#a855f7';
}

// ── Empty state ────────────────────────────────────────────────────────────
const EmptyState = ({ icon, title, sub }) => (
  <div className="flex flex-col items-center justify-center py-10 text-center">
    <div className="text-5xl mb-3 opacity-30">{icon}</div>
    <p className="text-gray-400 font-medium">{title}</p>
    {sub && <p className="text-gray-600 text-xs mt-1">{sub}</p>}
  </div>
)

// ═══════════════════════════════════════════════════════════════════════════
const AdminDashboardPage = () => {
  const navigate = useNavigate()
  const { complaints, totalCount, resolvedCount, pendingCount, inProgressCount } = useComplaints()

  // Build real category breakdown from actual submitted complaints
  const categoryMap = {}
  complaints.forEach(c => {
    const color = getCategoryColor(c.type)
    const key = c.type || 'Other'
    if (!categoryMap[key]) categoryMap[key] = { name: key, value: 0, color }
    categoryMap[key].value += 1
  })
  const livePieData = Object.values(categoryMap)

  // Severity breakdown from real data
  const severityMap = { high: 0, critical: 0, medium: 0, low: 0 }
  complaints.forEach(c => { if (c.severity in severityMap) severityMap[c.severity]++ })

  const STAT_CARDS = [
    { label: 'Total Complaints', value: totalCount,      icon: '📊', colorBg: 'from-blue-600/20 to-blue-900/20',    border: 'border-blue-500/20',   text: 'text-blue-400'   },
    { label: 'Resolved',         value: resolvedCount,   icon: '✅', colorBg: 'from-green-600/20 to-green-900/20', border: 'border-green-500/20',  text: 'text-green-400'  },
    { label: 'In Progress',      value: inProgressCount, icon: '🔄', colorBg: 'from-cyan-600/20 to-cyan-900/20',   border: 'border-cyan-500/20',   text: 'text-cyan-400'   },
    { label: 'Pending',          value: pendingCount,    icon: '⏳', colorBg: 'from-yellow-600/20 to-yellow-900/20',border: 'border-yellow-500/20', text: 'text-yellow-400' },
    { label: 'Districts Covered',value: '30 / 31',       icon: '🏙️', colorBg: 'from-purple-600/20 to-purple-900/20',border: 'border-purple-500/20', text: 'text-purple-400' },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="section-title">🛡️ Admin Dashboard</h2>
          <p className="section-subtitle">Real-time monitoring — Karnataka Smart City</p>
        </div>
        <div className="flex items-center gap-2 bg-primary-900/40 border border-primary-500/30 px-3 py-1.5 rounded-xl text-xs text-primary-400">
          <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
          {totalCount === 0 ? 'Awaiting first report' : `${totalCount} total report${totalCount !== 1 ? 's' : ''}`}
        </div>
      </div>

      {/* Stat Cards — always show real values */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {STAT_CARDS.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className={`bg-gradient-to-br ${s.colorBg} border ${s.border} rounded-2xl p-4 text-center hover:-translate-y-1 transition-all`}>
            <div className="text-2xl mb-2">{s.icon}</div>
            <motion.p key={s.value} initial={{ scale: 1.1 }} animate={{ scale: 1 }} className={`text-2xl font-black ${s.text}`}>
              {typeof s.value === 'number' ? s.value.toLocaleString() : s.value}
            </motion.p>
            <p className="text-gray-500 text-xs mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {totalCount === 0 ? (
        /* ── Full empty state ────────────────────────────────────────── */
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass p-16 rounded-2xl flex flex-col items-center justify-center text-center">
          <div className="text-6xl mb-4 opacity-30">📊</div>
          <h3 className="text-white font-bold text-2xl mb-2">No Reports Yet</h3>
          <p className="text-gray-400 text-sm max-w-sm mb-6">
            The dashboard shows live data only. No fake records are displayed. Charts and breakdowns will appear once citizens submit real complaints.
          </p>
          <button onClick={() => navigate('/admin/complaints')} className="btn-secondary text-sm">
            Go to Complaints →
          </button>
        </motion.div>
      ) : (
        <>
          {/* ── Two-column: Breakdown + Severity ─────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Issue Breakdown — real data only */}
            <div className="glass p-6 rounded-2xl">
              <h3 className="text-white font-bold mb-4">🥧 Issue Type Breakdown</h3>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <ResponsiveContainer width={180} height={180} className="flex-shrink-0">
                  <PieChart>
                    <Pie data={livePieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                      {livePieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0d1612', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 flex-1">
                  {livePieData.map(d => (
                    <div key={d.name} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.color }} />
                      <span className="text-gray-300 text-sm flex-1 truncate">{d.name}</span>
                      <span className="text-white font-bold">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Severity Breakdown — real data */}
            <div className="glass p-6 rounded-2xl">
              <h3 className="text-white font-bold mb-5">⚠️ Severity Breakdown</h3>
              <div className="space-y-4">
                {[
                  { label: 'Critical', count: severityMap.critical, color: 'bg-red-600',    text: 'text-red-400'    },
                  { label: 'High',     count: severityMap.high,     color: 'bg-orange-500', text: 'text-orange-400' },
                  { label: 'Medium',   count: severityMap.medium,   color: 'bg-yellow-500', text: 'text-yellow-400' },
                  { label: 'Low',      count: severityMap.low,      color: 'bg-green-500',  text: 'text-green-400'  },
                ].map(s => (
                  <div key={s.label}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className={`font-semibold ${s.text}`}>{s.label}</span>
                      <span className="text-white font-bold">{s.count}</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2">
                      <motion.div initial={{ width: 0 }}
                        animate={{ width: totalCount > 0 ? `${(s.count / totalCount) * 100}%` : '0%' }}
                        transition={{ duration: 0.8 }}
                        className={`h-2 rounded-full ${s.color}`} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-2 gap-3">
                <div className="text-center">
                  <p className="text-green-400 font-black text-xl">{totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0}%</p>
                  <p className="text-gray-500 text-xs">Resolution Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-blue-400 font-black text-xl">{totalCount > 0 ? Math.round((inProgressCount / totalCount) * 100) : 0}%</p>
                  <p className="text-gray-500 text-xs">In Progress Rate</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Live Complaints Feed ──────────────────────────────────── */}
          <div className="glass p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-lg">⚡ All Complaints Feed</h3>
              <button onClick={() => navigate('/admin/complaints')}
                className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1">
                Manage <FiArrowRight size={13} />
              </button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {complaints.map((c, i) => {
                const color = getCategoryColor(c.type)
                return (
                  <motion.div key={c.id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/8 border border-white/5 cursor-pointer transition-all"
                    onClick={() => navigate('/admin/complaints')}>
                    {/* Color dot */}
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
                    {/* Photo */}
                    {c.photo
                      ? <img src={c.photo} alt={c.type} className="w-10 h-10 rounded-xl object-cover flex-shrink-0 border border-white/10" />
                      : <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 text-gray-600 text-xs">📷</div>
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-semibold truncate">{c.id} · {c.type}</p>
                      <p className="text-gray-500 text-xs truncate">{c.location || 'No location'} · {c.district || '—'}</p>
                      <p className="text-gray-600 text-xs">{c.date} {c.time} · By {c.name}</p>
                    </div>
                    <div className="text-right flex-shrink-0 space-y-1">
                      <span className={`text-xs font-bold uppercase block ${c.severity === 'high' || c.severity === 'critical' ? 'text-red-400' : c.severity === 'medium' ? 'text-yellow-400' : 'text-green-400'}`}>
                        {c.severity}
                      </span>
                      <span className={c.status === 'resolved' ? 'badge-resolved' : c.status === 'in-progress' ? 'badge-progress' : 'badge-pending'}>
                        {c.status === 'in-progress' ? 'In Progress' : c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AdminDashboardPage
