/**
 * useRealtime — simulates Socket.io real-time events in the browser.
 * Emits:
 *  - 'new_complaint'   → a new complaint arrived from a citizen
 *  - 'status_update'   → an existing complaint changed status
 *  - 'new_notification'→ a notification pushed to the user
 *  - 'stats_update'    → global counter tick (total complaints, resolved, etc.)
 *  - 'worker_update'   → a worker's task count changed
 *
 * In a real backend you would replace the setInterval logic with:
 *   const socket = io('http://localhost:5000')
 *   socket.on('new_complaint', handler)
 */
import { useEffect } from 'react'
import { io } from 'socket.io-client'

// Connect to the proxy URL which Vite forwards to http://localhost:5000
const socket = io('/', {
  path: '/socket.io',
  autoConnect: true
});

// Hooks
export const useRealtimeComplaints = (onNew) => {
  useEffect(() => {
    socket.on('new_complaint', onNew)
    return () => socket.off('new_complaint', onNew)
  }, [onNew])
}

export const useRealtimeStats = (onUpdate) => {
  useEffect(() => {
    socket.on('stats_update', onUpdate)
    return () => socket.off('stats_update', onUpdate)
  }, [onUpdate])
}

export const useRealtimeNotifications = (onNew) => {
  useEffect(() => {
    socket.on('new_notification', onNew)
    return () => socket.off('new_notification', onNew)
  }, [onNew])
}

export const useRealtimeWorkers = (onUpdate) => {
  useEffect(() => {
    socket.on('worker_update', onUpdate)
    return () => socket.off('worker_update', onUpdate)
  }, [onUpdate])
}

export const useRealtimeStatusUpdates = (onUpdate) => {
  useEffect(() => {
    socket.on('status_update', onUpdate)
    return () => socket.off('status_update', onUpdate)
  }, [onUpdate])
}
