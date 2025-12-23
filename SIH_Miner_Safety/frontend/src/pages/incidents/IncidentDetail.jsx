import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/axiosConfig';
import { toast } from 'react-toastify';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_review', label: 'Under Investigation' },
  { value: 'resolved', label: 'Resolved' },
];

const IncidentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [statusValue, setStatusValue] = useState('pending');
  const [resolutionComment, setResolutionComment] = useState('');

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const fetchIncident = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/hazards/${id}`);
        if (res.data?.success) {
          const data = res.data.data;
          setIncident(data);

          // Map display status back to internal value
          if (data.status === 'resolved') {
            setStatusValue('resolved');
          } else if (data.status === 'in_review') {
            setStatusValue('in_review');
          } else {
            setStatusValue('pending');
          }

          if (data.resolution?.comment) {
            setResolutionComment(data.resolution.comment);
          }
        } else {
          setError('Failed to load incident details');
        }
      } catch (err) {
        console.error('Error fetching incident:', err);
        setError(err.response?.data?.message || 'Failed to load incident details');
        toast.error('Failed to load incident details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchIncident();
  }, [id]);

  const handleStatusSave = async () => {
    if (!isAdmin) return;

    try {
      setSaving(true);
      const payload = {
        status: statusValue,
      };

      // Add resolution data if status is resolved
      if (statusValue === 'resolved' && resolutionComment.trim()) {
        payload.resolution = {
          comment: resolutionComment.trim(),
          resolvedAt: new Date(),
          resolvedBy: user.id
        };
      }

      const res = await api.put(`/hazards/${id}`, payload);

      if (res.data?.success) {
        const updated = res.data.data;
        setIncident(updated);
        toast.success('Incident status updated successfully');
      } else {
        toast.error('Failed to update incident status');
      }
    } catch (err) {
      console.error('Error updating incident status:', err);
      toast.error(err.response?.data?.message || 'Failed to update incident status');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 mt-10">
        <div className="glass-card rounded-xl shadow-lg p-8 text-center border border-red-200 bg-red-50">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors inline-flex items-center"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!incident) {
    return null;
  }

  const currentStatusOption =
    STATUS_OPTIONS.find((opt) => opt.value === statusValue) || STATUS_OPTIONS[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8 mt-10"
    >
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl mb-8 bg-gradient-to-r from-red-600 to-orange-600 p-8 text-white">
        <div className="flex justify-between items-center relative z-10">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="mb-4 inline-flex items-center text-sm text-red-100 hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Incident Library
            </button>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 mr-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
                />
              </svg>
              {incident.title}
            </h1>
            <p className="text-white text-opacity-90">
              Detailed view of the reported safety incident
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-red-100 mb-1">Incident ID</p>
            <p className="font-mono text-sm bg-white bg-opacity-10 px-3 py-1 rounded-full inline-block">
              {incident.id}
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Incident details */}
        <div className="lg:col-span-2 glass-card rounded-xl shadow-lg p-6 border border-white border-opacity-20 bg-gradient-to-br from-white to-gray-50">
          {incident.imageUrl && (
            <div className="w-full h-64 overflow-hidden rounded-lg mb  -4">
              <img
                src={incident.imageUrl}
                alt={incident.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{incident.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-1">Date Reported</h3>
              <p className="text-gray-800">{new Date(incident.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-1">Severity</h3>
              <p
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize ${incident.severity === 'high' || incident.severity === 'critical'
                  ? 'bg-red-100 text-red-800'
                  : incident.severity === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                  }`}
              >
                {incident.severity}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-1">Location</h3>
              <p className="text-gray-800">{incident.location?.description || incident.location || 'N/A'}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-1">Reported By</h3>
              <p className="text-gray-800">{incident.reportedBy?.name || incident.reportedBy?.email || 'Unknown'}</p>
            </div>
            {incident.category && (
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-1">Category</h3>
                <p className="text-gray-800 capitalize">{incident.category}</p>
              </div>
            )}
          </div>

          {incident.resolution?.comment && (
            <div className="mt-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Resolution Notes</h2>
              <p className="text-gray-700 whitespace-pre-line">
                {incident.resolution.comment}
              </p>
            </div>
          )}
        </div>

        {/* Right: Status / admin controls */}
        <div className="space-y-6">
          <div className="glass-card rounded-xl shadow-lg p-6 border border-white border-opacity-20 bg-gradient-to-br from-white to-gray-50">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center justify-between">
              <span>Incident Status</span>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full flex items-center ${incident.status === 'resolved'
                  ? 'bg-green-100 text-green-800'
                  : incident.status === 'in_review'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-blue-100 text-blue-800'
                  }`}
              >
                {incident.status === 'resolved' ? 'Resolved' :
                  incident.status === 'in_review' ? 'Under Investigation' :
                    incident.status === 'pending' ? 'Pending' : incident.status}
              </span>
            </h2>

            {!isAdmin && (
              <p className="text-sm text-gray-600">
                Only administrators can update the status of this incident. You can view all
                details here for awareness and follow-up.
              </p>
            )}

            {isAdmin && (
              <>
                <div className="mb-4">
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Update Status
                  </label>
                  <select
                    id="status"
                    value={statusValue}
                    onChange={(e) => setStatusValue(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 text-sm"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="resolutionComment"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Resolution Notes (optional)
                  </label>
                  <textarea
                    id="resolutionComment"
                    rows={4}
                    value={resolutionComment}
                    onChange={(e) => setResolutionComment(e.target.value)}
                    placeholder="Add notes about the investigation or resolution steps..."
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    These notes will be visible to all users viewing this incident.
                  </p>
                </div>

                <button
                  onClick={handleStatusSave}
                  disabled={saving}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
          </div>

          <div className="glass-card rounded-xl shadow-lg p-4 border border-white border-opacity-20 bg-gradient-to-br from-white to-gray-50 text-sm text-gray-600">
            <p className="mb-2 font-semibold">Need to report another issue?</p>
            <Link
              to="/hazard-reporting"
              className="inline-flex items-center text-red-600 hover:text-red-800 font-medium"
            >
              Go to Hazard Reporting
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default IncidentDetail;


