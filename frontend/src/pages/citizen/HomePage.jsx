import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMapPin, FiActivity, FiArrowRight, FiAlertCircle, FiPlus } from 'react-icons/fi'
import { FaLeaf } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'
import { useComplaints } from '../../context/ComplaintsContext'

const FadeIn = ({ children, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay }}>
    {children}
  </motion.div>
)

const typeStyle = (type = '') => {
  if (type.includes('Garbage'))     return { icon: '🗑️', color: 'bg-green-500/10 text-green-400' }
  if (type.includes('Pothole'))     return { icon: '🛣️', color: 'bg-red-500/10 text-red-400' }
  if (type.includes('Drainage'))    return { icon: '💧', color: 'bg-blue-500/10 text-blue-400' }
  if (type.includes('Streetlight')) return { icon: '💡', color: 'bg-yellow-500/10 text-yellow-400' }
  return { icon: '🔧', color: 'bg-purple-500/10 text-purple-400' }
}

// ── Empty state card ────────────────────────────────────────────────────────
const EmptyBlock = ({ icon = '📭', message = 'No data yet', sub }) => (
  <div className="flex flex-col items-center justify-center py-10 text-center">
    <div className="text-5xl mb-3 opacity-40">{icon}</div>
    <p className="text-gray-400 font-medium">{message}</p>
    {sub && <p className="text-gray-600 text-xs mt-1">{sub}</p>}
  </div>
)

// ── Stat card ───────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color, isEmpty, onClick }) => (
  <motion.div whileHover={{ y: -3, scale: 1.01 }} onClick={onClick}
    className="glass p-5 rounded-2xl cursor-pointer hover:border-primary-500/30 transition-all">
    <div className="flex items-start gap-3 mb-3">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${color}`}>{icon}</div>
    </div>
    {isEmpty ? (
      <p className="text-gray-500 text-sm font-medium italic">No complaints yet</p>
    ) : (
      <motion.p key={value} initial={{ scale: 1.15, color: '#22c55e' }} animate={{ scale: 1, color: '#ffffff' }}
        className="text-3xl font-black text-white">{value}</motion.p>
    )}
    <p className="text-gray-400 text-sm mt-1">{label}</p>
  </motion.div>
)

// ═══════════════════════════════════════════════════════════════════════════
const HomePage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { complaints, totalCount, resolvedCount, pendingCount, inProgressCount } = useComplaints()

  const isEmpty = totalCount === 0
  const recentFeed = complaints.slice(0, 6)

  return (
    <div className="space-y-8 max-w-7xl mx-auto">

      {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
      <FadeIn>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-900/60 via-dark-700 to-dark-800 border border-primary-500/20 p-8 md:p-10">
          <div className="absolute top-0 right-0 w-80 h-80 opacity-10 pointer-events-none">
            <svg viewBox="0 0 400 400" className="w-full h-full">
              <circle cx="300" cy="100" r="150" fill="url(#hg)" />
              <defs><radialGradient id="hg"><stop offset="0%" stopColor="#22c55e" /><stop offset="100%" stopColor="transparent" /></radialGradient></defs>
            </svg>
          </div>
          <div className="absolute bottom-0 right-20 opacity-5 text-primary-400">
            <FaLeaf style={{ fontSize: '180px' }} />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 px-3 py-1 rounded-full text-primary-400 text-xs font-medium mb-4">
                <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
                Karnataka Smart City — AI Reporting System
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-3 leading-tight">
                Welcome, <span className="text-gradient">{user?.name?.split(' ')[0]}</span>! 👋
              </h1>
              <p className="text-gray-400 text-lg mb-6 max-w-xl">
                Help build a cleaner Karnataka. Report civic issues in seconds — our AI classifies, prioritises, and tracks every complaint.
              </p>
              <div className="flex flex-wrap gap-3">
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => navigate('/dashboard/report')} className="btn-primary flex items-center gap-2">
                  <FiActivity /> Report an Issue
                </motion.button>
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => navigate('/dashboard/map')} className="btn-secondary flex items-center gap-2">
                  <FiMapPin /> Live Map
                </motion.button>
              </div>
            </div>

            {/* Total counter — shows "–" if empty */}
            <div className="glass-green p-6 rounded-2xl text-center min-w-[150px]">
              <p className="text-gray-400 text-xs mb-1">Total Reports</p>
              {isEmpty ? (
                <p className="text-3xl font-black text-gray-500">—</p>
              ) : (
                <motion.p key={totalCount} initial={{ scale: 1.2, color: '#22c55e' }} animate={{ scale: 1, color: '#ffffff' }}
                  className="text-4xl font-black text-white">{totalCount}</motion.p>
              )}
              <p className="text-primary-400 text-xs mt-1">Karnataka-wide</p>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* ── Stats Grid ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: '📊', label: 'Total Complaints',   value: totalCount,      color: 'bg-blue-500/10 text-blue-400'   },
          { icon: '✅', label: 'Resolved',            value: resolvedCount,   color: 'bg-green-500/10 text-green-400' },
          { icon: '⏳', label: 'Pending',             value: pendingCount,    color: 'bg-yellow-500/10 text-yellow-400'},
          { icon: '🏙️', label: 'In Progress',        value: inProgressCount, color: 'bg-blue-400/10 text-blue-300'   },
        ].map((s, i) => (
          <FadeIn key={s.label} delay={i * 0.08}>
            <StatCard {...s} isEmpty={isEmpty} onClick={() => navigate('/dashboard/complaints')} />
          </FadeIn>
        ))}
      </div>

      {/* ── Main content: feed + CTA ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Live Feed */}
        <FadeIn delay={0.2}>
          <div className="lg:col-span-2 glass p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-white font-bold text-lg">⚡ Recent Complaints</h3>
                <p className="text-gray-500 text-xs">Your submitted reports</p>
              </div>
              {!isEmpty && (
                <button onClick={() => navigate('/dashboard/complaints')} className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1">
                  View All <FiArrowRight size={14} />
                </button>
              )}
            </div>

            <AnimatePresence>
              {isEmpty ? (
                <EmptyBlock
                  icon="📭"
                  message="No complaints reported yet"
                  sub="Tap 'Report an Issue' to submit your first civic complaint"
                />
              ) : (
                <div className="space-y-3">
                  {recentFeed.map((c, i) => {
                    const { icon, color } = typeStyle(c.type)
                    return (
                      <motion.div key={c.id}
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                        className="flex items-center gap-4 p-3 rounded-xl bg-white/3 hover:bg-white/8 border border-white/5 transition-all">
                        {c.photo ? (
                          <img src={c.photo} alt={c.type} className="w-10 h-10 rounded-xl object-cover flex-shrink-0 bg-white/10" />
                        ) : (
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${color}`}>{icon}</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{c.type}</p>
                          <p className="text-gray-500 text-xs truncate">{c.location || 'Location not set'}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className={c.status === 'resolved' ? 'badge-resolved' : c.status === 'in-progress' ? 'badge-progress' : 'badge-pending'}>
                            {c.status === 'in-progress' ? 'In Progress' : c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                          </span>
                          <p className="text-gray-600 text-xs mt-1">{c.date} {c.time}</p>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </AnimatePresence>
          </div>
        </FadeIn>

        {/* Report CTA card */}
        <FadeIn delay={0.3}>
          <div className="glass p-6 rounded-2xl flex flex-col">
            {isEmpty ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
                <div className="w-20 h-20 rounded-2xl bg-primary-600/20 flex items-center justify-center mb-4 border border-primary-500/20">
                  <FiAlertCircle className="text-primary-400 text-4xl" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Start Reporting</h3>
                <p className="text-gray-400 text-sm mb-6">
                  No complaints yet. Be the first to report a civic issue in your area!
                </p>
                <button onClick={() => navigate('/dashboard/report')} className="btn-primary w-full flex items-center justify-center gap-2">
                  <FiPlus /> Report First Issue
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-white font-bold text-lg mb-4">📈 Your Stats</h3>
                <div className="space-y-3 flex-1">
                  {[
                    { label: 'Total submitted', value: totalCount, color: 'text-white' },
                    { label: 'Resolved',         value: resolvedCount, color: 'text-green-400' },
                    { label: 'In Progress',      value: inProgressCount, color: 'text-blue-400' },
                    { label: 'Pending Review',   value: pendingCount, color: 'text-yellow-400' },
                  ].map(s => (
                    <div key={s.label} className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/5">
                      <span className="text-gray-400 text-sm">{s.label}</span>
                      <motion.span key={s.value} initial={{ scale: 1.3 }} animate={{ scale: 1 }}
                        className={`font-black text-lg ${s.color}`}>{s.value}</motion.span>
                    </div>
                  ))}
                </div>
                <button onClick={() => navigate('/dashboard/report')} className="btn-primary w-full flex items-center justify-center gap-2 mt-5">
                  <FiPlus /> Report New Issue
                </button>
              </>
            )}
          </div>
        </FadeIn>
      </div>

      {/* ── AI Features ────────────────────────────────────────────────────── */}
      <FadeIn delay={0.4}>
        <div className="glass p-6 rounded-2xl">
          <h3 className="text-white font-bold text-xl mb-2">🤖 AI-Powered Features</h3>
          <p className="text-gray-400 text-sm mb-6">Cutting-edge technology for a cleaner Karnataka</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '📸', title: 'AI Image Detection', desc: 'Auto-classify garbage, potholes & more', color: 'from-green-900/50 to-green-800/20' },
              { icon: '📍', title: 'GPS Auto-Location',  desc: 'Precise geotagging of every complaint', color: 'from-blue-900/50 to-blue-800/20' },
              { icon: '🎙️', title: 'Voice Reporting',   desc: 'Speak in Kannada or English',          color: 'from-purple-900/50 to-purple-800/20' },
              { icon: '🔔', title: 'Live Status Alerts', desc: 'Real-time updates on your reports',    color: 'from-orange-900/50 to-orange-800/20' },
            ].map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.08 }}
                className={`bg-gradient-to-br ${f.color} border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all card-hover`}>
                <div className="text-3xl mb-3">{f.icon}</div>
                <h4 className="text-white font-semibold text-sm mb-1">{f.title}</h4>
                <p className="text-gray-500 text-xs">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </FadeIn>



    </div>
  )
}

export default HomePage
