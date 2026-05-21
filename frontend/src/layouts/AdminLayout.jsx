import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiGrid, FiList, FiUsers, FiBell,
  FiSettings, FiLogOut, FiChevronLeft, FiChevronRight,
  FiShield
} from 'react-icons/fi'
import { FaLeaf } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import NotificationBell from '../components/ui/NotificationBell'

const NAV_ITEMS = [
  { path: '/admin',              label: 'Dashboard',        icon: FiGrid,    exact: true },
  { path: '/admin/complaints',   label: 'Complaints',       icon: FiList },
  { path: '/admin/workers',      label: 'Worker Assignment',icon: FiUsers },
  { path: '/admin/notifications',label: 'Notifications',    icon: FiBell },
  { path: '/admin/settings',     label: 'Settings',         icon: FiSettings },
]

const AdminLayout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (path, exact) => exact ? location.pathname === path : location.pathname.startsWith(path)

  return (
    <div className="flex h-screen bg-dark-900 overflow-hidden">
      {/* Admin Sidebar (always dark) */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col bg-dark-900 border-r border-white/5 relative"
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-emerald-400 flex items-center justify-center shadow-glow flex-shrink-0">
            <FaLeaf className="text-white text-sm" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-white font-bold text-sm">EcoSmart Admin</h2>
              <p className="text-primary-500 text-xs flex items-center gap-1"><FiShield size={10} /> Government Panel</p>
            </div>
          )}
        </div>



        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {!collapsed && <p className="text-gray-600 text-xs font-semibold uppercase tracking-wider px-2 mb-3">Admin Panel</p>}
          {NAV_ITEMS.map(({ path, label, icon: Icon, exact }) => {
            const active = isActive(path, exact)
            return (
              <button key={path} onClick={() => navigate(path)}
                className={`nav-item w-full ${active ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
                title={collapsed ? label : ''}>
                <Icon size={18} />
                {!collapsed && <span className="text-sm">{label}</span>}
              </button>
            )
          })}
        </nav>

        {/* Admin user */}
        <div className="px-3 pb-4 border-t border-white/10 pt-3">
          {!collapsed ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-primary-900/30 border border-primary-500/20">
              <div className="w-9 h-9 rounded-lg bg-primary-700 flex items-center justify-center text-primary-200 font-bold text-sm flex-shrink-0">
                {user?.name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
                <p className="text-primary-400 text-xs">🔑 Administrator</p>
              </div>
              <button onClick={() => { logout(); navigate('/login') }} className="text-gray-500 hover:text-red-400 transition-colors">
                <FiLogOut size={16} />
              </button>
            </div>
          ) : (
            <button onClick={() => { logout(); navigate('/login') }} className="nav-item w-full justify-center px-2 text-red-400" title="Logout">
              <FiLogOut size={18} />
            </button>
          )}
        </div>

        {/* Collapse btn */}
        <button onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-dark-700 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white z-10">
          {collapsed ? <FiChevronRight size={12} /> : <FiChevronLeft size={12} />}
        </button>
      </motion.aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center gap-4 px-6 py-4 bg-dark-800/50 backdrop-blur border-b border-white/5">
          <div className="flex-1">
            <h1 className="text-white font-bold text-lg">{NAV_ITEMS.find(n => isActive(n.path, n.exact))?.label || 'Admin Dashboard'}</h1>
            <p className="text-gray-500 text-xs">EcoSmart City — Government Administration Panel</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-primary-900/40 border border-primary-500/30 px-3 py-1.5 rounded-xl text-xs">
              <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
              <span className="text-primary-400 font-medium">System Online</span>
            </div>
            <NotificationBell />
            <button onClick={() => navigate('/dashboard')} className="btn-secondary py-2 px-4 text-sm">↩ User View</button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 bg-grid">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
