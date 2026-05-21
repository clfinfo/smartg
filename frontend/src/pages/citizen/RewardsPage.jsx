import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiStar, FiTrendingUp, FiSend } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { useComplaints } from '../../context/ComplaintsContext'

const RewardsPage = () => {
  const { user } = useAuth()
  const { complaints, totalCount, resolvedCount } = useComplaints()
  const [feedback, setFeedback] = useState('')
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [rating, setRating] = useState(0)

  const garbageCount = complaints.filter(c => c.type?.includes('Garbage')).length
  const potholeCount = complaints.filter(c => c.type?.includes('Pothole')).length
  const drainageCount = complaints.filter(c => c.type?.includes('Drainage')).length
  const resolutionRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0

  const metrics = [
    { label: 'Garbage Reports', val: totalCount > 0 ? Math.round((garbageCount / totalCount) * 100) : 0, color: 'bg-green-500', count: garbageCount },
    { label: 'Pothole Reports', val: totalCount > 0 ? Math.round((potholeCount / totalCount) * 100) : 0, color: 'bg-red-500', count: potholeCount },
    { label: 'Drainage Issues', val: totalCount > 0 ? Math.round((drainageCount / totalCount) * 100) : 0, color: 'bg-blue-500', count: drainageCount },
    { label: 'Resolution Rate', val: resolutionRate, color: 'bg-yellow-500', count: `${resolvedCount}/${totalCount}` },
  ]

  const sendFeedback = () => {
    if (!feedback.trim() && rating === 0) return
    setFeedbackSent(true)
    setFeedback('')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="section-title">🏆 Rewards & Achievements</h2>
        <p className="section-subtitle">Track your contribution to Karnataka's smart city mission</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Contribution Score */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass p-6 rounded-2xl">
          <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
            <FiTrendingUp className="text-primary-400" /> Contribution Score
          </h3>

          {/* Total stats row */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Total Reports', value: totalCount, color: 'text-blue-400' },
              { label: 'Resolved', value: resolvedCount, color: 'text-green-400' },
              { label: 'Resolution %', value: `${resolutionRate}%`, color: 'text-yellow-400' },
            ].map(s => (
              <div key={s.label} className="bg-white/5 rounded-xl p-3 text-center">
                <motion.p key={s.value} initial={{ scale: 1.2 }} animate={{ scale: 1 }}
                  className={`text-xl font-black ${s.color}`}>{s.value}</motion.p>
                <p className="text-gray-500 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Progress bars */}
          <div className="space-y-4">
            {metrics.map((m, i) => (
              <div key={m.label}>
                <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                  <span>{m.label}</span>
                  <span className="text-white font-semibold">{m.count} &nbsp;<span className="text-gray-500">({m.val}%)</span></span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${m.val}%` }}
                    transition={{ delay: i * 0.12, duration: 0.9, ease: 'easeOut' }}
                    className={`h-2 rounded-full ${m.color}`}
                  />
                </div>
              </div>
            ))}
          </div>

          {totalCount === 0 && (
            <p className="text-gray-600 text-sm text-center mt-4">
              Submit your first complaint to start tracking your contribution!
            </p>
          )}
        </motion.div>

        {/* Rate the System */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass p-6 rounded-2xl">
          <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
            <FiStar className="text-yellow-400" /> Rate the System
          </h3>

          {!feedbackSent ? (
            <div className="space-y-5">
              {/* Star Rating */}
              <div>
                <p className="text-gray-400 text-sm mb-3">How would you rate your experience?</p>
                <div className="flex gap-3 justify-center">
                  {[1, 2, 3, 4, 5].map(r => (
                    <motion.button
                      key={r}
                      whileHover={{ scale: 1.25 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setRating(r)}
                      className={`text-3xl transition-all ${rating >= r ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]' : 'text-gray-700 hover:text-gray-500'}`}
                    >⭐</motion.button>
                  ))}
                </div>
                {rating > 0 && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-center text-sm mt-2 text-yellow-400">
                    {rating === 1 ? 'Poor 😞' : rating === 2 ? 'Fair 😐' : rating === 3 ? 'Good 🙂' : rating === 4 ? 'Very Good 😊' : 'Excellent! 🌟'}
                  </motion.p>
                )}
              </div>

              {/* Feedback Text */}
              <div>
                <p className="text-gray-400 text-sm mb-2">Share your experience (optional)</p>
                <textarea
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  rows={4}
                  placeholder="What did you like? What can we improve?"
                  className="input-field resize-none text-sm w-full"
                />
              </div>

              <button
                onClick={sendFeedback}
                disabled={rating === 0 && !feedback.trim()}
                className="btn-primary w-full text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FiSend size={14} /> Submit Feedback
              </button>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-10 text-center">
              <div className="text-6xl mb-4">🙏</div>
              <h4 className="text-white font-bold text-xl mb-2">Thank You!</h4>
              <p className="text-gray-400 text-sm mb-4">Your feedback helps us improve the Smart City experience.</p>
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map(r => (
                  <span key={r} className={`text-2xl ${r <= rating ? 'text-yellow-400' : 'text-gray-700'}`}>⭐</span>
                ))}
              </div>
              <button onClick={() => { setFeedbackSent(false); setRating(0) }}
                className="btn-secondary text-sm">Submit Another</button>
            </motion.div>
          )}
        </motion.div>

      </div>
    </div>
  )
}

export default RewardsPage
