import { useState, useEffect, useRef, useCallback } from 'react';
import { FiBell, FiCheckCircle, FiX, FiVolume2, FiVolumeX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { getBackendUrl } from '../../config/backend';

const BACKEND = getBackendUrl();

const TYPE_ICON = {
  new_complaint:    '📋',
  status_update:    '🔄',
  worker_assigned:  '👷',
  complaint_deleted:'🗑️',
  login_alert:      '🔐',
  resolved:         '✅',
};

// ─── Notification Sound (Web Audio API — no external file needed) ─────────────
const playNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch { /* silent fail if audio not supported */ }
};

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen]       = useState(false);
  const [loading, setLoading]     = useState(true);
  const [soundOn, setSoundOn]     = useState(true);
  const [pulse, setPulse]         = useState(false);
  const dropdownRef = useRef(null);
  const navigate    = useNavigate();
  const isFirst     = useRef(true); // skip sound on initial load

  // ── Fetch notifications from backend ───────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!user?.token) return;
    try {
      const res  = await fetch(`${BACKEND}/api/notifications`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (data.success) setNotifications(data.data || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);
  // ── Real-time Socket.IO listener ────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const userId = user.id || user._id;
    const socket = io(BACKEND, {
      transports: ['websocket', 'polling'],
      query: { userId: userId || '', role: user.role || '' }
    });

    const handleNew = (notif) => {
      setNotifications(prev => [notif, ...prev]);

      // Pulse the bell icon
      setPulse(true);
      setTimeout(() => setPulse(false), 1000);

      // Play sound if enabled (skip on first mount)
      if (!isFirst.current && soundOn) playNotificationSound();
      isFirst.current = false;

      // Show toast popup
      toast(`${TYPE_ICON[notif.type] || '🔔'} ${notif.title}\n${notif.message?.slice(0, 70)}`, {
        duration: 6000,
        position: 'top-right',
        style: {
          background: '#0f172a',
          color: '#fff',
          border: '1px solid rgba(34,197,94,0.3)',
          maxWidth: '360px',
          fontSize: '13px',
          lineHeight: '1.5',
        },
      });
    };

    // Admin listens on admin_notification channel
    if (user.role === 'admin') {
      socket.on('admin_notification', handleNew);
    }

    // Every user listens on their personal channel
    if (userId) {
      socket.on(`user_notification_${userId}`, handleNew);
    }

    return () => socket.disconnect();
  }, [user, soundOn]);

  // ── Close dropdown on outside click ───────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // ── Mark single notification read ─────────────────────────────────────────
  const markAsRead = async (notif) => {
    if (notif.is_read) return;
    try {
      await fetch(`${BACKEND}/api/notifications/${notif._id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      setNotifications(prev => prev.map(n =>
        n._id === notif._id ? { ...n, is_read: true } : n
      ));
    } catch { }
  };

  // ── Mark all read ──────────────────────────────────────────────────────────
  const markAllRead = async () => {
    try {
      await fetch(`${BACKEND}/api/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch { }
  };

  const handleClick = async (notif) => {
    await markAsRead(notif);
    setIsOpen(false);
    navigate(user.role === 'admin' ? '/admin/complaints' : '/dashboard/complaints');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 text-gray-400 hover:text-white bg-white/5 rounded-xl hover:bg-white/10 transition-all border border-white/5 ${pulse ? 'animate-bounce' : ''}`}>
        <FiBell size={20} className={unreadCount > 0 ? 'text-primary-400' : ''} />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span key={unreadCount}
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full px-1 border-2 border-gray-900">
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 bg-gray-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">

            {/* Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <FiBell size={14} className="text-primary-400" />
                <h3 className="text-sm font-semibold text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* Sound toggle */}
                <button
                  onClick={() => setSoundOn(s => !s)}
                  title={soundOn ? 'Mute notifications' : 'Unmute notifications'}
                  className="p-1 rounded-lg hover:bg-white/10 transition-all text-gray-500 hover:text-white">
                  {soundOn ? <FiVolume2 size={13} /> : <FiVolumeX size={13} />}
                </button>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
                    <FiCheckCircle size={11} /> Mark all read
                  </button>
                )}
              </div>
            </div>

            {/* Notification list */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="w-5 h-5 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-3xl mb-2 opacity-30">🔔</div>
                  <p className="text-gray-500 text-sm">No notifications yet.</p>
                  <p className="text-gray-600 text-xs mt-1">Notifications appear here automatically on real actions.</p>
                </div>
              ) : (
                notifications.slice(0, 15).map((notif) => (
                  <motion.div
                    key={notif._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => handleClick(notif)}
                    className={`px-4 py-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${!notif.is_read ? 'bg-primary-900/10 border-l-2 border-l-primary-500' : ''}`}>
                    <div className="flex items-start gap-3">
                      <span className="text-lg flex-shrink-0 mt-0.5">
                        {TYPE_ICON[notif.type] || '🔔'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="text-white text-xs font-semibold">{notif.title}</p>
                          {!notif.is_read && (
                            <span className="w-2 h-2 rounded-full bg-primary-400 flex-shrink-0 mt-1 ml-1" />
                          )}
                        </div>
                        <p className="text-gray-400 text-xs mt-0.5 line-clamp-2">{notif.message}</p>
                        <p className="text-gray-600 text-[10px] mt-1">
                          {new Date(notif.created_at).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate(user.role === 'admin' ? '/admin/notifications' : '/dashboard/notifications');
                }}
                className="w-full py-2.5 text-xs text-primary-400 hover:text-primary-300 hover:bg-white/5 transition-all border-t border-white/10 font-medium">
                View all notifications →
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
