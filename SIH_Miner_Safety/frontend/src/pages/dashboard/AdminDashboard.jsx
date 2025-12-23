import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import api from '../../utils/axiosConfig';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalUsers: 0,
    checklistCompletion: 0,
    activeHazards: 0,
    languages: []
  });
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [hazards, setHazards] = useState([]);
  const [sosAlerts, setSosAlerts] = useState([]);
  const [incompleteChecklists, setIncompleteChecklists] = useState([]);
  const [incompleteChecklistsLoading, setIncompleteChecklistsLoading] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportStart, setExportStart] = useState('');
  const [exportEnd, setExportEnd] = useState('');
  const [exportFormat, setExportFormat] = useState('csv');
  const [exporting, setExporting] = useState(false);

  const getDefaultDates = () => {
    const today = new Date();
    const end = today.toISOString().slice(0, 10);
    const startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    return { startDate, end };
  };

  const handleExport = async () => {
    const { startDate, end } = getDefaultDates();
    const startParam = exportStart || startDate;
    const endParam = exportEnd || end;

    setExporting(true);
    try {
      const resp = await api.get(
        `/reports/dgms?start=${startParam}&end=${endParam}&format=${exportFormat}`,
        { responseType: 'blob' }
      );

      const mime = exportFormat === 'pdf' ? 'application/pdf' : 'text/csv;charset=utf-8;';
      const blob = new Blob([resp.data], { type: mime });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const ext = exportFormat === 'pdf' ? 'pdf' : 'csv';
      a.download = `dgms_report_${startParam}_to_${endParam}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setExportModalOpen(false);
    } catch (err) {
      console.error('Failed to download report', err);
      // Minimal user feedback
      alert('Failed to generate report. Check logs or permissions.');
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    const allowedRoles = ['admin', 'supervisor', 'dgms_officer'];
    if (!user || !allowedRoles.includes(user.role)) {
      return;
    }

    let isMounted = true;

    const fetchDashboardStats = async () => {
      try {
        const { data } = await api.get('/dashboard/admin');
        if (isMounted && data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const fetchContent = async () => {
      try {
        const [incidentsRes, hazardsRes, sosRes, incompleteRes] = await Promise.all([
          api.get('/incidents'),
          api.get('/hazards'),
          api.get('/sos/alerts?status=active'),
          api.get('/checklist/incomplete')
        ]);

        if (isMounted) {
          if (incidentsRes.data.success) setIncidents(incidentsRes.data.data.slice(0, 5));
          if (hazardsRes.data.success) setHazards(hazardsRes.data.data.slice(0, 5));
          if (sosRes.data.success) setSosAlerts(sosRes.data.data.slice(0, 5));
          if (incompleteRes.data.success) setIncompleteChecklists(incompleteRes.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard content:', error);
      }
    };

    fetchDashboardStats();
    fetchContent();

    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    const allowedRoles = ['admin', 'supervisor', 'dgms_officer'];
    if (!user || !allowedRoles.includes(user.role)) {
      return;
    }

    let isMounted = true;
    const fetchLeaderboard = async () => {
      setLeaderboardLoading(true);
      try {
        const { data } = await api.get('/behavior/supervisor/overview?range=7');
        const topWorkers = data?.data?.topCompliantWorkers || [];

        if (isMounted) {
          setLeaderboard(
            topWorkers.map((snap, index) => ({
              id: snap._id || index,
              name: snap.user?.name || 'Unknown employee',
              role: snap.user?.role || 'employee',
              complianceScore: snap.complianceScore ?? 0,
              riskLevel: snap.riskLevel || 'medium',
              streakCount: snap.streakCount || 0,
            }))
          );
        }
      } catch (error) {
        console.error('Failed to fetch compliance leaderboard:', error);
      } finally {
        if (isMounted) {
          setLeaderboardLoading(false);
        }
      }
    };

    fetchLeaderboard();
    return () => {
      isMounted = false;
    };
  }, [user]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="container mx-auto px-4 py-8 mt-10"
    >
      <Header userName={user?.name} />

      <div className="flex justify-end mb-6">
        <button
          className="btn btn-primary px-4 py-2 text-sm"
          onClick={() => setExportModalOpen(true)}
          title="Export DGMS report (CSV/PDF)"
        >
          Export DGMS Report
        </button>
      </div>

      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <SummaryCard
          color="bg-blue-100 text-blue-600"
          title="Workforce enrolled"
          value={loading ? "..." : stats.totalUsers}
          subtitle="Accounts onboarded"
        />
        <SummaryCard
          color="bg-green-100 text-green-600"
          title="Checklist completion"
          value={loading ? "..." : `${stats.checklistCompletion}%`}
          subtitle="DGMS prompts honoured"
        />
        <SummaryCard
          color="bg-yellow-100 text-yellow-600"
          title="Active hazards"
          value={loading ? "..." : stats.activeHazards}
          subtitle="Awaiting mitigation"
        />
        <SummaryCard
          color="bg-purple-100 text-purple-600"
          title="Languages live"
          value={loading ? "..." : stats.languages.length}
          subtitle={loading ? "..." : stats.languages.join(', ')}
        />
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8"
      >
        <SOSAlertsLog alerts={sosAlerts} />
        <RecentHazards hazards={hazards} />
        <RecentIncidents incidents={incidents} />
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="mb-8"
      >
        <ComplianceLeaderboard leaderboard={leaderboard} loading={leaderboardLoading} />
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="mb-8"
      >
        <IncompleteChecklistsTable checklists={incompleteChecklists} loading={incompleteChecklistsLoading} />
      </motion.div>
      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        start={exportStart}
        end={exportEnd}
        format={exportFormat}
        setStart={setExportStart}
        setEnd={setExportEnd}
        setFormat={setExportFormat}
        exporting={exporting}
        onExport={handleExport}
      />
    </motion.div>
  );
};

// Modal markup placed after component so it doesn't clutter the top of the file
const ExportModal = ({ open, onClose, start, end, format, setStart, setEnd, setFormat, exporting, onExport }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="w-full max-w-lg bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Export DGMS Report</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <label className="flex flex-col">
            <span className="text-xs text-gray-600 mb-1">Start date</span>
            <input type="date" value={start} onChange={e => setStart(e.target.value)} className="input" />
          </label>
          <label className="flex flex-col">
            <span className="text-xs text-gray-600 mb-1">End date</span>
            <input type="date" value={end} onChange={e => setEnd(e.target.value)} className="input" />
          </label>
        </div>

        <div className="mb-4">
          <span className="text-xs text-gray-600 mb-1 block">Format</span>
          <div className="flex items-center space-x-4">
            <label className="inline-flex items-center">
              <input type="radio" name="format" value="csv" checked={format === 'csv'} onChange={() => setFormat('csv')} />
              <span className="ml-2 text-sm">CSV</span>
            </label>
            <label className="inline-flex items-center">
              <input type="radio" name="format" value="pdf" checked={format === 'pdf'} onChange={() => setFormat('pdf')} />
              <span className="ml-2 text-sm">PDF</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button className="btn btn-secondary px-4 py-2" onClick={onClose} disabled={exporting}>Cancel</button>
          <button className="btn btn-primary px-4 py-2" onClick={onExport} disabled={exporting}>
            {exporting ? 'Preparing...' : 'Download'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Header = ({ userName }) => (
  <div className="relative overflow-hidden rounded-xl mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
    <div className="absolute top-0 left-0 w-full h-full bg-white opacity-5">
      <div className="absolute top-0 left-0 w-full h-full"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23ffffff\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' }}></div>
    </div>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative z-10"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Command Center</h1>
          <p className="text-xl text-white text-opacity-90">
            Namaste, <span className="font-semibold">{userName || 'Admin'}</span>. Track DGMS-aligned adoption.
          </p>
        </div>
      </div>
    </motion.div>
  </div>
);

const SummaryCard = ({ color, title, value, subtitle }) => (
  <motion.div className="glass-card rounded-xl shadow-lg p-6 border border-white border-opacity-20 bg-gradient-to-br from-white to-gray-50">
    <div className="flex items-center mb-3">
      <div className={`p-2 rounded-full mr-3 ${color}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-gray-700 font-medium">{title}</h3>
    </div>
    <p className="text-4xl font-bold text-gray-900">{value}</p>
    <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
  </motion.div>
);

const SOSAlertsLog = ({ alerts }) => (
  <div className="glass-card rounded-2xl shadow-lg p-6 border border-white border-opacity-20 bg-gradient-to-br from-red-50 to-white">
    <SectionHeading title="Recent SOS Alerts" subtitle="Emergency alerts triggered by employees." />
    {alerts.length === 0 ? (
      <p className="text-gray-500 mt-4">No active SOS alerts.</p>
    ) : (
      <div className="mt-4 space-y-3">
        {alerts.map(alert => (
          <div key={alert._id} className="p-3 bg-white rounded-lg border border-red-100 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-red-700">{alert.hazardType.replace('_', ' ')}</p>
                <p className="text-xs text-gray-500">{new Date(alert.createdAt).toLocaleString()}</p>
              </div>
              <span className="px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full">
                {alert.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Triggered by: <span className="font-medium">{alert.triggeredBy?.name || 'Unknown'}</span>
            </p>
          </div>
        ))}
      </div>
    )}
  </div>
);

const RecentHazards = ({ hazards }) => (
  <div className="glass-card rounded-2xl shadow-lg p-6 border border-white border-opacity-20 bg-gradient-to-br from-orange-50 to-white">
    <SectionHeading title="Recent Hazards" subtitle="Latest reported hazards requiring attention." />
    {hazards.length === 0 ? (
      <p className="text-gray-500 mt-4">No hazards reported recently.</p>
    ) : (
      <div className="mt-4 space-y-3">
        {hazards.map(hazard => (
          <div key={hazard._id} className="p-3 bg-white rounded-lg border border-orange-100 shadow-sm">
            <div className="flex justify-between items-start">
              <h4 className="font-medium text-gray-800">{hazard.title}</h4>
              <span className={`px-2 py-0.5 text-xs rounded-full ${hazard.severity === 'high' ? 'bg-red-100 text-red-700' :
                hazard.severity === 'medium' ? 'bg-orange-100 text-orange-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                {hazard.severity}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{hazard.description}</p>
            <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
              <span>{new Date(hazard.createdAt).toLocaleDateString()}</span>
              <span className="capitalize">{hazard.status.replace('_', ' ')}</span>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const RecentIncidents = ({ incidents }) => (
  <div className="glass-card rounded-2xl shadow-lg p-6 border border-white border-opacity-20 bg-gradient-to-br from-gray-50 to-white">
    <SectionHeading title="Recent Incidents" subtitle="Logged incidents and near-misses." />
    {incidents.length === 0 ? (
      <p className="text-gray-500 mt-4">No incidents logged recently.</p>
    ) : (
      <div className="mt-4 space-y-3">
        {incidents.map(incident => (
          <div key={incident._id} className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start">
              <h4 className="font-medium text-gray-800">{incident.title}</h4>
              <span className="text-xs text-gray-500">{incident.type}</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">{incident.location}</p>
            <div className="flex justify-between items-center mt-2 text-xs">
              <span className={`px-2 py-0.5 rounded-full ${incident.status === 'closed' ? 'bg-green-100 text-green-700' :
                  incident.status === 'investigating' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                }`}>
                {incident.status === 'closed' ? 'Resolved' :
                  incident.status === 'investigating' ? 'Under Investigation' :
                    incident.status === 'open' ? 'Pending' : incident.status}
              </span>
              <span className="text-gray-400">{new Date(incident.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const ComplianceLeaderboard = ({ leaderboard, loading }) => (
  <div className="glass-card rounded-2xl shadow-lg p-6 border border-white border-opacity-20 bg-gradient-to-br from-white to-gray-50">
    <SectionHeading
      title="Safety compliance leaderboard"
      subtitle="Top mine employees by daily safety compliance score."
    />
    {loading ? (
      <p className="text-gray-500 mt-4">Loading leaderboard...</p>
    ) : !leaderboard.length ? (
      <p className="text-gray-500 mt-4">No employee compliance data available yet.</p>
    ) : (
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="py-2 pr-4">Rank</th>
              <th className="py-2 pr-4">Worker</th>
              <th className="py-2 pr-4">Score</th>
              <th className="py-2 pr-4">Risk</th>
              <th className="py-2 pr-4">Streak</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((row, index) => (
              <tr key={row.id} className="border-b border-gray-50 last:border-0">
                <td className="py-2 pr-4 font-semibold text-gray-700">#{index + 1}</td>
                <td className="py-2 pr-4">
                  <div className="font-medium text-gray-900">{row.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{row.role}</div>
                </td>
                <td className="py-2 pr-4 font-semibold text-gray-900">{row.complianceScore}</td>
                <td className="py-2 pr-4">
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs ${row.riskLevel === 'low'
                      ? 'bg-green-50 text-green-700'
                      : row.riskLevel === 'high'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-yellow-50 text-yellow-700'
                      }`}
                  >
                    {row.riskLevel}
                  </span>
                </td>
                <td className="py-2 pr-4 text-xs text-gray-700">
                  {row.streakCount ? `${row.streakCount} day streak` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

const IncompleteChecklistsTable = ({ checklists, loading }) => {
  const today = new Date().toLocaleDateString();

  // Filter out admin users from the list
  const filteredChecklists = checklists.filter(checklist =>
    checklist.user.role !== 'admin'
  );

  return (
    <div className="glass-card rounded-2xl shadow-lg p-6 border border-white border-opacity-20 bg-gradient-to-br from-red-50 to-white">
      <SectionHeading
        title="Incomplete Daily Checklists"
        subtitle={`Employees who haven't completed their checklist for ${today}.`}
      />
      {loading ? (
        <p className="text-gray-500 mt-4">Loading incomplete checklists...</p>
      ) : !filteredChecklists.length ? (
        <p className="text-gray-500 mt-4">All employees have completed their checklists for today. Great job!</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="py-2 pr-4">Employee</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Uncompleted Tasks</th>
                <th className="py-2 pr-4">Last Update</th>
              </tr>
            </thead>
            <tbody>
              {filteredChecklists.map(checklist => (
                <tr key={checklist._id} className="border-b border-gray-50 last:border-0">
                  <td className="py-2 pr-4">
                    <div className="font-medium text-gray-900">{checklist.user.name}</div>
                    <div className="text-xs text-gray-500">{checklist.user.email}</div>
                  </td>
                  <td className="py-2 pr-4 capitalize">{checklist.user.role}</td>
                  <td className="py-2 pr-4 font-semibold text-red-700">
                    {checklist.items.filter(item => !item.completed).length}
                  </td>
                  <td className="py-2 pr-4 text-xs text-gray-700">
                    {new Date(checklist.updatedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const SectionHeading = ({ title, subtitle }) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
    <p className="text-sm text-gray-500">{subtitle}</p>
  </div>
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

export default AdminDashboard;
