import { motion } from 'framer-motion'
import { FiAlertCircle, FiArrowRight } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useComplaints } from '../../context/ComplaintsContext'

const WorkerAssignmentPage = () => {
  const navigate = useNavigate()
  const { complaints, pendingCount, inProgressCount } = useComplaints()

  const pendingComplaints = complaints.filter(c =>
    c.status === 'pending' || (c.status || '').toLowerCase() === 'pending'
  )

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="section-title">👷 Worker Assignment</h2>
        <p className="section-subtitle">Manage and dispatch field teams across Karnataka</p>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="glass p-5 rounded-2xl text-center bg-yellow-500/5 border-yellow-500/20">
          <p className="text-3xl font-black text-yellow-400">{pendingCount}</p>
          <p className="text-gray-400 text-xs mt-1">Pending Assignment</p>
        </div>
        <div className="glass p-5 rounded-2xl text-center bg-blue-500/5 border-blue-500/20">
          <p className="text-3xl font-black text-blue-400">{inProgressCount}</p>
          <p className="text-gray-400 text-xs mt-1">In Progress</p>
        </div>
        <div className="glass p-5 rounded-2xl text-center bg-green-500/5 border-green-500/20 col-span-2 md:col-span-1">
          <p className="text-3xl font-black text-green-400">{complaints.length}</p>
          <p className="text-gray-400 text-xs mt-1">Total Complaints</p>
        </div>
      </div>

      {/* Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 rounded-2xl border border-yellow-500/20 text-center"
      >
        <div className="text-5xl mb-4">👷</div>
        <h3 className="text-white font-bold text-xl mb-2">Worker Assignment — Not Yet Implemented</h3>
        <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
          Dynamic worker assignment is not yet functional. Use the Complaints Management page to update complaint statuses manually.
        </p>
        <button
          onClick={() => navigate('/admin/complaints')}
          className="btn-primary flex items-center gap-2 mx-auto"
        >
          Go to Complaints Management <FiArrowRight size={16} />
        </button>
      </motion.div>

      {/* Unassigned Complaints Queue */}
      {pendingComplaints.length > 0 && (
        <div className="glass p-6 rounded-2xl">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <FiAlertCircle className="text-yellow-400" size={18} />
            Pending Assignment Queue ({pendingComplaints.length})
          </h3>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {pendingComplaints.map((c, i) => (
              <motion.div
                key={c._id || c.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5"
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  c.severity === 'high' || c.severity === 'critical' ? 'bg-red-500' :
                  c.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium">{c.type}</p>
                  <p className="text-gray-500 text-xs truncate">{c.location || c.district || 'No location'}</p>
                </div>
                <span className="text-yellow-400 text-xs font-semibold border border-yellow-500/30 bg-yellow-500/10 px-2 py-0.5 rounded-lg capitalize">
                  {c.severity || 'medium'}
                </span>
                <button
                  onClick={() => navigate('/admin/complaints')}
                  className="text-primary-400 hover:text-primary-300 text-xs flex items-center gap-1 transition-colors"
                >
                  Manage <FiArrowRight size={12} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default WorkerAssignmentPage
