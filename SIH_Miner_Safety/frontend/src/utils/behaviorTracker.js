import api from './axiosConfig';

export const logBehaviorEvent = async (type, metadata = {}) => {
  try {
    await api.post('/behavior/events', { type, metadata });
  } catch (error) {
    // Avoid blocking UX if telemetry fails
    console.warn('Behavior event failed', error?.response?.data || error.message);
  }
};

export const fetchMyBehaviorSnapshot = async (range = 7) => {
  const response = await api.get(`/behavior/snapshots/me?range=${range}`);
  return response.data?.data;
};

export const fetchSupervisorBehaviorOverview = async (range = 7) => {
  const response = await api.get(`/behavior/supervisor/overview?range=${range}`);
  return response.data?.data;
};

export const acknowledgeBehaviorAlert = async (alertId) => {
  const response = await api.post(`/behavior/alerts/${alertId}/acknowledge`);
  return response.data?.data;
};

export const predictRisk = async (payload) => {
  const response = await api.post('/behavior/predict', payload || {});
  return response.data?.data;
};

