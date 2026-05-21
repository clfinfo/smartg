import { Routes, Route, Navigate } from 'react-router-dom'
import ChatBot from './components/ui/ChatBot'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ComplaintsProvider } from './context/ComplaintsContext'
import { Toaster } from 'react-hot-toast'

// Auth Pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'

// Citizen Layout & Pages
import CitizenLayout from './layouts/CitizenLayout'
import HomePage from './pages/citizen/HomePage'
import ReportIssuePage from './pages/citizen/ReportIssuePage'
import LiveMapPage from './pages/citizen/LiveMapPage'
import MyComplaintsPage from './pages/citizen/MyComplaintsPage'
import RewardsPage from './pages/citizen/RewardsPage'
import NotificationsPage from './pages/citizen/NotificationsPage'
import ProfilePage from './pages/citizen/ProfilePage'

// Admin Layout & Pages
import AdminLayout from './layouts/AdminLayout'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminComplaintsPage from './pages/admin/AdminComplaintsPage'
import WorkerAssignmentPage from './pages/admin/WorkerAssignmentPage'
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
  }
  return children
}

const PublicRoute = ({ children }) => {
  const { user } = useAuth()
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
  return children
}

const AppRoutes = () => (
  <>
  <ChatBot />
  <Routes>
    {/* Public auth routes */}
    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
    <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

    {/* Citizen routes */}
    <Route path="/dashboard" element={<ProtectedRoute requiredRole="citizen"><CitizenLayout /></ProtectedRoute>}>
      <Route index element={<HomePage />} />
      <Route path="report" element={<ReportIssuePage />} />
      <Route path="map" element={<LiveMapPage />} />
      <Route path="complaints" element={<MyComplaintsPage />} />
      <Route path="rewards" element={<RewardsPage />} />
      <Route path="notifications" element={<NotificationsPage />} />
      <Route path="profile" element={<ProfilePage />} />
    </Route>

    {/* Admin routes */}
    <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>}>
      <Route index element={<AdminDashboardPage />} />
      <Route path="complaints" element={<AdminComplaintsPage />} />
      <Route path="workers" element={<WorkerAssignmentPage />} />
      <Route path="notifications" element={<AdminNotificationsPage />} />
      <Route path="settings" element={<AdminSettingsPage />} />
    </Route>

    {/* Redirect root */}
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
  <Toaster position="top-right" />
  </>
)

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <ComplaintsProvider>
        <AppRoutes />
      </ComplaintsProvider>
    </AuthProvider>
  </ThemeProvider>
)

export default App
