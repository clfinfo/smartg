import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser } from 'react-icons/fi'
import { FaLeaf } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'
import ParticleBackground from '../../components/ui/ParticleBackground'

const LoginPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', role: 'citizen' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { setError('Please fill all fields'); return }
    setLoading(true)
    setError('')
    try {
      const user = await login(form.email, form.password)
      navigate(user.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const demoLogin = (role) => {
    setForm({ email: role === 'admin' ? 'admin@karnataka.gov.in' : 'citizen@karnataka.gov.in', password: 'demo1234', role })
  }

  return (
    <div className="min-h-screen auth-bg bg-grid flex items-center justify-center p-4 relative overflow-hidden">
      <ParticleBackground />

      {/* Decorative city silhouette */}
      <div className="absolute bottom-0 left-0 right-0 h-32 opacity-10">
        <svg viewBox="0 0 1400 120" className="w-full h-full fill-primary-500">
          <rect x="0" y="60" width="80" height="60" />
          <rect x="90" y="30" width="60" height="90" />
          <rect x="160" y="50" width="100" height="70" />
          <rect x="270" y="20" width="70" height="100" />
          <rect x="350" y="40" width="90" height="80" />
          <rect x="450" y="10" width="80" height="110" />
          <rect x="540" y="35" width="110" height="85" />
          <rect x="660" y="55" width="75" height="65" />
          <rect x="745" y="25" width="65" height="95" />
          <rect x="820" y="45" width="95" height="75" />
          <rect x="925" y="15" width="85" height="105" />
          <rect x="1020" y="40" width="70" height="80" />
          <rect x="1100" y="30" width="100" height="90" />
          <rect x="1210" y="50" width="80" height="70" />
          <rect x="1300" y="20" width="100" height="100" />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-600 to-emerald-400 mb-4 shadow-glow-lg"
          >
            <FaLeaf className="text-white text-3xl" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white">EcoSmart City</h1>
          <p className="text-gray-400 text-sm mt-1">Karnataka AI Reporting System</p>
        </div>

        {/* Card */}
        <div className="glass p-8 rounded-3xl shadow-glass">
          <h2 className="text-xl font-bold text-white mb-6">Welcome 👋</h2>

          {/* Role Toggle */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-6">
            {['citizen', 'admin'].map(role => (
              <button
                key={role}
                type="button"
                onClick={() => { setForm(f => ({ ...f, role })); demoLogin(role) }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 capitalize ${form.role === role ? 'bg-primary-600 text-white shadow-glow' : 'text-gray-400 hover:text-white'}`}
              >
                {role === 'citizen' ? '👤 Citizen' : '🔑 Admin'}
              </button>
            ))}
          </div>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="input-field pl-11"
              />
            </div>

            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="input-field pl-11 pr-11"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                {showPass ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                <input type="checkbox" className="rounded" /> Remember me
              </label>
              <Link to="/forgot-password" className="text-primary-400 hover:text-primary-300">Forgot password?</Link>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2 mb-6"
            >
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Authenticating...</>
              ) : 'Login to Dashboard'}
            </motion.button>
          </form>

          <p className="text-center text-gray-400 text-sm">
            Don't have an account? <Link to="/register" className="text-primary-400 hover:text-primary-300 font-semibold">Sign Up</Link>
          </p>
        </div>

        {/* Demo creds hint */}
        <div className="mt-4 text-center text-xs text-gray-600">
          Demo: citizen@karnataka.gov.in / admin@karnataka.gov.in — any password
        </div>
      </motion.div>
    </div>
  )
}

export default LoginPage
