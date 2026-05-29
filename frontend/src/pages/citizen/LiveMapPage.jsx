import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, StandaloneSearchBox } from '@react-google-maps/api'
import { FiFilter, FiSearch, FiZap, FiMapPin, FiLayers, FiWifi, FiRefreshCw, FiX } from 'react-icons/fi'
import { useComplaints } from '../../context/ComplaintsContext'
import { getBackendUrl } from '../../config/backend'
import axios from 'axios'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const LIBRARIES = ['places']

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: '🗑️ Garbage', value: 'Garbage' },
  { label: '🛣️ Pothole', value: 'Pothole' },
  { label: '💧 Drainage', value: 'Drainage' },
  { label: '💡 Streetlight', value: 'Streetlight' },
  { label: '💦 Water', value: 'Water' },
]

const MARKER_COLORS = {
  Garbage: '#22c55e',
  Pothole: '#ef4444',
  Drainage: '#3b82f6',
  Streetlight: '#eab308',
  Water: '#06b6d4',
  Other: '#a855f7',
}

const STATUS_COLORS = {
  pending: '#ef4444', // Red
  'in progress': '#eab308', // Yellow
  'in-progress': '#eab308', // Yellow
  completed: '#22c55e', // Green
  resolved: '#22c55e' // Green
}

const DEFAULT_CENTER = { lat: 12.9716, lng: 77.5946 }

const MAP_STYLES_DARK = [
  { elementType: 'geometry', stylers: [{ color: '#212121' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#303030' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#181818' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
]

const getMarkerIcon = (type, status = 'pending', isNew = false) => {
  const normalizedStatus = (status || 'pending').toLowerCase();
  const color = STATUS_COLORS[normalizedStatus] || STATUS_COLORS.pending;
  const size = isNew ? 48 : 36
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 48 48">
      <circle cx="24" cy="18" r="14" fill="${color}" opacity="0.2"/>
      <circle cx="24" cy="18" r="10" fill="${color}" stroke="white" stroke-width="2"/>
      <polygon points="24,40 18,26 30,26" fill="${color}" stroke="white" stroke-width="1.5"/>
      ${isNew ? `<circle cx="24" cy="18" r="16" fill="${color}" opacity="0.3"><animate attributeName="r" values="10;20;10" dur="1.5s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.3;0;0.3" dur="1.5s" repeatCount="indefinite"/></circle>` : ''}
    </svg>
  `
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: { width: size, height: size },
    anchor: { x: size / 2, y: size },
  }
}

const LiveMapPage = () => {
  const { complaints: contextComplaints } = useComplaints()
  const [activeFilter, setActiveFilter] = useState('all')
  const [allComplaints, setAllComplaints] = useState([...contextComplaints])
  const [search, setSearch] = useState('')
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [selectedMarker, setSelectedMarker] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER)
  const [mapZoom, setMapZoom] = useState(11)
  const [locating, setLocating] = useState(false)
  const [flash, setFlash] = useState(false)
  const [liveCount, setLiveCount] = useState(contextComplaints.length)
  const searchBoxRef = useRef(null)
  const mapRef = useRef(null)

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  })

  // Fetch reports from backend
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const BACKEND_API = getBackendUrl();
        const res = await axios.get(`${BACKEND_API}/api/complaints`)
        if (res.data?.complaints?.length) {
          const merged = [...res.data.complaints, ...contextComplaints]
          const unique = Array.from(new Map(merged.map(c => [c._id || c.id, c])).values())
          setAllComplaints(unique)
          setLiveCount(unique.length)
        }
      } catch {
        // Backend not available — use local context data
      }
    }
    fetchReports()
  }, [contextComplaints])

  // Get user geolocation
  const handleLocateMe = () => {
    setLocating(true)
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserLocation(loc)
        setMapCenter(loc)
        setMapZoom(14)
        setLocating(false)
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  // Search box handler
  const onPlacesChanged = () => {
    const places = searchBoxRef.current?.getPlaces()
    if (places?.length > 0) {
      const loc = places[0].geometry?.location
      if (loc) {
        setMapCenter({ lat: loc.lat(), lng: loc.lng() })
        setMapZoom(14)
      }
    }
  }

  // Filter complaints
  const filtered = allComplaints.filter(c =>
    (activeFilter === 'all' || (c.type || c.category || '').includes(activeFilter)) &&
    (search === '' ||
      (c.location || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.district || '').toLowerCase().includes(search.toLowerCase()))
  )

  const validMarkers = filtered.filter(c =>
    c.lat && c.lng && !isNaN(Number(c.lat)) && !isNaN(Number(c.lng))
  )

  const onMapLoad = useCallback((map) => {
    mapRef.current = map
  }, [])

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="text-red-400 text-5xl">🗺️</div>
        <p className="text-red-400 font-semibold">Failed to load Google Maps</p>
        <p className="text-gray-500 text-sm">Check your API key or internet connection.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 max-w-full" style={{ height: 'calc(100vh - 120px)' }}>

      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
        <div>
          <h2 className="section-title">🗺️ Live Complaints Map</h2>
          <p className="text-gray-500 text-xs">Real-time issue tracking across Karnataka</p>
        </div>
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          <motion.div key={liveCount} animate={{ scale: flash ? 1.1 : 1 }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs border transition-colors ${flash ? 'bg-primary-600/30 border-primary-400 text-primary-300' : 'bg-primary-900/40 border-primary-500/30 text-primary-400'}`}>
            <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
            <FiWifi size={11} /> {liveCount} Live Reports
          </motion.div>
          <button onClick={() => setDarkMode(d => !d)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${darkMode ? 'bg-gray-800 border-gray-600 text-gray-300' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'}`}>
            {darkMode ? '🌙 Dark' : '☀️ Light'}
          </button>
          <button onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${showHeatmap ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}>
            <FiLayers size={12} /> Heatmap
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">

        {/* Map Container */}
        <div className="flex-1 glass rounded-2xl overflow-hidden relative flex flex-col">

          {/* Filter + Search bar */}
          <div className="flex items-center gap-2 p-3 border-b border-white/10 flex-wrap">
            <FiFilter size={14} className="text-gray-500 flex-shrink-0" />
            {FILTERS.map(f => (
              <button key={f.value} onClick={() => setActiveFilter(f.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${activeFilter === f.value ? 'bg-primary-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}>
                {f.label}
              </button>
            ))}

            {/* Locate Me */}
            <button onClick={handleLocateMe} disabled={locating}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30 transition-all text-xs font-medium ml-auto">
              {locating
                ? <FiRefreshCw size={12} className="animate-spin" />
                : <FiMapPin size={12} />}
              {locating ? 'Locating...' : 'Locate Me'}
            </button>

            {/* Zoom controls */}
            <div className="flex gap-1">
              <button onClick={() => setMapZoom(z => Math.min(z + 1, 20))}
                className="w-7 h-7 rounded-lg bg-white/10 border border-white/10 text-white text-sm hover:bg-white/20 transition-all flex items-center justify-center font-bold">+</button>
              <button onClick={() => setMapZoom(z => Math.max(z - 1, 4))}
                className="w-7 h-7 rounded-lg bg-white/10 border border-white/10 text-white text-sm hover:bg-white/20 transition-all flex items-center justify-center font-bold">−</button>
            </div>
          </div>

          {/* Google Map */}
          <div className="flex-1 relative">
            {!isLoaded ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-400 text-sm">Loading Google Maps...</p>
              </div>
            ) : (
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={mapCenter}
                zoom={mapZoom}
                onLoad={onMapLoad}
                options={{
                  styles: darkMode ? MAP_STYLES_DARK : [],
                  disableDefaultUI: true,
                  zoomControl: false,
                  streetViewControl: false,
                  fullscreenControl: true,
                  mapTypeControl: false,
                  gestureHandling: 'greedy',
                }}
              >
                {/* Search Box */}
                <StandaloneSearchBox
                  onLoad={ref => (searchBoxRef.current = ref)}
                  onPlacesChanged={onPlacesChanged}
                >
                  <input
                    type="text"
                    placeholder="🔍 Search places..."
                    style={{
                      position: 'absolute',
                      top: 12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '300px',
                      padding: '10px 16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.15)',
                      background: darkMode ? 'rgba(15,15,20,0.9)' : 'rgba(255,255,255,0.95)',
                      color: darkMode ? '#fff' : '#111',
                      fontSize: '13px',
                      outline: 'none',
                      backdropFilter: 'blur(12px)',
                      zIndex: 10,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                    }}
                  />
                </StandaloneSearchBox>

                {/* User location marker */}
                {userLocation && (
                  <Marker
                    position={userLocation}
                    icon={{
                      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                          <circle cx="16" cy="16" r="14" fill="#4f46e5" opacity="0.3"/>
                          <circle cx="16" cy="16" r="8" fill="#4f46e5" stroke="white" stroke-width="2"/>
                          <circle cx="16" cy="16" r="4" fill="white"/>
                        </svg>
                      `)}`,
                      scaledSize: { width: 32, height: 32 },
                    }}
                    title="Your Location"
                  />
                )}

                {/* Complaint markers */}
                {validMarkers.map((c, i) => {
                  const type = c.type || c.category || 'Other'
                  const isNew = c.timestamp && Date.now() - Number(c.timestamp) < 30000
                  return (
                    <Marker
                      key={c._id || c.id || i}
                      position={{ lat: Number(c.lat), lng: Number(c.lng) }}
                      icon={getMarkerIcon(type, c.status, isNew)}
                      onClick={() => setSelectedMarker(c)}
                      title={c.type || c.category}
                    />
                  )
                })}

                {/* Info Window */}
                {selectedMarker && (
                  <InfoWindow
                    position={{ lat: Number(selectedMarker.lat), lng: Number(selectedMarker.lng) }}
                    onCloseClick={() => setSelectedMarker(null)}
                  >
                    <div style={{
                      background: '#0f0f14',
                      borderRadius: '12px',
                      padding: '14px',
                      minWidth: '220px',
                      color: '#fff',
                      fontFamily: 'Inter, sans-serif',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                        <span style={{
                          fontSize: 11,
                          padding: '2px 8px',
                          borderRadius: 6,
                          background: MARKER_COLORS[selectedMarker.type || selectedMarker.category] || '#a855f7',
                          color: '#fff',
                          fontWeight: 700,
                        }}>
                          {selectedMarker.type || selectedMarker.category || 'Issue'}
                        </span>
                        <span style={{
                          fontSize: 10,
                          padding: '2px 8px',
                          borderRadius: 6,
                          background: selectedMarker.status === 'resolved' ? '#16a34a22' : '#dc262622',
                          color: selectedMarker.status === 'resolved' ? '#4ade80' : '#f87171',
                        }}>
                          {selectedMarker.status || 'pending'}
                        </span>
                      </div>
                      <h4 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 4px 0', color: '#fff' }}>
                        {selectedMarker.title || selectedMarker.type || 'Report'}
                      </h4>
                      <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 8px 0', lineHeight: 1.5 }}>
                        {selectedMarker.description || 'No description provided.'}
                      </p>
                      <div style={{ fontSize: 11, color: '#6b7280', borderTop: '1px solid #ffffff15', paddingTop: 8 }}>
                        <div>📍 {selectedMarker.location || selectedMarker.district || 'Unknown location'}</div>
                        <div style={{ marginTop: 2 }}>🕐 {selectedMarker.date || selectedMarker.createdAt
                          ? new Date(selectedMarker.date || selectedMarker.createdAt).toLocaleString()
                          : 'Unknown time'}</div>
                      </div>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            )}

            {/* Legend */}
            <div className="absolute bottom-4 left-4 glass p-3 rounded-xl text-xs space-y-1.5 pointer-events-none" style={{ zIndex: 5 }}>
              {Object.entries({ 'Pending': '#ef4444', 'In Progress': '#eab308', 'Resolved': '#22c55e' }).map(([key, color]) => (
                <div key={key} className="flex items-center gap-2">
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, boxShadow: `0 0 4px ${color}` }} />
                  <span className="text-gray-300">{key}</span>
                </div>
              ))}
            </div>

            {/* Heatmap overlay */}
            {showHeatmap && (
              <div className="absolute inset-0 pointer-events-none" style={{
                background: 'radial-gradient(ellipse at 35% 65%, rgba(239,68,68,0.25) 0%, transparent 40%), radial-gradient(ellipse at 60% 40%, rgba(234,179,8,0.2) 0%, transparent 35%), radial-gradient(ellipse at 50% 55%, rgba(34,197,94,0.2) 0%, transparent 30%)',
                zIndex: 5,
              }} />
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:w-80 flex flex-col gap-3 overflow-hidden">

          {/* Live Activity Feed */}
          <div className="glass p-4 rounded-2xl flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <FiZap className="text-yellow-400" size={16} />
              <h3 className="text-white font-semibold text-sm">Live Activity Feed</h3>
              <span className="ml-auto w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
            </div>
            <div className="space-y-2 overflow-y-auto flex-1 pr-1">
              <AnimatePresence initial={false}>
                {allComplaints.slice(0, 12).map((c, i) => {
                  const color = MARKER_COLORS[c.type || c.category] || MARKER_COLORS.Other
                  const isNew = c.timestamp && Date.now() - Number(c.timestamp) < 20000
                  return (
                    <motion.div key={c._id || c.id || i}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, delay: i * 0.03 }}
                      onClick={() => {
                        if (c.lat && c.lng) {
                          setMapCenter({ lat: Number(c.lat), lng: Number(c.lng) })
                          setMapZoom(15)
                          setSelectedMarker(c)
                        }
                      }}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:border-primary-500/40 ${isNew ? 'border-primary-500/30 bg-primary-900/20' : 'border-white/5 bg-white/3'}`}>
                      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium truncate">{c.type || c.category || 'Issue'}</p>
                        <p className="text-gray-500 text-xs truncate">{c.location || c.district || 'Unknown'}</p>
                        {isNew
                          ? <p className="text-primary-400 text-xs font-semibold">Just now ✨</p>
                          : <p className="text-gray-600 text-xs">{c.date || (c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '')}</p>
                        }
                      </div>
                      <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full ${c.status === 'resolved' ? 'bg-green-500/20 text-green-400' : c.status === 'in-progress' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                        {c.status === 'in-progress' ? '●' : c.status === 'resolved' ? '✓' : '○'}
                      </span>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Live Stats */}
          <div className="glass p-4 rounded-2xl">
            <h3 className="text-white font-semibold text-sm mb-3">📊 Live Stats</h3>
            <div className="space-y-2">
              {Object.entries(MARKER_COLORS).map(([type, color]) => {
                const count = allComplaints.filter(c => (c.type || c.category || '').includes(type)).length
                const pct = allComplaints.length ? Math.round((count / allComplaints.length) * 100) : 0
                return (
                  <div key={type}>
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
                      <span className="text-gray-400 text-xs flex-1">{type}</span>
                      <motion.span key={count} initial={{ scale: 1.3, color: '#22c55e' }} animate={{ scale: 1, color: '#ffffff' }}
                        className="text-white text-xs font-bold">{count}</motion.span>
                    </div>
                    <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        style={{ height: '100%', background: color, borderRadius: 4 }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-3 pt-3 border-t border-white/10 flex justify-between text-xs">
              <span className="text-gray-500">Total Reports</span>
              <span className="text-white font-bold">{allComplaints.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LiveMapPage
