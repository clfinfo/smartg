import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { FiSearch, FiTrash2, FiEdit, FiX, FiCheck, FiSave, FiEye, FiFilter } from 'react-icons/fi'
import { useComplaints } from '../../context/ComplaintsContext'
import { sendStatusUpdateEmail } from '../../services/emailService'

const STATUS_OPTS = [
  { value: 'Pending', label: '⏳ Pending', cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
  { value: 'In Progress', label: '🔄 In Progress', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  { value: 'Completed', label: '✅ Resolved', cls: 'bg-green-500/10 text-green-400 border-green-500/30' },
]

const getStatusStyle = (status) => {
  const s = (status || '').toLowerCase()
  if (s === 'completed' || s === 'resolved') return 'bg-green-500/15 text-green-400 border border-green-500/30'
  if (s === 'in-progress' || s === 'in progress') return 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
  return 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30'
}

const getStatusLabel = (status) => {
  const s = (status || '').toLowerCase()
  if (s === 'completed' || s === 'resolved') return '✅ Resolved'
  if (s === 'in-progress' || s === 'in progress') return '🔄 In Progress'
  return '⏳ Pending'
}

const filterMatch = (complaint, filter) => {
  if (filter === 'all') return true
  const s = (complaint.status || '').toLowerCase()
  if (filter === 'pending') return s === 'pending'
  if (filter === 'in-progress') return s === 'in-progress' || s === 'in progress'
  if (filter === 'resolved') return s === 'resolved' || s === 'completed'
  return true
}

const SEVERITY_COLORS = {
  low: 'text-green-400',
  medium: 'text-yellow-400',
  high: 'text-red-400',
  critical: 'text-red-500 font-bold',
}

const EmptyAdmin = () => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className="glass p-16 rounded-2xl flex flex-col items-center justify-center text-center">
    <div className="text-6xl mb-4 opacity-40">📋</div>
    <h3 className="text-white font-bold text-xl mb-2">No Complaints Submitted Yet</h3>
    <p className="text-gray-400 text-sm max-w-xs">
      Citizens haven't submitted any reports yet. Complaints will appear here once citizens use the Report Issue feature.
    </p>
  </motion.div>
)

const AdminComplaintsPage = () => {
  const { complaints, updateStatus, deleteComplaint } = useComplaints()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [aiFilter, setAiFilter] = useState('all') // Filters: all, ai_only, manual, or specific issue labels

  // Lightbox modal state for viewing images
  const [lightboxImg, setLightboxImg] = useState(null)

  // Edit modal state
  const [editModal, setEditModal] = useState(null) // holds the complaint being edited
  const [editStatusVal, setEditStatusVal] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filtered = complaints.filter(c => {
    // 1. Status Filter
    if (!filterMatch(c, statusFilter)) return false

    // 2. AI Recognition Filter
    if (aiFilter !== 'all') {
      if (aiFilter === 'ai_only') {
        if (!c.ai_detected_category) return false
      } else if (aiFilter === 'manual') {
        if (c.ai_detected_category) return false
      } else {
        // Specific category filter
        if (c.ai_detected_category !== aiFilter) return false
      }
    }

    // 3. Search query matching
    const searchLower = search.toLowerCase()
    return (
      search === '' ||
      (c.id || '').toLowerCase().includes(searchLower) ||
      (c.type || '').toLowerCase().includes(searchLower) ||
      (c.ai_detected_category || '').toLowerCase().includes(searchLower) ||
      (c.name || (c.user?.name) || '').toLowerCase().includes(searchLower) ||
      (c.district || '').toLowerCase().includes(searchLower) ||
      (c.location || '').toLowerCase().includes(searchLower)
    )
  })

  const isEmpty = complaints.length === 0

  const openEdit = (c) => {
    setEditModal(c)
    // Normalize current status to backend format for the select
    const s = (c.status || '').toLowerCase()
    if (s === 'resolved' || s === 'completed') setEditStatusVal('Completed')
    else if (s === 'in-progress' || s === 'in progress') setEditStatusVal('In Progress')
    else setEditStatusVal('Pending')
    setSaveMsg('')
  }

  const handleSave = async () => {
    if (!editModal) return
    setSaving(true)
    setSaveMsg('')
    try {
      await updateStatus(editModal._id, editStatusVal)
      setSaveMsg('✅ Updated successfully!')

      // Send status update email to the complaint owner
      const userEmail = editModal.user?.email || editModal.email || ''
      const userName  = editModal.user?.name  || editModal.name  || 'Citizen'

      if (userEmail) {
        const emailResult = await sendStatusUpdateEmail({
          userName,
          userEmail,
          complaintId: editModal.id || editModal.custom_id || editModal._id?.slice(-8),
          newStatus:   editStatusVal,
          issueType:   editModal.type,
          dateTime:    new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        })

        if (emailResult.success) {
          toast.success('📧 Status update email sent to citizen!', {
            duration: 4000,
            style: { background: '#1a1a2e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
          })
        }
      }

      setTimeout(() => { setEditModal(null); setSaveMsg('') }, 1000)
    } catch (err) {
      setSaveMsg('❌ Update failed: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteComplaint(id)
      setDeleteTarget(null)
    } catch (err) {
      alert('Delete failed: ' + err.message)
    }
  }

  return (
    <div className="max-w-full space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="section-title">📋 Complaints Management</h2>
          <p className="section-subtitle">
            {isEmpty ? 'No complaints yet' : `${filtered.length} of ${complaints.length} complaints shown`}
          </p>
        </div>
        {/* Live count badges */}
        <div className="flex gap-2 flex-wrap">
          {[
            { label: 'Total', count: complaints.length, cls: 'text-gray-300 bg-white/5' },
            { label: 'Pending', count: complaints.filter(c => filterMatch(c, 'pending')).length, cls: 'text-yellow-400 bg-yellow-500/10' },
            { label: 'In Progress', count: complaints.filter(c => filterMatch(c, 'in-progress')).length, cls: 'text-blue-400 bg-blue-500/10' },
            { label: 'Resolved', count: complaints.filter(c => filterMatch(c, 'resolved')).length, cls: 'text-green-400 bg-green-500/10' },
          ].map(s => (
            <div key={s.label} className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${s.cls}`}>
              {s.count} {s.label}
            </div>
          ))}
        </div>
      </div>

      {isEmpty ? (
        <EmptyAdmin />
      ) : (
        <>
          {/* Filters Panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
            
            {/* Search Input */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
              <input type="text" placeholder="Search by ID, name, type, district..." value={search}
                onChange={e => setSearch(e.target.value)} className="input-field pl-10 py-2 text-sm" />
            </div>
            
            {/* Status Filter */}
            <div className="flex gap-1 bg-white/5 p-1 rounded-xl w-fit">
              {[
                { val: 'all', label: '🌐 All' },
                { val: 'pending', label: '⏳ Pending' },
                { val: 'in-progress', label: '🔄 In Progress' },
                { val: 'resolved', label: '✅ Resolved' },
              ].map(s => (
                <button key={s.val} onClick={() => setStatusFilter(s.val)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === s.val ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                  {s.label}
                </button>
              ))}
            </div>

            {/* AI Image Detection Filter Dropdown */}
            <div className="flex items-center gap-2 md:justify-self-end w-full md:w-auto">
              <span className="text-gray-400 text-xs flex items-center gap-1 shrink-0"><FiFilter size={12}/> AI Filter:</span>
              <select value={aiFilter} onChange={e => setAiFilter(e.target.value)} className="input-field py-1.5 text-xs">
                <option value="all">🌐 Show All Submissions</option>
                <option value="ai_only">🤖 Show AI-Analyzed Only</option>
                <option value="manual">👤 Show Manual Only</option>
                <option value="Garbage Overflow">🗑️ AI: Garbage Overflow</option>
                <option value="Potholes">🛣️ AI: Potholes</option>
                <option value="Water Leakage">🚰 AI: Water Leakage</option>
                <option value="Streetlight Damage">💡 AI: Streetlight Damage</option>
                <option value="Drainage Problem">💧 AI: Drainage Problem</option>
              </select>
            </div>

          </div>

          {/* Table */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="table-head">
                    {['ID', 'Citizen', 'Reported Category', 'AI Classification', 'Photo Attachment', 'Location', 'Severity', 'Status', 'Actions'].map(h => (
                      <th key={h} className="table-cell text-left text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filtered.map((c, i) => (
                      <motion.tr key={c._id || c.id}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.03 }} className="table-row hover:bg-white/3 transition-colors">

                        {/* ID */}
                        <td className="table-cell">
                          <span className="font-mono text-primary-400 text-xs">{c.id || c.custom_id || c._id?.slice(-6)}</span>
                        </td>

                        {/* Citizen */}
                        <td className="table-cell">
                          <p className="text-white text-xs font-medium">{c.user?.name || c.name || 'Citizen'}</p>
                          <p className="text-gray-600 text-xs">{c.date} {c.time}</p>
                        </td>

                        {/* Category */}
                        <td className="table-cell">
                          <p className="text-white text-xs font-medium">{c.type}</p>
                          <p className="text-gray-600 text-[10px] truncate max-w-40" title={c.description}>
                            {c.description?.slice(0, 30)}{c.description?.length > 30 ? '...' : ''}
                          </p>
                        </td>

                        {/* AI Classification */}
                        <td className="table-cell">
                          {c.ai_detected_category ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-emerald-400 font-semibold text-xs flex items-center gap-1">
                                🤖 {c.ai_detected_category}
                              </span>
                              <div className="w-24 bg-white/10 rounded-full h-1.5 overflow-hidden mt-1">
                                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${c.ai_confidence || 0}%` }} />
                              </div>
                              <span className="text-[9px] text-gray-500 font-mono mt-0.5">
                                Confidence: {c.ai_confidence || 0}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-600 text-[11px] italic">👤 Manual Submission</span>
                          )}
                        </td>

                        {/* Photo */}
                        <td className="table-cell">
                          {c.photo ? (
                            <div className="relative group w-14 h-10 rounded-lg overflow-hidden border border-white/10 cursor-pointer"
                              onClick={() => setLightboxImg(c.photo)}>
                              <img
                                src={c.photo}
                                alt={c.type}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                onError={e => {
                                  e.target.onerror = null;
                                  e.target.style.display = 'none';
                                  const fallback = e.target.parentNode.querySelector('.img-fallback');
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                                <FiEye size={12} className="text-white" />
                              </div>
                              <div className="img-fallback w-full h-full bg-white/5 items-center justify-center text-[10px] text-gray-600 rounded-lg absolute inset-0" style={{display:'none'}}>No Photo</div>
                            </div>
                          ) : (
                            <div className="w-14 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-gray-600">No Photo</div>
                          )}
                        </td>

                        {/* Location */}
                        <td className="table-cell">
                          <p className="text-gray-300 text-xs truncate max-w-32" title={c.location}>{c.location || '—'}</p>
                          <p className="text-gray-600 text-xs">{c.district || '—'}</p>
                        </td>

                        {/* Severity */}
                        <td className="table-cell">
                          <span className={`text-xs font-bold uppercase ${SEVERITY_COLORS[c.severity] || 'text-gray-400'}`}>
                            {c.severity || 'medium'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="table-cell">
                          <motion.span key={c.status}
                            initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${getStatusStyle(c.status)}`}>
                            {getStatusLabel(c.status)}
                          </motion.span>
                        </td>

                        {/* Actions */}
                        <td className="table-cell">
                          <div className="flex items-center gap-1.5">
                            {/* Edit/Assign button */}
                            <button onClick={() => openEdit(c)} title="Edit Status & Assign Worker"
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/25 text-blue-400 border border-blue-500/20 transition-all text-xs font-medium">
                              <FiEdit size={11} /> Edit
                            </button>
                            {/* Delete button */}
                            <button onClick={() => setDeleteTarget(c)} title="Delete"
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all">
                              <FiTrash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {filtered.length === 0 && complaints.length > 0 && (
                    <tr>
                      <td colSpan={10} className="py-10 text-center text-gray-600">No complaints match your filters</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ─── Edit Modal ──────────────────────────────────────────── */}
      <AnimatePresence>
        {editModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setEditModal(null)} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="glass p-6 rounded-2xl w-full max-w-lg border border-primary-500/20 shadow-2xl">
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className="text-white font-bold text-lg">Edit Complaint</h3>
                    <p className="text-gray-400 text-sm mt-0.5">
                      <span className="text-primary-400 font-mono">{editModal.id || editModal._id?.slice(-8)}</span> — {editModal.type}
                    </p>
                  </div>
                  <button onClick={() => setEditModal(null)} className="p-2 rounded-xl hover:bg-white/10 text-gray-500 hover:text-white transition-all">
                    <FiX size={18} />
                  </button>
                </div>

                {/* Current Status Display */}
                <div className="flex flex-col gap-2 p-3 rounded-xl bg-white/5 mb-5">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-xs">Current Status:</span>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${getStatusStyle(editModal.status)}`}>
                      {getStatusLabel(editModal.status)}
                    </span>
                  </div>
                  {editModal.ai_detected_category && (
                    <div className="text-[11px] text-emerald-400 border-t border-white/5 pt-2 flex items-center gap-1">
                      🤖 OpenCV AI Detection: <b>{editModal.ai_detected_category}</b> with <b>{editModal.ai_confidence}%</b> confidence.
                    </div>
                  )}
                </div>

                {/* Change Status */}
                <div className="mb-5">
                  <label className="block text-gray-400 text-sm font-medium mb-2">Update Status</label>
                  <div className="grid grid-cols-3 gap-2">
                    {STATUS_OPTS.map(opt => (
                      <button key={opt.value} onClick={() => setEditStatusVal(opt.value)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${editStatusVal === opt.value
                          ? opt.cls + ' ring-2 ring-offset-1 ring-offset-transparent ring-current'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Save feedback */}
                {saveMsg && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className={`text-sm mb-3 text-center ${saveMsg.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>
                    {saveMsg}
                  </motion.p>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button onClick={() => setEditModal(null)} className="btn-secondary flex-1">Cancel</button>
                  <button onClick={handleSave} disabled={saving}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60">
                    {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSave size={14} />}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Delete Confirm Modal ─────────────────────────────────── */}
      <AnimatePresence>
        {deleteTarget && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteTarget(null)} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="glass p-6 rounded-2xl w-full max-w-sm border border-red-500/20">
                <div className="text-center mb-5">
                  <div className="text-4xl mb-3">🗑️</div>
                  <h3 className="text-white font-bold text-lg">Delete Complaint</h3>
                  <p className="text-gray-400 text-sm mt-2">
                    Are you sure you want to delete <span className="text-red-400 font-mono">{deleteTarget.id}</span>? This cannot be undone.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteTarget(null)} className="btn-secondary flex-1">Cancel</button>
                  <button onClick={() => handleDelete(deleteTarget._id)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all text-sm font-semibold">
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Lightbox Modal ───────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxImg && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setLightboxImg(null)} className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100]" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-[101] flex items-center justify-center p-4" onClick={() => setLightboxImg(null)}>
              <div className="relative max-w-4xl max-h-[85vh] bg-black/50 border border-white/10 rounded-2xl overflow-hidden p-2"
                onClick={e => e.stopPropagation()}>
                <img
                  src={lightboxImg}
                  alt="Complaint Attachment"
                  className="max-w-full max-h-[80vh] object-contain rounded-xl"
                  onError={e => { e.target.onerror = null; e.target.style.display = 'none'; e.target.parentNode.innerHTML += '<p style="color:#9ca3af;padding:2rem;text-align:center">Image could not be loaded.<br/>The file may have been removed from the server.</p>' }}
                />
                <button onClick={() => setLightboxImg(null)} className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-all font-bold">
                  <FiX size={16} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminComplaintsPage
