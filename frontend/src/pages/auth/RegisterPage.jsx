import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff, FiMapPin } from 'react-icons/fi'
import { FaLeaf, FaGoogle } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'
import ParticleBackground from '../../components/ui/ParticleBackground'
import { DISTRICTS } from '../../data/mockData'

const RegisterPage = () => {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', district: '', role: 'citizen' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await register(form.name, form.email, form.password, form.role)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="min-h-screen auth-bg bg-grid flex items-center justify-center p-4 relative overflow-hidden">
      <ParticleBackground />
      <div className="absolute bottom-0 left-0 right-0 h-24 opacity-10">
        <svg viewBox="0 0 1400 80" className="w-full h-full fill-primary-500">
          <rect x="0" y="30" width="60" height="50" /><rect x="70" y="10" width="50" height="70" />
          <rect x="130" y="20" width="80" height="60" /><rect x="220" y="0" width="60" height="80" />
          <rect x="290" y="25" width="70" height="55" /><rect x="370" y="5" width="65" height="75" />
          <rect x="445" y="30" width="90" height="50" /><rect x="545" y="15" width="55" height="65" />
          <rect x="610" y="35" width="75" height="45" /><rect x="695" y="10" width="65" height="70" />
          <rect x="770" y="22" width="85" height="58" /><rect x="865" y="5" width="70" height="75" />
          <rect x="945" y="28" width="60" height="52" /><rect x="1015" y="12" width="90" height="68" />
          <rect x="1115" y="20" width="75" height="60" /><rect x="1200" y="0" width="85" height="80" />
          <rect x="1295" y="30" width="105" height="50" />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-emerald-400 mb-3 shadow-glow">
            <FaLeaf className="text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-white">Join EcoSmart City</h1>
          <p className="text-gray-400 text-sm">Create your citizen account</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {[1, 2].map(s => (
            <div key={s} className={`flex items-center gap-2 ${s < step ? 'text-primary-400' : s === step ? 'text-white' : 'text-gray-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${s <= step ? 'bg-primary-600' : 'bg-white/10'}`}>{s}</div>
              {s === 1 && <span className="text-xs">Personal Info</span>}
              {s === 2 && <span className="text-xs">Account Setup</span>}
              {s < 2 && <div className="w-12 h-px bg-white/20" />}
            </div>
          ))}
        </div>

        <div className="glass p-8 rounded-3xl shadow-glass">
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </motion.div>
          )}
          <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2) } : handleSubmit} className="space-y-4">
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-2">Personal Information</h3>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="text" placeholder="Full Name" value={form.name} onChange={e => update('name', e.target.value)} className="input-field pl-11" required />
                </div>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="email" placeholder="Email Address" value={form.email} onChange={e => update('email', e.target.value)} className="input-field pl-11" required />
                </div>
                <div className="relative">
                  <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="tel" placeholder="Phone Number" value={form.phone} onChange={e => update('phone', e.target.value)} className="input-field pl-11" />
                </div>
                <div className="relative">
                  <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <select value={form.district} onChange={e => update('district', e.target.value)} className="input-field pl-11 appearance-none">
                    <option value="">Select District</option>
                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <button type="submit" className="btn-primary w-full">Continue →</button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-2">Account Setup</h3>
                {/* Role selection */}
                <div className="flex bg-white/5 rounded-xl p-1">
                  {['citizen', 'admin'].map(role => (
                    <button key={role} type="button" onClick={() => update('role', role)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all capitalize ${form.role === role ? 'bg-primary-600 text-white' : 'text-gray-400'}`}>
                      {role === 'citizen' ? '👤 Citizen' : '🔑 Admin'}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type={showPass ? 'text' : 'password'} placeholder="Create Password" value={form.password} onChange={e => update('password', e.target.value)} className="input-field pl-11 pr-11" required />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                    {showPass ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="password" placeholder="Confirm Password" className="input-field pl-11" required />
                </div>
                <label className="flex items-start gap-3 text-sm text-gray-400 cursor-pointer">
                  <input type="checkbox" className="mt-1" required /> I agree to the Terms of Service and Privacy Policy
                </label>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">← Back</button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</> : 'Create Account'}
                  </button>
                </div>
              </motion.div>
            )}
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-gray-500 text-xs">OR</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
          <button 
            type="button"
            onClick={handleSubmit} // Using handleSubmit to trigger the mock register flow via Google
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all text-sm"
          >
            <FaGoogle className="text-red-400" /> Continue with Google
          </button>
          <p className="text-center text-gray-400 text-sm mt-4">
            Already have an account? <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default RegisterPage
