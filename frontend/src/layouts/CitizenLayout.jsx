import { useState, useCallback } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiHome, FiCamera, FiMap, FiList, FiAward,
  FiBell, FiUser, FiLogOut, FiChevronLeft,
  FiChevronRight, FiSun, FiMoon, FiPlus
} from 'react-icons/fi'
import { FaLeaf } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { NOTIFICATIONS } from '../data/mockData'
import { useRealtimeNotifications } from '../hooks/useRealtime'

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Home', icon: FiHome, exact: true },
  { path: '/dashboard/report', label: 'Report Issue', icon: FiCamera },
  { path: '/dashboard/map', label: 'Live Map', icon: FiMap },
  { path: '/dashboard/complaints', label: 'My Complaints', icon: FiList },
  { path: '/dashboard/rewards', label: 'Rewards', icon: FiAward },
  { path: '/dashboard/notifications', label: 'Notifications', icon: FiBell },
  { path: '/dashboard/profile', label: 'Profile', icon: FiUser },
]

const CitizenLayout = () => {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(NOTIFICATIONS.filter(n => !n.read).length)

  // Live notification badge
  const handleNewNotif = useCallback(() => setUnreadCount(c => c + 1), [])
  useRealtimeNotifications(handleNewNotif)

  const unread = unreadCount
  const isActive = (path, exact) => exact ? location.pathname === path : location.pathname === path || location.pathname.startsWith(path + '/')

  const handleNav = (path) => {
    navigate(path)
    setMobileOpen(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-200 dark:border-white/10 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-emerald-400 flex items-center justify-center shadow-glow flex-shrink-0">
          <FaLeaf className="text-white text-sm" />
        </div>
        {!collapsed && (
          <div>
            <h2 className="text-slate-800 dark:text-white font-bold text-sm leading-tight">EcoSmart City</h2>
            <p className="text-gray-500 text-xs">Karnataka v2.0</p>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {!collapsed && <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider px-2 mb-3">Citizen Portal</p>}
        {NAV_ITEMS.map(({ path, label, icon: Icon, exact }) => {
          const active = isActive(path, exact)
          return (
            <button
              key={path}
              onClick={() => handleNav(path)}
              className={`nav-item w-full ${active ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
              title={collapsed ? label : ''}
            >
              <div className="relative">
                <Icon size={18} />
                {label === 'Notifications' && unread > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">{unread}</span>
                )}
              </div>
              {!collapsed && <span className="text-sm">{label}</span>}
              {!collapsed && active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400" />}
            </button>
          )
        })}
      </nav>

      {/* User & utilities */}
      <div className="px-3 pb-4 space-y-2 border-t border-slate-200 dark:border-white/10 pt-3">
        {/* Theme */}
        {!collapsed ? (
          <div className="flex gap-2">
            <button onClick={toggleTheme} className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white text-xs transition-all border border-slate-200 dark:border-white/10">
              {isDark ? <FiSun size={14} /> : <FiMoon size={14} />}
              {isDark ? 'Switch to Light' : 'Switch to Dark'}
            </button>
          </div>
        ) : (
          <button onClick={toggleTheme} title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="nav-item w-full justify-center px-2">
            {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>
        )}

        {/* User card */}
        {!collapsed ? (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
            <img src={user?.avatar} alt="avatar" className="w-9 h-9 rounded-lg object-cover bg-primary-800" />
            <div className="flex-1 min-w-0">
              <p className="text-slate-850 dark:text-white text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-primary-600 dark:text-primary-400 text-xs truncate">⭐ {user?.rank}</p>
            </div>
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-400 transition-colors p-1">
              <FiLogOut size={16} />
            </button>
          </div>
        ) : (
          <button onClick={handleLogout} className="nav-item w-full justify-center px-2 text-red-400 hover:bg-red-500/10" title="Logout">
            <FiLogOut size={18} />
          </button>
        )}
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-dark-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden md:flex flex-col bg-white dark:bg-dark-800 border-r border-slate-200 dark:border-white/5 relative overflow-hidden sidebar-transition"
      >
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-slate-100 dark:bg-dark-700 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-gray-400 hover:text-slate-800 hover:bg-slate-200 dark:hover:text-white dark:hover:bg-dark-600 transition-all z-10"
        >
          {collapsed ? <FiChevronRight size={12} /> : <FiChevronLeft size={12} />}
        </button>
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} className="fixed inset-0 bg-black/60 z-40 md:hidden" />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', damping: 25 }} className="fixed left-0 top-0 bottom-0 w-64 flex flex-col bg-white dark:bg-dark-800 border-r border-slate-200 dark:border-white/5 z-50 md:hidden">
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="flex items-center gap-4 px-6 py-4 bg-white/70 dark:bg-dark-800/50 backdrop-blur border-b border-slate-200 dark:border-white/5 flex-shrink-0">
          <button onClick={() => setMobileOpen(true)} className="md:hidden text-slate-650 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white">
            <FiList size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-slate-805 dark:text-white font-bold text-lg leading-tight">
              {NAV_ITEMS.find(n => isActive(n.path, n.exact))?.label || 'Dashboard'}
            </h1>
            <p className="text-gray-500 text-xs">
              EcoSmart City — Karnataka AI Reporting System
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => handleNav('/dashboard/notifications')} className="relative p-2 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white transition-all border border-slate-200 dark:border-white/10">
              <FiBell size={18} />
              {unread > 0 && <span className="notification-dot">{unread}</span>}
            </button>
            <button onClick={() => handleNav('/dashboard/report')} className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
              <FiPlus size={16} /> <span className="hidden sm:inline">Report</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 bg-grid">
          <Outlet />
        </main>
      </div>

      {/* Floating report button (mobile) */}
      <button
        onClick={() => handleNav('/dashboard/report')}
        className="fixed bottom-6 right-6 md:hidden w-14 h-14 rounded-full bg-gradient-to-br from-primary-600 to-emerald-500 flex items-center justify-center shadow-glow-lg floating-btn z-30"
      >
        <FiPlus className="text-white text-2xl" />
      </button>
    </div>
  )
}

export default CitizenLayout
