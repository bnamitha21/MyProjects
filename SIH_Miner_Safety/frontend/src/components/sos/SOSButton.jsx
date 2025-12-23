import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/axiosConfig';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const HAZARD_TYPES = [
  { value: 'underground_fire', label: 'Underground Fire', icon: '🔥', color: 'bg-red-600' },
  { value: 'gas_leakage', label: 'Gas Leakage', icon: '💨', color: 'bg-orange-600' },
  { value: 'water_leak', label: 'Water Leak', icon: '💧', color: 'bg-blue-600' },
  { value: 'rock_fall', label: 'Rock Fall', icon: '⛰️', color: 'bg-gray-700' },
  { value: 'blasting_error', label: 'Blasting Error', icon: '💣', color: 'bg-yellow-600' },
];

const SOSButton = () => {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);

  // Get user's current location (if available from mine visualization or GPS)
  const getCurrentLocation = async () => {
    // Try to get location from localStorage (if set by mine visualization)
    const savedLocation = localStorage.getItem('employee_location');
    if (savedLocation) {
      try {
        return JSON.parse(savedLocation);
      } catch (e) {
        console.error('Error parsing saved location:', e);
      }
    }

    // Fallback: Try browser geolocation (if available)
    if (navigator.geolocation) {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              type: 'Point',
              coordinates: [position.coords.longitude, position.coords.latitude],
              description: `GPS: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
            });
          },
          () => {
            // If geolocation fails, use default
            resolve({
              type: 'Point',
              coordinates: [0, 0],
              description: 'Location not available',
            });
          }
        );
      });
    }

    // Default location
    return {
      type: 'Point',
      coordinates: [0, 0],
      description: 'Location not available',
    };
  };

  const handleSOSTrigger = async (hazardType) => {
    if (!user || !['employee', 'supervisor'].includes(user.role)) {
      toast.error('Only employees and supervisors can trigger SOS alerts');
      return;
    }

    // Confirm before triggering
    const hazard = HAZARD_TYPES.find(h => h.value === hazardType);
    const confirmed = window.confirm(
      `⚠️ EMERGENCY SOS ALERT\n\n` +
      `You are about to trigger an emergency alert for:\n` +
      `${hazard.icon} ${hazard.label}\n\n` +
      `This will immediately notify all admins and supervisors.\n\n` +
      `Are you sure this is an emergency?`
    );

    if (!confirmed) {
      return;
    }

    setIsTriggering(true);
    
    // Get current location
    const currentLocation = await getCurrentLocation();

    try {
      const response = await api.post('/sos/trigger', {
        hazardType,
        location: currentLocation,
      });

      if (response.data.success) {
        toast.success('🚨 SOS Alert Triggered! Admins and supervisors have been notified.');
        setIsOpen(false);
        
        // Log the SOS trigger
        console.log('SOS Alert triggered:', response.data.data);
      }
    } catch (error) {
      console.error('Error triggering SOS:', error);
      toast.error(error.response?.data?.message || 'Failed to trigger SOS alert. Please try again.');
    } finally {
      setIsTriggering(false);
    }
  };

  // Only show for employees and supervisors
  if (!user || !['employee', 'supervisor'].includes(user.role)) {
    return null;
  }

  return (
    <>
      {/* Floating SOS Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-2xl flex items-center justify-center text-2xl font-bold transition-all duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: [
            '0 0 0 0 rgba(220, 38, 38, 0.7)',
            '0 0 0 10px rgba(220, 38, 38, 0)',
            '0 0 0 0 rgba(220, 38, 38, 0)',
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        title="Emergency SOS Alert"
      >
        <span className="text-2xl">🚨</span>
      </motion.button>

      {/* SOS Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            >
              {/* Modal */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-red-600 flex items-center gap-2">
                    <span className="text-3xl">🚨</span>
                    Emergency SOS Alert
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <p className="text-gray-600 mb-6">
                  Select the type of emergency. This will immediately notify all admins and supervisors.
                </p>

                <div className="space-y-3">
                  {HAZARD_TYPES.map((hazard) => (
                    <motion.button
                      key={hazard.value}
                      onClick={() => handleSOSTrigger(hazard.value)}
                      disabled={isTriggering}
                      className={`w-full ${hazard.color} text-white p-4 rounded-lg font-semibold text-left flex items-center gap-3 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-2xl">{hazard.icon}</span>
                      <span>{hazard.label}</span>
                      {isTriggering && (
                        <span className="ml-auto">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        </span>
                      )}
                    </motion.button>
                  ))}
                </div>

                <p className="text-xs text-gray-500 mt-4 text-center">
                  Only use in case of genuine emergency
                </p>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default SOSButton;

