import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// User Pages
import LandingPage from './pages/LandingPage';
import UserLogin from './pages/auth/UserLogin';
import UserRegister from './pages/auth/UserRegister';
import UserDashboard from './pages/user/Dashboard';
import RequestDocument from './pages/user/RequestDocument';
import MyRequests from './pages/user/MyRequests';
import TrackRequest from './pages/user/TrackRequest';
import ReportIncident from './pages/user/ReportIncident';
import MyReports from './pages/user/MyReports';

// Admin Pages
import AdminLogin from './pages/auth/AdminLogin';
import AdminDashboard from './pages/admin/Dashboard';
import AdminDocuments from './pages/admin/Documents';
import AdminIncidents from './pages/admin/Incidents';
import AdminResidents from './pages/admin/Residents';
import AdminAnnouncements from './pages/admin/Announcements';
import AdminReports from './pages/admin/Reports';

function ProtectedUser({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function ProtectedAdmin({ children }) {
  const { admin } = useAuth();
  return admin ? children : <Navigate to="/admin/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<UserLogin />} />
          <Route path="/register" element={<UserRegister />} />
          <Route path="/track" element={<TrackRequest />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* User Protected */}
          <Route path="/dashboard" element={<ProtectedUser><UserDashboard /></ProtectedUser>} />
          <Route path="/request-document" element={<ProtectedUser><RequestDocument /></ProtectedUser>} />
          <Route path="/my-requests" element={<ProtectedUser><MyRequests /></ProtectedUser>} />
          <Route path="/report-incident" element={<ProtectedUser><ReportIncident /></ProtectedUser>} />
          <Route path="/my-reports" element={<ProtectedUser><MyReports /></ProtectedUser>} />

          {/* Admin Protected */}
          <Route path="/admin/dashboard" element={<ProtectedAdmin><AdminDashboard /></ProtectedAdmin>} />
          <Route path="/admin/documents" element={<ProtectedAdmin><AdminDocuments /></ProtectedAdmin>} />
          <Route path="/admin/incidents" element={<ProtectedAdmin><AdminIncidents /></ProtectedAdmin>} />
          <Route path="/admin/residents" element={<ProtectedAdmin><AdminResidents /></ProtectedAdmin>} />
          <Route path="/admin/announcements" element={<ProtectedAdmin><AdminAnnouncements /></ProtectedAdmin>} />
          <Route path="/admin/reports" element={<ProtectedAdmin><AdminReports /></ProtectedAdmin>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}