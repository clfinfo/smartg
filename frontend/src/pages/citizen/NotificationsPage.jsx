import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiBell, FiCheckCircle, FiTrash2, FiRefreshCw } from 'react-icons/fi'
import { io } from 'socket.io-client'
import { useAuth } from '../../context/AuthContext'

const BACKEND = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:5000'
  : `http://${window.location.hostname}:5000`;

const TYPE_ICON = {
  new_complaint: { icon: '🔔', bg: 'bg-blue-500/10 text-blue-400' },
  status_update: { icon: '🔄', bg: 'bg-green-500/10 text-green-400' },
  worker_assigned: { icon: '👷', bg: 'bg-yellow-500/10 text-yellow-400' },
  complaint_deleted: { icon: '🗑️', bg: 'bg-red-500/10 text-red-400' },
}

const NotificationsPage = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    if (!user?.token) return
    setLoading(true)
    try {
      const res = await fetch(`${BACKEND}/api/notifications`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
      const data = await res.json()
      if (data.success) setNotifications(data.data || [])
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Real-time updates
  useEffect(() => {
    if (!user) return
    const userId = user.id || user._id
    const socket = io(BACKEND, {
      transports: ['websocket', 'polling'],
      query: { userId: userId || '', role: user.role || '' }
    })
    if (user.role === 'admin') {
      socket.on('admin_notification', (notif) => {
        setNotifications(prev => [notif, ...prev])
      })
    }
    if (userId) {
      socket.on(`user_notification_${userId}`, (notif) => {
        setNotifications(prev => [notif, ...prev])
      })
    }
    return () => socket.disconnect()
  }, [user])

  const markRead = async (id) => {
    try {
      await fetch(`${BACKEND}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, is_read: true } : n))
    } catch { }
  }

  const markAllRead = async () => {
    try {
      await fetch(`${BACKEND}/api/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch { }
  }

  const deleteNotif = async (id) => {
    try {
      await fetch(`${BACKEND}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
      setNotifications(prev => prev.filter(n => n._id !== id))
    } catch { }
  }

  const filtered = notifications.filter(n =>
    filter === 'all' || (filter === 'unread' && !n.is_read)
  )
  const unread = notifications.filter(n => !n.is_read).length

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="section-title">🔔 Notifications</h2>
          <p className="text-gray-500 text-xs mt-1">
            {unread > 0 ? `${unread} unread notification${unread !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          {/* Filter tabs */}
          <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
            {['all', 'unread'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${filter === f ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                {f} {f === 'unread' && unread > 0 && `(${unread})`}
              </button>
            ))}
          </div>
          {/* Refresh */}
          <button onClick={fetchNotifications}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
            <FiRefreshCw size={14} />
          </button>
          {/* Mark all read */}
          {unread > 0 && (
            <button onClick={markAllRead}
              className="flex items-center gap-2 text-xs text-primary-400 hover:text-primary-300 border border-primary-500/30 px-3 py-1.5 rounded-xl bg-primary-500/5 hover:bg-primary-500/10 transition-all">
              <FiCheckCircle size={12} /> Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="glass p-12 rounded-2xl flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Loading notifications...</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filtered.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="glass p-16 rounded-2xl text-center">
                <FiBell size={40} className="mx-auto mb-3 text-gray-700" />
                <h3 className="text-gray-500 font-medium mb-1">No notifications available.</h3>
                <p className="text-gray-600 text-sm">
                  {filter === 'unread' ? 'All notifications have been read.' : 'Notifications will appear here when actions happen.'}
                </p>
              </motion.div>
            ) : (
              filtered.map((n) => {
                const typeInfo = TYPE_ICON[n.type] || { icon: '🔔', bg: 'bg-gray-500/10 text-gray-400' }
                return (
                  <motion.div key={n._id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => markRead(n._id)}
                    className={`glass p-5 rounded-2xl flex items-start gap-4 cursor-pointer hover:border-white/20 transition-all ${!n.is_read ? 'border border-primary-500/25 bg-primary-900/10' : 'border border-white/5'}`}>

                    {/* Icon */}
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 ${typeInfo.bg}`}>
                      {typeInfo.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-white font-semibold text-sm">{n.title}</h3>
                            {!n.is_read && (
                              <span className="w-2 h-2 rounded-full bg-primary-400 flex-shrink-0 animate-pulse" />
                            )}
                          </div>
                          <p className="text-gray-400 text-sm leading-relaxed">{n.message}</p>
                          <div className="flex items-center gap-3 mt-2">
                            {n.custom_id && (
                              <span className="font-mono text-primary-400 text-xs bg-primary-900/30 px-2 py-0.5 rounded-md">
                                {n.custom_id}
                              </span>
                            )}
                            <p className="text-gray-600 text-xs">
                              {new Date(n.created_at).toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>
                        {/* Delete button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteNotif(n._id) }}
                          className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0">
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

export default NotificationsPage
