// Complaints start empty — populated only when a real user submits via Report Issue
export const COMPLAINTS = []

export const WORKERS = [
  { id: 'W-001', name: 'Ramesh Hegde', team: 'Team Alpha', role: 'Field Supervisor', status: 'active', tasks: 3, location: 'MG Road Area', efficiency: 92, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ramesh' },
  { id: 'W-002', name: 'Gopal Nayak', team: 'Team Beta', role: 'Sanitation Worker', status: 'active', tasks: 2, location: 'Jayanagar', efficiency: 87, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gopal' },
  { id: 'W-003', name: 'Shiva Kumar', team: 'Team Gamma', role: 'Plumber', status: 'busy', tasks: 1, location: 'Indiranagar', efficiency: 95, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Shiva' },
  { id: 'W-004', name: 'Anand Patil', team: 'Team Delta', role: 'Electrician', status: 'active', tasks: 4, location: 'Koramangala', efficiency: 89, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anand' },
  { id: 'W-005', name: 'Sunil Gowda', team: 'Team Epsilon', role: 'Road Engineer', status: 'inactive', tasks: 0, location: 'HQ', efficiency: 78, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sunil' },
  { id: 'W-006', name: 'Manjunath K', team: 'Team Zeta', role: 'Supervisor', status: 'active', tasks: 2, location: 'Whitefield', efficiency: 91, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Manjunath' },
]

export const LEADERBOARD = [
  { rank: 1, name: 'Priya Nair', district: 'Bengaluru Urban', reports: 48, points: 4800, badge: '🏆' },
  { rank: 2, name: 'Suresh Kumar', district: 'Mysuru', reports: 39, points: 3900, badge: '🥈' },
  { rank: 3, name: 'Anitha Reddy', district: 'Mangaluru', reports: 35, points: 3500, badge: '🥉' },
  { rank: 4, name: 'Rahul Sharma', district: 'Bengaluru Urban', reports: 25, points: 1250, badge: '⭐' },
  { rank: 5, name: 'Kavya Gowda', district: 'Belagavi', reports: 22, points: 2200, badge: '⭐' },
  { rank: 6, name: 'Vinod Patel', district: 'Hubballi', reports: 19, points: 1900, badge: '⭐' },
]

export const NOTIFICATIONS = [
  { id: 1, type: 'status', icon: '✅', title: 'Complaint Resolved', message: 'Your garbage complaint CMP-006 has been resolved by Team Delta.', time: '2 hours ago', read: false },
  { id: 2, type: 'reward', icon: '🏆', title: 'Points Earned!', message: 'You earned 50 points for reporting drainage issue CMP-003.', time: '5 hours ago', read: false },
  { id: 3, type: 'alert', icon: '⚠️', title: 'Unsafe Area Alert', message: 'High complaint density detected near Koramangala. Exercise caution.', time: '1 day ago', read: true },
  { id: 4, type: 'update', icon: '🔄', title: 'Status Update', message: 'Pothole complaint CMP-002 is now In Progress. Worker assigned: Team Alpha.', time: '1 day ago', read: true },
  { id: 5, type: 'reward', icon: '🥈', title: 'Rank Upgraded!', message: 'Congratulations! You\'ve been upgraded to Silver Citizen rank.', time: '3 days ago', read: true },
  { id: 6, type: 'system', icon: '📢', title: 'System Update', message: 'New AI detection model deployed. 30% better accuracy in garbage detection.', time: '1 week ago', read: true },
]

export const BADGES = [
  { id: 1, name: 'First Reporter', icon: '🌟', desc: 'Submitted your first complaint', earned: true, color: 'from-yellow-500 to-amber-400' },
  { id: 2, name: 'Eco Warrior', icon: '🌿', desc: '10+ garbage complaints', earned: true, color: 'from-green-500 to-emerald-400' },
  { id: 3, name: 'Road Guardian', icon: '🛣️', desc: '5+ pothole reports', earned: true, color: 'from-blue-500 to-cyan-400' },
  { id: 4, name: 'Silver Citizen', icon: '🥈', desc: 'Reached 1000 points', earned: true, color: 'from-gray-400 to-slate-300' },
  { id: 5, name: 'Gold Citizen', icon: '🏆', desc: 'Reach 5000 points', earned: false, color: 'from-yellow-600 to-yellow-400' },
  { id: 6, name: 'City Hero', icon: '🦸', desc: '50+ resolved complaints', earned: false, color: 'from-purple-500 to-violet-400' },
  { id: 7, name: 'District Champion', icon: '🏙️', desc: 'Top reporter in district', earned: false, color: 'from-red-500 to-orange-400' },
  { id: 8, name: 'AI Contributor', icon: '🤖', desc: '25+ AI-verified reports', earned: false, color: 'from-indigo-500 to-blue-400' },
]

export const AI_DETECTIONS = [
  { label: 'Garbage Overflow', confidence: 94, color: 'bg-green-500' },
  { label: 'Potholes', confidence: 87, color: 'bg-red-500' },
  { label: 'Water Leakage', confidence: 91, color: 'bg-cyan-500' },
  { label: 'Streetlight Damage', confidence: 78, color: 'bg-yellow-500' },
  { label: 'Drainage Problem', confidence: 88, color: 'bg-blue-500' }
]

export const CATEGORIES = [
  { value: 'Garbage Overflow', label: 'Garbage Overflow', icon: '🗑️', color: 'text-green-400' },
  { value: 'Potholes', label: 'Potholes', icon: '🛣️', color: 'text-red-400' },
  { value: 'Water Leakage', label: 'Water Leakage', icon: '🚰', color: 'text-cyan-400' },
  { value: 'Streetlight Damage', label: 'Streetlight Damage', icon: '💡', color: 'text-yellow-400' },
  { value: 'Drainage Problem', label: 'Drainage Problem', icon: '💧', color: 'text-blue-400' }
]

export const DISTRICTS = [
  'Bengaluru Urban', 'Bengaluru Rural', 'Ramanagara', 'Kolar', 'Chikkaballapura',
  'Tumakuru', 'Mysuru', 'Chamarajanagara', 'Mandya', 'Hassan',
  'Kodagu', 'Dakshina Kannada', 'Udupi', 'Shivamogga', 'Chikkamagaluru',
  'Davanagere', 'Chitradurga', 'Belagavi', 'Dharwad', 'Gadag',
  'Hubballi-Dharwad', 'Haveri', 'Uttara Kannada', 'Bagalkote', 'Vijayapura',
  'Kalaburagi', 'Yadgir', 'Raichur', 'Koppal', 'Ballari', 'Bidar',
  'Mangaluru',
]
