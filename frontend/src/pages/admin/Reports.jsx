import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';

const Reports = () => {
  const [reportType, setReportType] = useState('safety');
  const [timeRange, setTimeRange] = useState('month');
  const [activeTab, setActiveTab] = useState('charts');
  const [isExporting, setIsExporting] = useState(false);

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

  // Mock data for demonstration
  const safetyData = [
    { name: 'Week 1', incidents: 5, hazards: 12, resolved: 10 },
    { name: 'Week 2', incidents: 3, hazards: 8, resolved: 7 },
    { name: 'Week 3', incidents: 7, hazards: 15, resolved: 12 },
    { name: 'Week 4', incidents: 2, hazards: 10, resolved: 9 },
  ];

  const userActivityData = [
    { name: 'Week 1', logins: 120, checklists: 85, reports: 15 },
    { name: 'Week 2', logins: 150, checklists: 95, reports: 20 },
    { name: 'Week 3', logins: 135, checklists: 90, reports: 18 },
    { name: 'Week 4', logins: 160, checklists: 110, reports: 25 },
  ];

  const complianceData = [
    { name: 'Completed', value: 85 },
    { name: 'Pending', value: 10 },
    { name: 'Overdue', value: 5 },
  ];
  
  // Colors for charts
  const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

  // New trend data for area chart
  const trendData = [
    { name: 'Jan', value: 65 },
    { name: 'Feb', value: 72 },
    { name: 'Mar', value: 68 },
    { name: 'Apr', value: 75 },
    { name: 'May', value: 80 },
    { name: 'Jun', value: 82 },
    { name: 'Jul', value: 85 },
    { name: 'Aug', value: 87 },
    { name: 'Sep', value: 84 },
    { name: 'Oct', value: 88 },
    { name: 'Nov', value: 90 },
    { name: 'Dec', value: 92 },
  ];

  const handleExportReport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert('Report exported successfully!');
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="p-6 bg-gray-50 rounded-lg shadow-md mt-12"
    >
      {/* Header with Animated Gradient */}
      <div className="relative overflow-hidden rounded-xl mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
        <div className="absolute top-0 left-0 w-full h-full bg-white opacity-5">
          <div
  className="absolute top-0 left-0 w-full h-full"
  style={{
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover'
  }}
>

          </div>

        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
          <p className="text-white text-opacity-90 text-lg">Comprehensive data visualization and insights</p>
        </motion.div>
      </div>
      
      {/* Tabs Navigation */}
      <div className="flex mb-6 border-b border-gray-200 mt-8">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-4 py-2 font-medium text-sm ${activeTab === 'charts' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('charts')}
        >
          Charts & Visualizations
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-4 py-2 font-medium text-sm ${activeTab === 'tables' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('tables')}
        >
          Data Tables
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-4 py-2 font-medium text-sm ${activeTab === 'trends' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('trends')}
        >
          Trends & Forecasts
        </motion.button>
      </div>
      
      {/* Filters and Controls */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 bg-white p-4 rounded-lg shadow-sm"
      >
        <motion.div variants={itemVariants} className="flex items-center space-x-2 mb-4 md:mb-0">
          <span className="text-gray-700 font-medium">Report Type:</span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setReportType('safety')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${reportType === 'safety' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Safety
            </button>
            <button
              onClick={() => setReportType('user')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${reportType === 'user' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              User Activity
            </button>
            <button
              onClick={() => setReportType('compliance')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${reportType === 'compliance' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Compliance
            </button>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-gray-700 font-medium">Time Range:</span>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-1.5 bg-gray-100 border-0 rounded-md text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExportReport}
            disabled={isExporting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Export Report</span>
              </>
            )}
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Main Content Area - Conditional based on activeTab */}
      <AnimatePresence mode="wait">
        {activeTab === 'charts' && (
          <motion.div
            key="charts"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Summary Cards with Animations */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-white p-5 rounded-lg shadow-sm mb-6"
            >
              <motion.h2 variants={itemVariants} className="text-xl font-semibold mb-4">Summary</motion.h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {reportType === 'safety' && (
                  <>
                    <motion.div 
                      variants={itemVariants}
                      whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                      className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-lg shadow-sm border border-blue-100"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-800">Total Incidents</h3>
                        <div className="p-2 bg-blue-100 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-blue-600 mt-2">17</p>
                      <div className="flex items-center mt-2">
                        <span className="text-sm text-green-600 font-medium flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                          12% 
                        </span>
                        <span className="text-sm text-gray-500 ml-2">vs last period</span>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      variants={itemVariants}
                      whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                      className="bg-gradient-to-br from-amber-50 to-white p-6 rounded-lg shadow-sm border border-amber-100"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-800">Hazards Reported</h3>
                        <div className="p-2 bg-amber-100 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-amber-600 mt-2">45</p>
                      <div className="flex items-center mt-2">
                        <span className="text-sm text-green-600 font-medium flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                          8% 
                        </span>
                        <span className="text-sm text-gray-500 ml-2">vs last period</span>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      variants={itemVariants}
                      whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                      className="bg-gradient-to-br from-green-50 to-white p-6 rounded-lg shadow-sm border border-green-100"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-800">Resolution Rate</h3>
                        <div className="p-2 bg-green-100 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-green-600 mt-2">84%</p>
                      <div className="flex items-center mt-2">
                        <span className="text-sm text-green-600 font-medium flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                          5% 
                        </span>
                        <span className="text-sm text-gray-500 ml-2">vs last period</span>
                      </div>
                    </motion.div>
                  </>
                )}
                
                {reportType === 'user' && (
                  <>
                    <motion.div 
                      variants={itemVariants}
                      whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                      className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-lg shadow-sm border border-indigo-100"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-800">Total Logins</h3>
                        <div className="p-2 bg-indigo-100 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-indigo-600 mt-2">565</p>
                      <div className="flex items-center mt-2">
                        <span className="text-sm text-green-600 font-medium flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                          15% 
                        </span>
                        <span className="text-sm text-gray-500 ml-2">vs last period</span>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      variants={itemVariants}
                      whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                      className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-lg shadow-sm border border-purple-100"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-800">Checklists Completed</h3>
                        <div className="p-2 bg-purple-100 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-purple-600 mt-2">380</p>
                      <div className="flex items-center mt-2">
                        <span className="text-sm text-green-600 font-medium flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                          22% 
                        </span>
                        <span className="text-sm text-gray-500 ml-2">vs last period</span>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      variants={itemVariants}
                      whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                      className="bg-gradient-to-br from-cyan-50 to-white p-6 rounded-lg shadow-sm border border-cyan-100"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-800">Active Users</h3>
                        <div className="p-2 bg-cyan-100 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-cyan-600 mt-2">78%</p>
                      <div className="flex items-center mt-2">
                        <span className="text-sm text-green-600 font-medium flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                          7% 
                        </span>
                        <span className="text-sm text-gray-500 ml-2">vs last period</span>
                      </div>
                    </motion.div>
                  </>
                )}
                
                {reportType === 'compliance' && (
                  <>
                    <motion.div 
                      variants={itemVariants}
                      whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                      className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-lg shadow-sm border border-emerald-100"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-800">Compliance Rate</h3>
                        <div className="p-2 bg-emerald-100 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-emerald-600 mt-2">85%</p>
                      <div className="flex items-center mt-2">
                        <span className="text-sm text-green-600 font-medium flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                          3% 
                        </span>
                        <span className="text-sm text-gray-500 ml-2">vs last period</span>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      variants={itemVariants}
                      whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                      className="bg-gradient-to-br from-yellow-50 to-white p-6 rounded-lg shadow-sm border border-yellow-100"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-800">Pending Tasks</h3>
                        <div className="p-2 bg-yellow-100 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-yellow-600 mt-2">10%</p>
                      <div className="flex items-center mt-2">
                        <span className="text-sm text-red-600 font-medium flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                          5% 
                        </span>
                        <span className="text-sm text-gray-500 ml-2">vs last period</span>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      variants={itemVariants}
                      whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                      className="bg-gradient-to-br from-red-50 to-white p-6 rounded-lg shadow-sm border border-red-100"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-800">Overdue Tasks</h3>
                        <div className="p-2 bg-red-100 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-red-600 mt-2">5%</p>
                      <div className="flex items-center mt-2">
                        <span className="text-sm text-green-600 font-medium flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                          2% 
                        </span>
                        <span className="text-sm text-gray-500 ml-2">vs last period</span>
                      </div>
                    </motion.div>
                  </>
                )}
              </div>
            </motion.div>

            {/* Interactive Charts with Animations */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-white p-6 rounded-lg shadow-sm mb-6"
            >
              <motion.div variants={itemVariants} className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  {reportType === 'safety' && 'Safety Incidents Report'}
                  {reportType === 'user' && 'User Activity Report'}
                  {reportType === 'compliance' && 'Compliance Report'}
                </h2>
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </motion.button>
                </div>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                className="h-80 bg-gray-50 p-4 rounded-lg"
              >
                {reportType === 'safety' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={safetyData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fill: '#6B7280' }} />
                      <YAxis tick={{ fill: '#6B7280' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                          border: 'none'
                        }} 
                      />
                      <Legend wrapperStyle={{ paddingTop: '10px' }} />
                      <Bar dataKey="incidents" fill="#3B82F6" name="Incidents" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="hazards" fill="#10B981" name="Hazards Reported" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="resolved" fill="#F59E0B" name="Issues Resolved" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {reportType === 'user' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={userActivityData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fill: '#6B7280' }} />
                      <YAxis tick={{ fill: '#6B7280' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                          border: 'none'
                        }} 
                      />
                      <Legend wrapperStyle={{ paddingTop: '10px' }} />
                      <Bar dataKey="logins" fill="#6366F1" name="User Logins" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="checklists" fill="#8B5CF6" name="Checklists Completed" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="reports" fill="#EC4899" name="Reports Submitted" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {reportType === 'compliance' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={complianceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        animationBegin={0}
                        animationDuration={1500}
                      >
                        {complianceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                          border: 'none'
                        }} 
                      />
                      <Legend 
                        layout="horizontal" 
                        verticalAlign="bottom" 
                        align="center"
                        wrapperStyle={{ paddingTop: '20px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'tables' && (
          <motion.div
            key="tables"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-6 rounded-lg shadow-sm mb-6"
          >
            <h2 className="text-xl font-semibold mb-6">Detailed Data</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {reportType === 'safety' && (
                      <>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Week</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Incidents</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hazards</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolved</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolution Rate</th>
                      </>
                    )}
                    
                    {reportType === 'user' && (
                      <>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Week</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logins</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Checklists</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reports</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engagement Rate</th>
                      </>
                    )}
                    
                    {reportType === 'compliance' && (
                      <>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportType === 'safety' && safetyData.map((week, index) => (
                    <motion.tr 
                      key={week.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{week.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{week.incidents}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{week.hazards}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{week.resolved}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {Math.round((week.resolved / week.hazards) * 100)}%
                      </td>
                    </motion.tr>
                  ))}
                  
                  {reportType === 'user' && userActivityData.map((week, index) => (
                    <motion.tr 
                      key={week.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{week.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{week.logins}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{week.checklists}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{week.reports}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {Math.round(((week.checklists + week.reports) / week.logins) * 100)}%
                      </td>
                    </motion.tr>
                  ))}
                  
                  {reportType === 'compliance' && complianceData.map((item, index) => (
                    <motion.tr 
                      key={item.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.value}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {Math.round((item.value / complianceData.reduce((acc, curr) => acc + curr.value, 0)) * 100)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.name === 'Completed' ? 'bg-green-100 text-green-800' : 
                          item.name === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>

                          {item.name === 'Completed' ? '+3%' : 
                           item.name === 'Pending' ? '-2%' : 
                           '-1%'}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'trends' && (
          <motion.div
            key="trends"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-6 rounded-lg shadow-sm mb-6"
          >
            <h2 className="text-xl font-semibold mb-6">Trends & Forecasts</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Annual Trend</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={trendData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" tick={{ fill: '#6B7280' }} />
                      <YAxis tick={{ fill: '#6B7280' }} />
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                          border: 'none'
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#3B82F6" 
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                        activeDot={{ r: 8 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Performance Metrics</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={reportType === 'safety' ? safetyData : userActivityData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fill: '#6B7280' }} />
                      <YAxis tick={{ fill: '#6B7280' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                          border: 'none'
                        }} 
                      />
                      <Legend />
                      {reportType === 'safety' ? (
                        <>
                          <Line type="monotone" dataKey="incidents" stroke="#3B82F6" activeDot={{ r: 8 }} />
                          <Line type="monotone" dataKey="resolved" stroke="#10B981" />
                        </>
                      ) : (
                        <>
                          <Line type="monotone" dataKey="logins" stroke="#6366F1" activeDot={{ r: 8 }} />
                          <Line type="monotone" dataKey="checklists" stroke="#8B5CF6" />
                        </>
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
              <h3 className="text-lg font-medium text-blue-800 mb-2">Forecast Insights</h3>
              <p className="text-blue-700 mb-4">Based on current trends, we predict the following outcomes for the next quarter:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">
                      {reportType === 'safety' ? 'Incident Reduction' : 
                       reportType === 'user' ? 'User Growth' : 
                       'Compliance Improvement'}
                    </span>
                    <span className="text-green-600 font-medium">+12%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '72%' }}></div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">
                      {reportType === 'safety' ? 'Resolution Speed' : 
                       reportType === 'user' ? 'Engagement Rate' : 
                       'Task Completion'}
                    </span>
                    <span className="text-green-600 font-medium">+8%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">
                      {reportType === 'safety' ? 'Preventive Measures' : 
                       reportType === 'user' ? 'Reporting Accuracy' : 
                       'Regulatory Adherence'}
                    </span>
                    <span className="text-green-600 font-medium">+15%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};


export default Reports;