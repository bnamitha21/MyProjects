import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../../utils/axiosConfig';

const WorkerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for dashboard data
  const [safetyStats, setSafetyStats] = useState({
    daysWithoutIncident: 0,
    checklistCompletionRate: 0,
    pendingHazards: 0,
    safetyScore: 0
  });

  const [upcomingTrainings, setUpcomingTrainings] = useState([]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        let pendingHazards = 0;
        let daysWithoutIncident = 45; // Default fallback value

        try {
          // Fetch hazards to count pending ones
          const hazardsResponse = await api.get('/hazards');
          pendingHazards = hazardsResponse.data.data.filter(
            hazard => hazard.status !== 'Resolved'
          ).length;

          // Fetch incidents to calculate days without incident
          const incidentsResponse = await api.get('/incidents');
          const sortedIncidents = incidentsResponse.data.data.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );

          const lastIncidentDate = sortedIncidents.length > 0
            ? new Date(sortedIncidents[0].createdAt)
            : new Date('2023-10-01'); // Fallback date if no incidents

          const today = new Date();
          daysWithoutIncident = Math.floor(
            (today - lastIncidentDate) / (1000 * 60 * 60 * 24)
          );
        } catch (apiError) {
          console.error('API error:', apiError);
          // Continue with default values if API fails
        }

        // For demo purposes, we'll use mock data for training and checklist completion
        // In a real app, these would come from API endpoints
        const checklistCompletionRate = 92;
        const safetyScore = 87;

        setSafetyStats({
          daysWithoutIncident,
          checklistCompletionRate,
          pendingHazards,
          safetyScore
        });

        // Mock training data (would come from API in real app)
        setUpcomingTrainings([
          { id: 1, title: 'Fire Safety Refresher', date: '2023-11-15', completed: false },
          { id: 2, title: 'Equipment Handling', date: '2023-11-22', completed: false },
          { id: 3, title: 'First Aid Basics', date: '2023-12-05', completed: false }
        ]);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="container-fluid section-spacing"
    >
      {/* Header with Gradient */}
      <div className="relative overflow-hidden rounded-xl mb-6 sm:mb-8 bg-gradient-to-r from-primary-600 to-primary-400 p-4 sm:p-8 text-white">
        <div className="absolute top-0 left-0 w-full h-full bg-white opacity-5">
          <div className="absolute top-0 left-0 w-full h-full"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z\' fill=\'%23ffffff\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' }}></div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Worker Dashboard</h1>
          <p className="text-lg sm:text-xl text-white text-opacity-90">Welcome back, <span className="font-semibold">{user?.name || 'Worker'}</span>!</p>
        </motion.div>
      </div>

      {/* Safety Stats */}
      <motion.div
        variants={containerVariants}
        className="responsive-grid mb-6 sm:mb-8"
      >
        <motion.div
          variants={itemVariants}
          className="glass-card rounded-xl shadow-lg p-4 sm:p-6 border border-white border-opacity-20 bg-gradient-to-br from-white to-gray-50 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
        >
          <div className="flex items-center mb-3">
            <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-gray-700 font-medium text-sm sm:text-base">Days Without Incident</h3>
          </div>
          <p className="text-3xl sm:text-4xl font-bold text-green-600">{safetyStats.daysWithoutIncident}</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Keep up the good work!</p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="glass-card rounded-xl shadow-lg p-4 sm:p-6 border border-white border-opacity-20 bg-gradient-to-br from-white to-gray-50 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
        >
          <div className="flex items-center mb-3">
            <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-gray-700 font-medium text-sm sm:text-base">Checklist Completion</h3>
          </div>
          <div className="relative pt-1">
            <div className="overflow-hidden h-2 mb-2 text-xs flex rounded bg-blue-100">
              <div style={{ width: `${safetyStats.checklistCompletionRate}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-500"></div>
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-bold text-blue-600">{safetyStats.checklistCompletionRate}%</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Daily safety checks</p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="glass-card rounded-xl shadow-lg p-4 sm:p-6 border border-white border-opacity-20 bg-gradient-to-br from-white to-gray-50 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
        >
          <div className="flex items-center mb-3">
            <div className="p-2 rounded-full bg-yellow-100 text-yellow-600 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-gray-700 font-medium text-sm sm:text-base">Pending Hazards</h3>
          </div>
          <p className="text-3xl sm:text-4xl font-bold text-yellow-600">{safetyStats.pendingHazards}</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Requiring attention</p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="glass-card rounded-xl shadow-lg p-4 sm:p-6 border border-white border-opacity-20 bg-gradient-to-br from-white to-gray-50 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
        >
          <div className="flex items-center mb-3">
            <div className="p-2 rounded-full bg-indigo-100 text-indigo-600 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-gray-700 font-medium text-sm sm:text-base">Safety Score</h3>
          </div>
          <div className="relative pt-1">
            <div className="overflow-hidden h-2 mb-2 text-xs flex rounded bg-indigo-100">
              <div style={{ width: `${safetyStats.safetyScore}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600 transition-all duration-500"></div>
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-bold text-indigo-600">{safetyStats.safetyScore}<span className="text-lg">/100</span></p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Overall performance</p>
        </motion.div>
      </motion.div>

      {/* Quick Actions - icon-first, large tiles */}
      <motion.div
        variants={itemVariants}
        className="glass-card rounded-2xl shadow-xl p-4 sm:p-6 border border-white/30 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 mb-6 sm:mb-8 text-white"
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">Tap an action</h2>
          </div>
          <p className="hidden sm:block text-xs text-gray-300">Big buttons for faster work</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Link
            to="/hazard-reporting"
            className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-red-600 to-orange-500 p-3 sm:p-4 hover-lift focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
          >
            <span className="inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/20 text-white text-2xl">
              !
            </span>
            <span className="text-xs sm:text-sm font-semibold text-center">Hazard</span>
          </Link>

          <Link
            to="/daily-checklist"
            className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 p-3 sm:p-4 hover-lift focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400"
          >
            <span className="inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/20 text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </span>
            <span className="text-xs sm:text-sm font-semibold text-center">Checklist</span>
          </Link>

          <Link
            to="/video-library"
            className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 p-3 sm:p-4 hover-lift focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400"
          >
            <span className="inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/20 text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </span>
            <span className="text-xs sm:text-sm font-semibold text-center">Videos</span>
          </Link>

          <Link
            to="/incident-library"
            className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 p-3 sm:p-4 hover-lift focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400"
          >
            <span className="inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/20 text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </span>
            <span className="text-xs sm:text-sm font-semibold text-center">Incidents</span>
          </Link>
        </div>
      </motion.div>

      {/* Upcoming Trainings */}
      <motion.div
        variants={itemVariants}
        className="glass-card rounded-xl shadow-lg p-4 sm:p-8 border border-white border-opacity-20 bg-gradient-to-br from-white to-gray-50"
      >
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Upcoming Trainings
        </h2>
        {upcomingTrainings.length > 0 ? (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 rounded-tl-lg">Training</th>
                  <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Date</th>
                  <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 rounded-tr-lg">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {upcomingTrainings.map((training, index) => (
                  <motion.tr
                    key={training.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">{training.title}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{training.date}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className="px-2 sm:px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                        Upcoming
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4 sm:p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 sm:h-12 w-8 sm:w-12 mx-auto text-gray-400 mb-3 sm:mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500 text-base sm:text-lg">No upcoming trainings scheduled.</p>
            <button className="mt-3 sm:mt-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-600 text-white text-sm sm:text-base rounded-lg hover:bg-primary-700 transition-colors duration-300">
              View Training Calendar
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default WorkerDashboard;