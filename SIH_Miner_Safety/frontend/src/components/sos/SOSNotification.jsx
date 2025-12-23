import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { io } from 'socket.io-client';
import api from '../../utils/axiosConfig';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

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

const SOSNotification = () => {
  const { user } = useContext(AuthContext);
  const [alerts, setAlerts] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Only show for admin and supervisor
    if (!user || !['admin', 'supervisor'].includes(user.role)) {
      return;
    }

    // Initialize Socket.IO connection (backend on port 5000)
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const newSocket = io(apiUrl, {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Socket.IO connected for SOS alerts');
      // Join role-based room
      newSocket.emit('join-role-room', user.role);
    });

    // Listen for SOS emergency alerts
    newSocket.on('sos-emergency-alert', (alertData) => {
      console.log('🚨 SOS Alert received:', alertData);
      
      // Add to alerts array
      setAlerts((prev) => [alertData, ...prev]);

      // Show browser notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`🚨 Emergency SOS Alert: ${alertData.hazardLabel}`, {
          body: `Triggered by ${alertData.employeeName} at ${alertData.location?.description || 'Unknown location'}`,
          icon: '/vite.svg',
          badge: '/vite.svg',
          tag: alertData.id,
          requireInteraction: true,
          silent: false,
        });
      }

      // Show toast notification
      toast.error(
        `🚨 EMERGENCY: ${alertData.hazardLabel}\nEmployee: ${alertData.employeeName}`,
        {
          position: 'top-center',
          autoClose: false,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: false,
          style: {
            backgroundColor: '#dc2626',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
          },
        }
      );
    });

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    setSocket(newSocket);

    // Fetch existing active alerts
    const fetchAlerts = async () => {
      try {
        const response = await api.get('/sos/alerts?status=active');
        if (response.data.success) {
          setAlerts(response.data.data.map(alert => ({
            id: alert._id,
            hazardType: alert.hazardType,
            hazardLabel: alert.hazardType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            employeeId: alert.triggeredBy._id,
            employeeName: alert.triggeredBy.name,
            location: alert.location,
            timestamp: alert.createdAt,
            status: alert.status,
          })));
        }
      } catch (error) {
        console.error('Error fetching SOS alerts:', error);
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
    try {
      const response = await api.patch(`/sos/alerts/${alertId}/acknowledge`);
      if (response.data.success) {
        setAlerts((prev) =>
          prev.map((alert) =>
            alert.id === alertId
              ? { ...alert, status: 'acknowledged' }
              : alert
          )
        );
        toast.success('SOS alert acknowledged');
      }
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      toast.error('Failed to acknowledge alert');
    }
  };

  const handleResolve = async (alertId) => {
    try {
      const response = await api.patch(`/sos/alerts/${alertId}/resolve`);
      if (response.data.success) {
        setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
        toast.success('SOS alert resolved');
      }
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast.error('Failed to resolve alert');
    }
  };

  // Only show for admin and supervisor
  if (!user || !['admin', 'supervisor'].includes(user.role)) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
      <AnimatePresence>
        {alerts
          .filter((alert) => alert.status === 'active')
          .map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              className={`${HAZARD_COLORS[alert.hazardType] || 'bg-red-600'} text-white rounded-lg shadow-2xl p-4`}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{HAZARD_ICONS[alert.hazardType] || '🚨'}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg">EMERGENCY SOS ALERT</h3>
                    <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                      {alert.hazardLabel}
                    </span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p>
                      <strong>Employee:</strong> {alert.employeeName}
                    </p>
                    <p>
                      <strong>ID:</strong> {alert.employeeId}
                    </p>
                    <p>
                      <strong>Location:</strong> {alert.location?.description || 'Not specified'}
                    </p>
                    <p className="text-xs opacity-80">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded text-sm font-semibold transition"
                    >
                      Acknowledge
                    </button>
                    <button
                      onClick={() => handleResolve(alert.id)}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded text-sm font-semibold transition"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  );
};

export default SOSNotification;

