import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { io } from 'socket.io-client'

const ComplaintsContext = createContext(null)

export const useComplaints = () => useContext(ComplaintsContext)

const BACKEND = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:5000'
  : '';

// Normalize raw complaint from backend to consistent frontend shape
const normalize = (c) => ({
  ...c,
  id: c.custom_id || c._id,
  type: c.type || c.category || 'Issue',
  location: c.location_str || c.location || '',
  lat: c.location_lat || c.lat || null,
  lng: c.location_lng || c.lng || null,
  district: c.district || '',
  description: c.description || '',
  severity: (c.severity || 'Medium').toLowerCase(),
  status: normalizeStatus(c.status),
  // Image: prefer image_path from backend, then photo, then image
  photo: c.image_path
    ? (c.image_path.startsWith('http') || c.image_path.startsWith('blob:') ? c.image_path : `${BACKEND}${c.image_path}`)
    : c.photo || c.image || null,
  date: c.created_at || c.createdAt
    ? new Date(c.created_at || c.createdAt).toLocaleDateString('en-IN')
    : c.date || '',
  time: c.created_at || c.createdAt
    ? new Date(c.created_at || c.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : c.time || '',
  timestamp: c.created_at || c.createdAt
    ? new Date(c.created_at || c.createdAt).getTime()
    : c.timestamp || Date.now(),
})

function normalizeStatus(s) {
  if (!s) return 'pending'
  const lower = s.toLowerCase().replace(/[\s_-]+/g, '-')
  if (lower === 'completed' || lower === 'resolved') return 'resolved'
  if (lower === 'in-progress' || lower === 'in progress') return 'in-progress'
  return 'pending'
}

export const ComplaintsProvider = ({ children }) => {
  const { user } = useAuth()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    fetchComplaints()
    const userId = user.id || user._id
    const socket = io(BACKEND, {
      transports: ['websocket', 'polling'],
      query: { userId: userId || '', role: user.role || '' }
    })
    socket.on('new_complaint', (c) => setComplaints(prev => [normalize(c), ...prev]))
    socket.on('status_update', (updated) => {
      setComplaints(prev => prev.map(c => (c._id === updated._id ? normalize(updated) : c)))
    })
    return () => socket.disconnect()
  }, [user])

  const fetchComplaints = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${BACKEND}/api/complaints`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      
      const offline = JSON.parse(localStorage.getItem('offline_complaints') || '[]');
      const backendComplaints = (data.complaints || data.data || []).map(normalize);
      
      // Keep offline reports at the top, followed by backend-fetched reports
      setComplaints([...offline.map(normalize), ...backendComplaints]);
    } catch (err) {
      console.warn('⚠️ Complaints fetch failed, loading offline-cached reports:', err.message)
      const offline = JSON.parse(localStorage.getItem('offline_complaints') || '[]');
      setComplaints(offline.map(normalize));
    } finally {
      setLoading(false)
    }
  }

  const addComplaint = async (formData) => {
    try {
      const res = await fetch(`${BACKEND}/api/complaints`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.token}` },
        body: formData
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      const normalized = normalize(data.data || data.complaint)
      setComplaints(prev => [normalized, ...prev])
      return normalized
    } catch (err) {
      console.warn("⚠️ Municipal server offline. Activating LocalStorage Offline Fallback...", err.message)
      
      // Extract fields from formData
      const type = formData.get('type') || 'Other';
      const description = formData.get('description') || '';
      const severity = formData.get('severity') || 'Medium';
      const district = formData.get('district') || 'Bengaluru Urban';
      const location_str = formData.get('location_str') || '';
      const lat = parseFloat(formData.get('location_lat')) || 12.9716;
      const lng = parseFloat(formData.get('location_lng')) || 77.5946;
      
      // Extract image file and map it to a local preview blob
      let photoUrl = null;
      const imageFile = formData.get('image');
      if (imageFile && imageFile instanceof File) {
        photoUrl = URL.createObjectURL(imageFile);
      }

      const tempId = 'CMP-OFFLINE-' + Date.now();
      const mockComplaint = {
        _id: tempId,
        custom_id: tempId,
        type,
        category: type,
        description,
        severity,
        district,
        location_str,
        location: location_str,
        location_lat: lat,
        location_lng: lng,
        lat,
        lng,
        status: 'pending',
        image_path: photoUrl,
        photo: photoUrl,
        created_at: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        isOffline: true
      };

      // Store in localStorage to preserve across page refreshes
      const savedOffline = JSON.parse(localStorage.getItem('offline_complaints') || '[]');
      savedOffline.push(mockComplaint);
      localStorage.setItem('offline_complaints', JSON.stringify(savedOffline));

      const normalized = normalize(mockComplaint);
      setComplaints(prev => [normalized, ...prev]);
      return {
        ...normalized,
        isOffline: true
      };
    }
  }

  const updateStatus = async (id, status, worker) => {
    const res = await fetch(`${BACKEND}/api/complaints/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      },
      body: JSON.stringify({ status, worker })
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.message)
    setComplaints(prev => prev.map(c => (c._id === id ? normalize(data.data) : c)))
  }

  const deleteComplaint = async (id) => {
    const res = await fetch(`${BACKEND}/api/complaints/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${user.token}` }
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.message)
    setComplaints(prev => prev.filter(c => c._id !== id))
  }

  const allComplaints = complaints
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length
  const pendingCount = complaints.filter(c => c.status === 'pending').length
  const inProgressCount = complaints.filter(c => c.status === 'in-progress').length

  return (
    <ComplaintsContext.Provider value={{
      complaints: allComplaints,
      loading,
      addComplaint,
      updateStatus,
      deleteComplaint,
      refetch: fetchComplaints,
      totalCount: complaints.length,
      resolvedCount,
      pendingCount,
      inProgressCount,
    }}>
      {children}
    </ComplaintsContext.Provider>
  )
}
