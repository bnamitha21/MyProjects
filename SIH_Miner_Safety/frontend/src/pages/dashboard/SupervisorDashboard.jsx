import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title } from 'chart.js';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import { fetchSupervisorBehaviorOverview, acknowledgeBehaviorAlert, predictRisk } from '../../utils/behaviorTracker';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title);

const SupervisorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [behaviorData, setBehaviorData] = useState({
    loading: true,
    data: null,
    error: null,
  });
  const [acknowledgingAlertId, setAcknowledgingAlertId] = useState(null);
  const [predictingUserId, setPredictingUserId] = useState(null);
  const [predictions, setPredictions] = useState({});
  
  // Animation variants
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
      transition: { type: "spring", stiffness: 100 }
    }
  };
  
  useEffect(() => {
    let isMounted = true;
    const loadBehaviorData = async () => {
      try {
        const data = await fetchSupervisorBehaviorOverview();
        if (isMounted) {
          setBehaviorData({ loading: false, data, error: null });
        }
      } catch (error) {
        console.error('Failed to load supervisor overview', error);
        if (isMounted) {
          setBehaviorData({
            loading: false,
            data: null,
            error: 'Unable to load behavior analytics.',
          });
        }
      }
    };

    if (user?._id) {
      loadBehaviorData();
    }

    return () => {
      isMounted = false;
    };
  }, [user?._id]);

  const summaryFallback = {
    totalWorkers: 12,
    averageScore: 82,
    highRiskCount: 2,
    lowRiskCount: 8,
    inactiveWorkers: 1,
  };

  const trendFallback = [
    { date: '2024-01-01', averageScore: 78 },
    { date: '2024-01-02', averageScore: 81 },
    { date: '2024-01-03', averageScore: 83 },
    { date: '2024-01-04', averageScore: 85 },
    { date: '2024-01-05', averageScore: 87 },
  ];

  const fallbackTopWorkers = [
    { _id: 'fallback-top-1', user: { name: 'Team A', role: 'worker' }, complianceScore: 95, streakCount: 5 },
    { _id: 'fallback-top-2', user: { name: 'Team B', role: 'worker' }, complianceScore: 90, streakCount: 3 },
    { _id: 'fallback-top-3', user: { name: 'Team C', role: 'worker' }, complianceScore: 88, streakCount: 4 },
  ];

  const fallbackAtRisk = [
    { _id: 'fallback-risk-1', user: { name: 'Worker One', role: 'worker' }, complianceScore: 62, riskLevel: 'medium' },
    { _id: 'fallback-risk-2', user: { name: 'Worker Two', role: 'worker' }, complianceScore: 55, riskLevel: 'high' },
  ];

  const fallbackHeatmap = [
    { zone: 'North Shaft', totalEvents: 12, ppeIncidents: 2, hazardsReported: 1, riskLevel: 'medium' },
    { zone: 'South Tunnel', totalEvents: 5, ppeIncidents: 0, hazardsReported: 2, riskLevel: 'low' },
  ];

  const summary = behaviorData.data?.summary || summaryFallback;
  const trend = behaviorData.data?.trend?.length ? behaviorData.data.trend : trendFallback;
  const topCompliantWorkers = behaviorData.data?.topCompliantWorkers?.length
    ? behaviorData.data.topCompliantWorkers
    : fallbackTopWorkers;
  const atRiskWorkers = behaviorData.data?.atRiskWorkers?.length
    ? behaviorData.data.atRiskWorkers
    : fallbackAtRisk;
  // Deduplicate worker lists by user id to avoid duplicate entries
  const dedupeByUser = (list) => {
    const seen = new Set();
    const out = [];
    (list || []).forEach((item) => {
      const uid = item?.user?._id || item?.user || item?._id;
      if (!uid) return;
      const key = uid.toString();
      if (!seen.has(key)) {
        seen.add(key);
        out.push(item);
      }
    });
    return out;
  };

  const dedupedTopCompliantWorkers = dedupeByUser(topCompliantWorkers);
  const dedupedAtRiskWorkers = dedupeByUser(atRiskWorkers);
  const heatmap = behaviorData.data?.heatmap?.length ? behaviorData.data.heatmap : fallbackHeatmap;
  const alerts = behaviorData.data?.alerts || [];
  // Deduplicate alerts by _id to avoid rendering duplicates
  const dedupedAlerts = (() => {
    const seen = new Set();
    const out = [];
    (alerts || []).forEach((a) => {
      const id = a?._id || `${a.user?._id}-${a.type}-${a.snapshotDate}`;
      if (!id) return;
      if (!seen.has(id.toString())) {
        seen.add(id.toString());
        out.push(a);
      }
    });
    return out;
  })();

  const complianceGaugeData = {
    labels: ['Score', 'Gap'],
    datasets: [
      {
        data: [summary.averageScore, Math.max(0, 100 - summary.averageScore)],
        backgroundColor: ['#10B981', '#E5E7EB'],
        borderColor: ['#10B981', '#E5E7EB'],
        borderWidth: 1,
        cutout: '75%',
        borderRadius: 5,
      },
    ],
  };

  const complianceTrendData = {
    labels: trend.map((point) => new Date(point.date).toLocaleDateString(undefined, { weekday: 'short' })),
    datasets: [
      {
        label: 'Average Compliance Score',
        data: trend.map((point) => point.averageScore),
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const topWorkersBarData = {
    labels: dedupedTopCompliantWorkers.map((worker) => worker.user?.name || 'Worker'),
    datasets: [
      {
        label: 'Compliance Score',
        data: dedupedTopCompliantWorkers.map((worker) => worker.complianceScore || 0),
        backgroundColor: '#6366F1',
        borderRadius: 6,
      },
    ],
  };

  const handleAcknowledgeAlert = async (alertId) => {
    try {
      setAcknowledgingAlertId(alertId);
      await acknowledgeBehaviorAlert(alertId);
      setBehaviorData((prev) => {
        if (!prev.data) return prev;
        return {
          ...prev,
          data: {
            ...prev.data,
            alerts: prev.data.alerts.filter((alert) => alert._id !== alertId),
          },
        };
      });
    } catch (error) {
      console.error('Failed to acknowledge alert', error);
    } finally {
      setAcknowledgingAlertId(null);
    }
  };

  const handlePredictForUser = async (userId) => {
    try {
      setPredictingUserId(userId);
      const result = await predictRisk({ userId });
      setPredictions((p) => ({ ...p, [userId]: result }));
    } catch (error) {
      console.error('Prediction failed', error);
    } finally {
      setPredictingUserId(null);
    }
  };

  return (
    <motion.div 
      className="container mx-auto px-4 py-8 mt-1"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants} className="flex justify-between items-center mb-6 mt-10">
        <h1 className="text-3xl font-bold text-gray-800">Supervisor Dashboard</h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => setActiveTab('overview')} 
            className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'overview' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('analytics')} 
            className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'analytics' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Analytics
          </button>
          <button 
            onClick={() => setActiveTab('team')} 
            className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'team' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Team
          </button>
        </div>
      </motion.div>
      
      {/* Behavior Summary Section */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <motion.div 
          className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500"
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <h3 className="text-gray-500 text-sm font-medium">Total Workers</h3>
          <p className="text-3xl font-bold text-gray-800">{summary.totalWorkers}</p>
          <p className="text-green-500 text-sm mt-2">{summary.lowRiskCount} low-risk today</p>
        </motion.div>
        <motion.div 
          className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500"
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <h3 className="text-gray-500 text-sm font-medium">Avg Safety Score</h3>
          <p className="text-3xl font-bold text-gray-800">{summary.averageScore}</p>
          <p className="text-green-500 text-sm mt-2">Target ≥ 80</p>
        </motion.div>
        <motion.div 
          className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500"
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <h3 className="text-gray-500 text-sm font-medium">High-Risk Workers</h3>
          <p className="text-3xl font-bold text-gray-800">{summary.highRiskCount}</p>
          <p className="text-red-500 text-sm mt-2">Immediate coaching required</p>
        </motion.div>
        <motion.div 
          className="bg-white p-6 rounded-xl shadow-md border-l-4 border-indigo-500"
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <h3 className="text-gray-500 text-sm font-medium">Low-Risk Workers</h3>
          <p className="text-3xl font-bold text-gray-800">{summary.lowRiskCount}</p>
          <p className="text-green-500 text-sm mt-2">Model behavior champions</p>
        </motion.div>
        <motion.div 
          className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500"
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <h3 className="text-gray-500 text-sm font-medium">Inactive Workers</h3>
          <p className="text-3xl font-bold text-gray-800">{summary.inactiveWorkers}</p>
          <p className="text-yellow-500 text-sm mt-2">No engagement today</p>
        </motion.div>
      </motion.div>
      
      {/* Analytics Section */}
      {activeTab === 'analytics' && (
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Average Compliance Trend</h2>
              {behaviorData.loading && <span className="text-xs text-gray-400">Updating...</span>}
            </div>
            <div className="h-64">
              <Line 
                data={complianceTrendData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.05)',
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">Top Compliant Workers</h2>
            <div className="h-64">
              <Bar 
                data={topWorkersBarData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.05)',
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
      >
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Top Compliant Workers</h2>
          <div className="space-y-4">
            {dedupedTopCompliantWorkers.map((worker) => (
              <div key={worker._id || worker.user?.name} className="flex items-center justify-between border rounded-lg p-4">
                <div>
                  <p className="font-bold text-gray-800">{worker.user?.name || 'Worker'}</p>
                  <p className="text-sm text-gray-500 capitalize">{worker.user?.role || 'worker'}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-extrabold text-green-600">{worker.complianceScore || 0}</p>
                  <p className="text-xs text-gray-500">{worker.streakCount || 0} day streak</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">At-Risk Workers</h2>
          <div className="space-y-4">
            {dedupedAtRiskWorkers.map((worker) => {
              const uid = worker.user?._id || worker.user;
              const prediction = predictions[uid];
              return (
                <div key={worker._id || uid} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-800">{worker.user?.name || 'Worker'}</p>
                      <p className="text-sm text-gray-500 capitalize">{worker.user?.role || 'worker'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-extrabold text-red-600">{worker.complianceScore || 0}</p>
                      <p className="text-xs text-gray-500 text-right">{(worker.riskLevel || 'high').toUpperCase()} RISK</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <button
                      onClick={() => handlePredictForUser(uid)}
                      disabled={predictingUserId === uid}
                      className="px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {predictingUserId === uid ? 'Predicting...' : 'Predict Risk'}
                    </button>
                    <div className="text-right text-xs text-gray-500">
                      {prediction && (
                        <div>
                          <div className="font-semibold">Predicted: <span className={`ml-1 ${prediction.riskLevel === 'high' ? 'text-red-600' : prediction.riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>{prediction.riskLevel}</span></div>
                          <div>Confidence: {prediction.confidence}%</div>
                        </div>
                      )}
                    </div>
                  </div>
                  {prediction && (
                    <div className="mt-3 bg-gray-50 p-3 rounded">
                      <div className="text-xs font-medium text-gray-700">Suggestions</div>
                      <ul className="mt-1 text-xs text-gray-600 list-disc list-inside">
                        {prediction.suggestions?.slice(0,3).map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
      
      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/hazard-management" className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg text-center hover:from-blue-600 hover:to-blue-700 transition shadow-md flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Manage Hazards
          </Link>
          <Link to="/team-management" className="bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg text-center hover:from-green-600 hover:to-green-700 transition shadow-md flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            View Team Compliance
          </Link>
          <Link to="/reports" className="bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-4 rounded-lg text-center hover:from-purple-600 hover:to-purple-700 transition shadow-md flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm4-1a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Generate Reports
          </Link>
        </div>
      </motion.div>
      
      {/* Compliance Snapshot */}
      {activeTab === 'overview' && (
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">Live Safety Score</h2>
            <div className="h-64 flex items-center justify-center relative">
              <Doughnut 
                data={complianceGaugeData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  cutout: '75%',
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-4xl font-bold text-gray-800">{summary.averageScore}</span>
                <span className="text-sm text-gray-500">Score</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Zone Behavior Heatmap</h2>
            <div className="space-y-4">
              {heatmap.map((zone) => (
                <div key={zone.zone} className="border rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold text-gray-800">{zone.zone}</p>
                    <p className="text-sm text-gray-500">
                      {zone.hazardsReported} hazards • {zone.ppeIncidents} PPE issues
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    zone.riskLevel === 'high'
                      ? 'bg-red-100 text-red-600'
                      : zone.riskLevel === 'medium'
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-green-100 text-green-600'
                  }`}>
                    {zone.riskLevel} risk
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Behavior Alerts */}
      <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Behavior Alerts</h2>
          {behaviorData.error && (
            <span className="text-sm text-red-500">{behaviorData.error}</span>
          )}
        </div>
        {dedupedAlerts.length === 0 ? (
          <p className="text-sm text-gray-500">All clear — no open behavior alerts.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-50 text-gray-600 uppercase text-xs leading-normal">
                  <th className="py-3 px-6 text-left">Worker</th>
                  <th className="py-3 px-6 text-left">Alert Type</th>
                  <th className="py-3 px-6 text-left">Severity</th>
                  <th className="py-3 px-6 text-left">Snapshot Date</th>
                  <th className="py-3 px-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
                {dedupedAlerts.map((alert) => (
                  <motion.tr 
                    key={alert._id} 
                    className="border-b border-gray-200 hover:bg-gray-50"
                    whileHover={{ backgroundColor: 'rgba(243, 244, 246, 0.5)' }}
                  >
                    <td className="py-3 px-6 whitespace-nowrap">
                      <div className="font-medium">{alert.user?.name || 'Worker'}</div>
                      <div className="text-xs text-gray-500">{alert.user?.email}</div>
                    </td>
                    <td className="py-3 px-6 capitalize">{alert.type.replace('_', ' ')}</td>
                    <td className="py-3 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        alert.severity === 'high'
                          ? 'bg-red-100 text-red-800'
                          : alert.severity === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                      }`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="py-3 px-6">{alert.snapshotDate}</td>
                    <td className="py-3 px-6 text-center">
                      <button
                        onClick={() => handleAcknowledgeAlert(alert._id)}
                        disabled={acknowledgingAlertId === alert._id}
                        className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {acknowledgingAlertId === alert._id ? 'Acknowledging...' : 'Acknowledge'}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default SupervisorDashboard;