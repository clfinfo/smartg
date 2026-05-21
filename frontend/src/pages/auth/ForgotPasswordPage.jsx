import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi'
import { FaLeaf } from 'react-icons/fa'
import ParticleBackground from '../../components/ui/ParticleBackground'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="min-h-screen auth-bg bg-grid flex items-center justify-center p-4 relative overflow-hidden">
      <ParticleBackground />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-emerald-400 mb-3 shadow-glow">
            <FaLeaf className="text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-white">Reset Password</h1>
          <p className="text-gray-400 text-sm">We'll send you a reset link</p>
        </div>

        <div className="glass p-8 rounded-3xl shadow-glass">
          {!sent ? (
            <>
              <p className="text-gray-400 text-sm mb-6">Enter your registered email address and we'll send you a link to reset your password.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="input-field pl-11" required />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</> : '📨 Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
              <div className="w-20 h-20 rounded-full bg-primary-600/20 flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="text-primary-400 text-4xl" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Email Sent!</h3>
              <p className="text-gray-400 text-sm mb-6">Check your inbox at <span className="text-primary-400">{email}</span> for the password reset link.</p>
              <button onClick={() => setSent(false)} className="btn-secondary w-full mb-3">Try a different email</button>
            </motion.div>
          )}

          <Link to="/login" className="flex items-center justify-center gap-2 text-gray-400 hover:text-white text-sm mt-4 transition-colors">
            <FiArrowLeft /> Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default ForgotPasswordPage
