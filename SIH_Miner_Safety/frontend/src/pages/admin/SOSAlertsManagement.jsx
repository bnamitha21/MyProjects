import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import api from '../../utils/axiosConfig';
import { toast } from 'react-toastify';

const HAZARD_ICONS = {
  underground_fire: '🔥',
  gas_leakage: '💨',
  water_leak: '💧',
  rock_fall: '⛰️',
  blasting_error: '💣',
};

const HAZARD_COLORS = {
  underground_fire: 'bg-red-600',
  gas_leakage: 'bg-orange-600',
  water_leak: 'bg-blue-600',
  rock_fall: 'bg-gray-700',
  blasting_error: 'bg-yellow-600',
};

const STATUS_COLORS = {
  active: 'bg-red-100 text-red-800 border-red-300',
  acknowledged: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  resolved: 'bg-green-100 text-green-800 border-green-300',
};

const SOSAlertsManagement = () => {
  const { user } = useContext(AuthContext);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [socket, setSocket] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    // Only allow admin
    if (!user || user.role !== 'admin') {
      return;
    }

    // Initialize Socket.IO connection (backend on port 5000)
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const newSocket = io(apiUrl, {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Socket.IO connected for SOS alerts management');
      newSocket.emit('join-role-room', user.role);
    });

    // Listen for new SOS emergency alerts
    newSocket.on('sos-emergency-alert', (alertData) => {
      console.log('🚨 New SOS Alert received:', alertData);
      setAlerts((prev) => [alertData, ...prev]);
      toast.error(`🚨 New Emergency: ${alertData.hazardLabel}`, {
        position: 'top-right',
        autoClose: 5000,
      });
    });

    // Listen for acknowledged alerts
    newSocket.on('sos-alert-acknowledged', (data) => {
      console.log('SOS alert acknowledged:', data);
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === data.alertId
            ? { ...alert, status: 'acknowledged' }
            : alert
        )
      );
    });

    // Listen for resolved alerts
    newSocket.on('sos-alert-resolved', (data) => {
      console.log('SOS alert resolved:', data);
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === data.alertId
            ? { ...alert, status: 'resolved' }
            : alert
        )
      );
    });

    setSocket(newSocket);

    // Fetch all alerts
    const fetchAlerts = async () => {
      setLoading(true);
      try {
        const response = await api.get('/sos/alerts');
        if (response.data.success) {
          setAlerts(
            response.data.data.map((alert) => ({
              id: alert._id,
              hazardType: alert.hazardType,
              hazardLabel: alert.hazardType
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (l) => l.toUpperCase()),
              employeeId: alert.triggeredBy?._id || alert.triggeredBy,
              employeeName: alert.triggeredBy?.name || 'Unknown',
              location: alert.location,
              timestamp: alert.createdAt,
              status: alert.status,
              acknowledgedBy: alert.acknowledgedBy?.name,
              acknowledgedAt: alert.acknowledgedAt,
              resolvedAt: alert.resolvedAt,
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching SOS alerts:', error);
        toast.error('Failed to load SOS alerts');
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [user]);

  const handleAcknowledge = async (alertId) => {
    if (processingId === alertId) return;
    
    setProcessingId(alertId);
    try {
      const response = await api.patch(`/sos/alerts/${alertId}/acknowledge`);
      if (response.data.success) {
        setAlerts((prev) =>
          prev.map((alert) =>
            alert.id === alertId
              ? {
                  ...alert,
                  status: 'acknowledged',
                  acknowledgedBy: user.name,
                  acknowledgedAt: new Date().toISOString(),
                }
              : alert
          )
        );
        toast.success('SOS alert acknowledged successfully');
      }
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      toast.error(error.response?.data?.message || 'Failed to acknowledge alert');
    } finally {
      setProcessingId(null);
    }
  };

  const handleResolve = async (alertId) => {
    if (processingId === alertId) return;
    
    setProcessingId(alertId);
    try {
      const response = await api.patch(`/sos/alerts/${alertId}/resolve`);
      if (response.data.success) {
        setAlerts((prev) =>
          prev.map((alert) =>
            alert.id === alertId
              ? {
                  ...alert,
                  status: 'resolved',
                  resolvedAt: new Date().toISOString(),
                }
              : alert
          )
        );
        toast.success('SOS alert resolved successfully');
      }
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast.error(error.response?.data?.message || 'Failed to resolve alert');
    } finally {
      setProcessingId(null);
    }
  };

  // Filter alerts based on status
  const filteredAlerts =
    filterStatus === 'all'
      ? alerts
      : alerts.filter((alert) => alert.status === filterStatus);

  // Count alerts by status
  const statusCounts = {
    all: alerts.length,
    active: alerts.filter((a) => a.status === 'active').length,
    acknowledged: alerts.filter((a) => a.status === 'acknowledged').length,
    resolved: alerts.filter((a) => a.status === 'resolved').length,
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to view this page. Admin access required.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="p-6 bg-gray-50 rounded-lg shadow-md mt-12"
    >
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl mb-8 bg-gradient-to-r from-red-600 to-orange-600 p-8 text-white">
        <div className="absolute top-0 left-0 w-full h-full bg-white opacity-5">
          <div
            className="absolute top-0 left-0 w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
            }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <h1 className="text-3xl font-bold mb-2">🚨 SOS Emergency Alerts</h1>
          <p className="text-white text-opacity-90 text-lg">
            Manage and respond to emergency SOS alerts from employees
          </p>
        </motion.div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-3 mb-6 bg-white p-4 rounded-lg shadow-sm">
        {[
          { key: 'all', label: 'All Alerts' },
          { key: 'active', label: 'Active' },
          { key: 'acknowledged', label: 'Acknowledged' },
          { key: 'resolved', label: 'Resolved' },
        ].map((tab) => (
          <motion.button
            key={tab.key}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilterStatus(tab.key)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              filterStatus === tab.key
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
            <span className="ml-2 px-2 py-0.5 rounded-full bg-white bg-opacity-20 text-xs">
              {statusCounts[tab.key]}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-6xl mb-4">🚨</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No {filterStatus !== 'all' ? filterStatus : ''} alerts found
          </h3>
          <p className="text-gray-600">
            {filterStatus === 'all'
              ? 'No SOS alerts have been triggered yet.'
              : `No ${filterStatus} alerts at the moment.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredAlerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`bg-white rounded-lg shadow-md border-l-4 ${
                  HAZARD_COLORS[alert.hazardType] || 'bg-red-600'
                } border-l-4 overflow-hidden`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <span className="text-4xl">
                        {HAZARD_ICONS[alert.hazardType] || '🚨'}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">
                            {alert.hazardLabel}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                              STATUS_COLORS[alert.status] || STATUS_COLORS.active
                            }`}
                          >
                            {alert.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                          <div>
                            <span className="font-semibold text-gray-700">Employee:</span>{' '}
                            {alert.employeeName}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">Employee ID:</span>{' '}
                            {alert.employeeId}
                          </div>
                          <div className="md:col-span-2">
                            <span className="font-semibold text-gray-700">Location:</span>{' '}
                            {alert.location?.description || 'Not specified'}
                            {alert.location?.coordinates && (
                              <span className="text-xs text-gray-500 ml-2">
                                ({alert.location.coordinates.latitude?.toFixed(4)},{' '}
                                {alert.location.coordinates.longitude?.toFixed(4)})
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">Triggered:</span>{' '}
                            {new Date(alert.timestamp).toLocaleString()}
                          </div>
                          {alert.acknowledgedBy && (
                            <div>
                              <span className="font-semibold text-gray-700">Acknowledged by:</span>{' '}
                              {alert.acknowledgedBy} at{' '}
                              {new Date(alert.acknowledgedAt).toLocaleString()}
                            </div>
                          )}
                          {alert.resolvedAt && (
                            <div>
                              <span className="font-semibold text-gray-700">Resolved:</span>{' '}
                              {new Date(alert.resolvedAt).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                    {alert.status === 'active' && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAcknowledge(alert.id)}
                          disabled={processingId === alert.id}
                          className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {processingId === alert.id ? (
                            <>
                              <svg
                                className="animate-spin h-4 w-4"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Processing...
                            </>
                          ) : (
                            <>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              Acknowledge
                            </>
                          )}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleResolve(alert.id)}
                          disabled={processingId === alert.id}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {processingId === alert.id ? (
                            <>
                              <svg
                                className="animate-spin h-4 w-4"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Processing...
                            </>
                          ) : (
                            <>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              Resolve
                            </>
                          )}
                        </motion.button>
                      </>
                    )}
                    {alert.status === 'acknowledged' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleResolve(alert.id)}
                        disabled={processingId === alert.id}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {processingId === alert.id ? (
                          <>
                            <svg
                              className="animate-spin h-4 w-4"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Resolve
                          </>
                        )}
                      </motion.button>
                    )}
                    {alert.status === 'resolved' && (
                      <div className="flex-1 text-center text-green-600 font-semibold py-2">
                        ✓ Resolved
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default SOSAlertsManagement;

