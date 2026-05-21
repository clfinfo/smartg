import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiDownload, FiClock, FiEye, FiAlertCircle } from 'react-icons/fi'
import { useComplaints } from '../../context/ComplaintsContext'
import { useNavigate } from 'react-router-dom'

const STATUS_BADGE = {
  pending:       <span className="badge-pending">⏳ Pending</span>,
  'in-progress': <span className="badge-progress">🔄 In Progress</span>,
  resolved:      <span className="badge-resolved">✅ Resolved</span>,
  // backend variants
  Pending:       <span className="badge-pending">⏳ Pending</span>,
  'In Progress': <span className="badge-progress">🔄 In Progress</span>,
  Completed:     <span className="badge-resolved">✅ Resolved</span>,
}

const SEVERITY_STYLE = {
  low:      'text-green-400',
  medium:   'text-yellow-400',
  high:     'text-red-400',
  critical: 'text-red-500 font-bold',
}

const TIMELINE_STEPS = [
  { icon: '📝', label: 'Filed' },
  { icon: '🔍', label: 'Reviewing' },
  { icon: '👷', label: 'In Progress' },
  { icon: '✅', label: 'Resolved' },
]

const timelineStep = (status) => {
  if (status === 'resolved')    return 4
  if (status === 'in-progress') return 3
  if (status === 'pending')     return 2
  return 1
}

const EmptyState = ({ onReport }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className="glass p-16 rounded-2xl flex flex-col items-center justify-center text-center">
    <div className="text-6xl mb-4 opacity-40">📋</div>
    <h3 className="text-white font-bold text-xl mb-2">No Complaints Yet</h3>
    <p className="text-gray-400 text-sm mb-6 max-w-xs">
      You haven't submitted any complaints yet. Report a civic issue to see it here with real-time status tracking.
    </p>
    <button onClick={onReport} className="btn-primary flex items-center gap-2">
      <FiAlertCircle size={16} /> Report First Issue
    </button>
  </motion.div>
)

const MyComplaintsPage = () => {
  const { complaints } = useComplaints()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  const filtered = complaints.filter(c =>
    (statusFilter === 'all' || c.status === statusFilter) &&
    (search === '' ||
      c.type?.toLowerCase().includes(search.toLowerCase()) ||
      c.location?.toLowerCase().includes(search.toLowerCase()) ||
      c.id?.toLowerCase().includes(search.toLowerCase()))
  )

  const exportCSV = () => {
    const headers = ['ID,Type,Location,District,Date,Time,Status,Severity']
    const rows = filtered.map(c =>
      `${c.id},"${c.type}","${c.location}",${c.district},${c.date},${c.time},${c.status},${c.severity}`
    )
    const blob = new Blob([[...headers, ...rows].join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'my_complaints.csv'; a.click()
  }

  const isEmpty = complaints.length === 0

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="section-title">📋 My Complaints</h2>
          <p className="section-subtitle">
            {isEmpty ? 'No complaints filed yet' : `${complaints.length} complaint${complaints.length !== 1 ? 's' : ''} filed`}
          </p>
        </div>
        {!isEmpty && (
          <button onClick={exportCSV} className="btn-secondary flex items-center gap-2 text-sm">
            <FiDownload /> Export CSV
          </button>
        )}
      </div>

      {isEmpty ? (
        <EmptyState onReport={() => navigate('/dashboard/report')} />
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total',      value: complaints.length,                                    color: 'bg-blue-500/10 text-blue-400'    },
              { label: 'Pending',    value: complaints.filter(c => c.status === 'pending').length, color: 'bg-yellow-500/10 text-yellow-400' },
              { label: 'Resolved',   value: complaints.filter(c => c.status === 'resolved').length,color: 'bg-green-500/10 text-green-400'  },
            ].map(s => (
              <div key={s.label} className={`glass p-4 rounded-2xl text-center ${s.color}`}>
                <motion.p key={s.value} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="text-2xl font-black">{s.value}</motion.p>
                <p className="text-gray-400 text-xs">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-48">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input type="text" placeholder="Search complaints..." value={search}
                onChange={e => setSearch(e.target.value)} className="input-field pl-10" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all', 'pending', 'in-progress', 'resolved'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${statusFilter === s ? 'bg-primary-600 text-white' : 'glass text-gray-400 hover:text-white'}`}>
                  {s === 'all' ? '🌐 All' : s === 'pending' ? '⏳ Pending' : s === 'in-progress' ? '🔄 In Progress' : '✅ Resolved'}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="table-head">
                    {['ID','Photo','Type','Location','District','Date & Time','Severity','Status','Track'].map(h => (
                      <th key={h} className="table-cell text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => (
                    <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="table-row">
                      <td className="table-cell font-mono text-primary-400 text-xs">{c.id}</td>
                      <td className="table-cell">
                        {c.photo
                          ? <img src={c.photo} alt={c.type} className="w-12 h-10 rounded-lg object-cover border border-white/10" />
                          : <div className="w-12 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-gray-600">N/A</div>
                        }
                      </td>
                      <td className="table-cell">
                        <p className="text-white text-sm font-medium">{c.type}</p>
                        <p className="text-gray-600 text-xs truncate max-w-32">{c.description?.slice(0, 35)}...</p>
                      </td>
                      <td className="table-cell text-xs text-gray-300">{c.location || '—'}</td>
                      <td className="table-cell text-xs text-gray-400">{c.district || '—'}</td>
                      <td className="table-cell text-xs text-gray-400">{c.date}<br /><span className="text-gray-600">{c.time}</span></td>
                      <td className="table-cell">
                        <span className={`text-xs font-bold uppercase ${SEVERITY_STYLE[c.severity] || 'text-gray-400'}`}>
                          {c.severity}
                        </span>
                      </td>
                      <td className="table-cell">{STATUS_BADGE[c.status]}</td>
                      <td className="table-cell">
                        <button onClick={() => setSelected(selected?.id === c.id ? null : c)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white transition-all">
                          <FiEye size={14} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-gray-600">
                        <p className="text-3xl mb-2">🔍</p>
                        <p>No complaints match your filters</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Timeline detail panel */}
          <AnimatePresence>
            {selected && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="glass p-6 rounded-2xl border border-primary-500/20">
                <div className="flex items-start gap-6 flex-wrap">
                  {selected.photo && (
                    <img src={selected.photo} alt={selected.type} className="w-28 h-24 rounded-xl object-cover border border-white/10 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white font-bold text-lg">{selected.type}</h3>
                      {STATUS_BADGE[selected.status]}
                    </div>
                    <p className="text-gray-400 text-sm mb-1">{selected.description}</p>
                    <p className="text-gray-500 text-xs">
                      📍 {selected.location || 'Location N/A'} · {selected.district || 'District N/A'}<br />
                      🕒 Filed: {selected.date} at {selected.time}
                    </p>
                    {selected.notes && <p className="text-primary-400 text-xs mt-2">📝 Note: {selected.notes}</p>}
                  </div>

                  {/* Timeline */}
                  <div className="w-full mt-4">
                    <h4 className="text-gray-400 text-sm font-semibold mb-4 flex items-center gap-2">
                      <FiClock size={14} /> Complaint Progress
                    </h4>
                    <div className="flex items-center">
                      {TIMELINE_STEPS.map((step, i) => {
                        const done = i < timelineStep(selected.status)
                        return (
                          <div key={step.label} className="flex items-center flex-1">
                            <div className="flex flex-col items-center">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all ${done ? 'border-primary-500 bg-primary-500/20' : 'border-white/20 bg-white/5'}`}>
                                {step.icon}
                              </div>
                              <p className={`text-xs mt-2 text-center w-16 ${done ? 'text-primary-400' : 'text-gray-600'}`}>{step.label}</p>
                            </div>
                            {i < TIMELINE_STEPS.length - 1 && (
                              <div className={`flex-1 h-0.5 mb-5 ${done ? 'bg-primary-500' : 'bg-white/10'}`} />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  )
}

export default MyComplaintsPage
