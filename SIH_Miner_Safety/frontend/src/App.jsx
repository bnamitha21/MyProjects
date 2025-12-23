import { Routes, Route } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

// Layout Components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/routing/ProtectedRoute';

// Public Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Home from './pages/Home';

// Protected Pages
import Dashboard from './pages/dashboard/Dashboard';
import WorkerDashboard from './pages/dashboard/WorkerDashboard';
import SupervisorDashboard from './pages/dashboard/SupervisorDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import HazardReporting from './pages/hazards/HazardReporting';
import VideoLibrary from './pages/videos/VideoLibrary';
import DailyChecklist from './pages/checklist/DailyChecklist';
import IncidentLibrary from './pages/incidents/IncidentLibrary';
import ReportIncident from './pages/incidents/ReportIncident';
import IncidentDetail from './pages/incidents/IncidentDetail';
import GasDetectionDashboard from './pages/safety/GasDetectionDashboard';
import MineVisualization from './pages/mine/MineVisualization';
import Profile from './pages/profile/Profile';
import CaseStudies from './pages/cases/CaseStudies';
import CaseStudyDetail from './pages/cases/CaseStudyDetail';

// Admin Pages
import UserManagement from './pages/admin/UserManagement';
import Reports from './pages/admin/Reports';
import AuditLogs from './pages/admin/AuditLogs';
import SOSAlertsManagement from './pages/admin/SOSAlertsManagement';

function App() {
  const { isAuthenticated, user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/worker-dashboard" element={<WorkerDashboard />} />
          <Route path="/supervisor-dashboard" element={<SupervisorDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/hazard-reporting" element={<HazardReporting />} />
          <Route path="/video-library" element={<VideoLibrary />} />
          <Route path="/daily-checklist" element={<DailyChecklist />} />
          <Route path="/incident-library" element={<IncidentLibrary />} />
          <Route path="/report-incident" element={<ReportIncident />} />
          <Route path="/incident/:id" element={<IncidentDetail />} />
          <Route path="/case-studies" element={<CaseStudies />} />
          <Route path="/case-studies/:id" element={<CaseStudyDetail />} />
          <Route path="/gas-detection" element={<GasDetectionDashboard />} />
          <Route path="/mine-visualization" element={<MineVisualization />} />
          <Route path="/profile" element={<Profile />} />

          {/* Admin Routes */}
          <Route path="/admin/user-management" element={<UserManagement />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/sos-alerts" element={<SOSAlertsManagement />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
