import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiPhone, FiMapPin, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi'
import { WORKERS, COMPLAINTS } from '../../data/mockData'

const STATUS_STYLE = {
  active: 'bg-green-500/10 text-green-400 border-green-500/30',
  busy: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  inactive: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
}

const WorkerAssignmentPage = () => {
  const [workers, setWorkers] = useState(WORKERS)
  const [selected, setSelected] = useState(null)

  const pendingComplaints = COMPLAINTS.filter(c => c.status === 'pending' || c.worker === 'Unassigned')

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="section-title">👷 Worker Assignment</h2>
        <p className="section-subtitle">Manage and dispatch field teams across Karnataka</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active', value: workers.filter(w => w.status === 'active').length, color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'Busy', value: workers.filter(w => w.status === 'busy').length, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          { label: 'Inactive', value: workers.filter(w => w.status === 'inactive').length, color: 'text-gray-400', bg: 'bg-gray-500/10' },
        ].map(s => (
          <div key={s.label} className={`glass p-4 rounded-2xl text-center ${s.bg}`}>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-gray-400 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Worker Cards */}
        <div className="space-y-4">
          <h3 className="text-white font-semibold">Field Teams</h3>
          <div className="grid grid-cols-1 gap-3">
            {workers.map((w, i) => (
              <motion.div key={w.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                onClick={() => setSelected(selected?.id === w.id ? null : w)}
                className={`glass p-4 rounded-2xl cursor-pointer transition-all hover:-translate-y-0.5 ${selected?.id === w.id ? 'border-primary-500/40' : ''}`}>
                <div className="flex items-center gap-4">
                  <img src={w.avatar} alt={w.name} className="w-12 h-12 rounded-2xl bg-primary-900 flex-shrink-0 border border-white/10" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-white font-semibold">{w.name}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs border ${STATUS_STYLE[w.status]}`}>{w.status}</span>
                    </div>
                    <p className="text-gray-400 text-xs">{w.team} · {w.role}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><FiMapPin size={11} /> {w.location}</span>
                      <span className="flex items-center gap-1"><FiCheckCircle size={11} /> {w.tasks} tasks</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-primary-400 font-bold text-lg">{w.efficiency}%</p>
                    <p className="text-gray-600 text-xs">efficiency</p>
                  </div>
                </div>
                {/* Efficiency bar */}
                <div className="mt-3">
                  <div className="w-full bg-white/5 rounded-full h-1.5">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${w.efficiency}%` }} transition={{ delay: i * 0.1 + 0.3 }}
                      className={`h-1.5 rounded-full ${w.efficiency >= 90 ? 'bg-primary-500' : w.efficiency >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Pending tasks + map */}
        <div className="space-y-4">
          {/* Pending complaints for assignment */}
          <div className="glass p-5 rounded-2xl">
            <h3 className="text-white font-semibold mb-4">🔴 Unassigned Complaints ({pendingComplaints.length})</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {pendingComplaints.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${c.severity === 'high' ? 'bg-red-500' : c.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium">{c.type}</p>
                    <p className="text-gray-500 text-xs truncate">{c.location}</p>
                  </div>
                  <span className="badge-pending text-xs">{c.severity}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Fleet Tracker Map */}
          <div className="glass p-5 rounded-2xl">
            <h3 className="text-white font-semibold mb-3">🗺️ Fleet Tracker</h3>
            <div className="relative rounded-xl overflow-hidden" style={{ height: 220 }}>
              <iframe
                title="fleet-map"
                width="100%" height="100%"
                style={{ border: 0, filter: 'invert(0.9) hue-rotate(170deg) saturate(0.5)' }}
                src="https://www.openstreetmap.org/export/embed.html?bbox=77.4,12.8,77.7,13.1&layer=mapnik"
                loading="lazy"
              />
              <div className="absolute inset-0 pointer-events-none border border-primary-500/20 rounded-xl" />
              {/* Worker position dots */}
              {['35%,40%', '60%,55%', '45%,70%', '70%,35%'].map((pos, i) => {
                const [left, top] = pos.split(',')
                const colors = ['bg-green-500', 'bg-yellow-500', 'bg-green-500', 'bg-gray-500']
                return (
                  <div key={i} style={{ position: 'absolute', left, top }} className={`w-4 h-4 ${colors[i]} rounded-full border-2 border-white shadow-lg animate-pulse`} title={`${workers[i]?.name}`} />
                )
              })}
            </div>
            <p className="text-gray-500 text-xs mt-2 text-center">Live worker locations — Bengaluru Urban</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkerAssignmentPage
