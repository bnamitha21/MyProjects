import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const Sidebar = ({ userRole, isOpen, onClose }) => {
  const { t } = useTranslation();
  // Define navigation items based on user role
  const navItems = [
    { to: '/dashboard', labelKey: 'nav.dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', roles: ['employee', 'supervisor', 'admin', 'dgms_officer'] },
    { to: '/profile', labelKey: 'nav.profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', roles: ['employee', 'supervisor', 'admin', 'dgms_officer'] },
    { to: '/gas-detection', labelKey: 'nav.gasDetection', icon: 'M13 10V3L4 14h7v7l9-11h-7z', roles: ['employee', 'supervisor'] },
    { to: '/mine-visualization', labelKey: 'nav.mineView', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9', roles: ['supervisor', 'admin', 'dgms_officer'] },
    { to: '/daily-checklist', labelKey: 'nav.safetyChecklist', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', roles: ['employee', 'supervisor'] },
    { to: '/video-library', labelKey: 'nav.videoLibrary', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', roles: ['employee'] },
    { to: '/hazard-reporting', labelKey: 'nav.reportHazard', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', roles: ['employee', 'supervisor'] },
    { to: '/incident-library', labelKey: 'nav.incidentLibrary', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', roles: ['employee', 'supervisor', 'admin', 'dgms_officer'] },
    { to: '/case-studies', labelKey: 'nav.caseStudies', icon: 'M4 6h16M4 12h16M4 18h16M8 6v12m8-12v12', roles: ['employee', 'dgms_officer'] },
    { to: '/supervisor-dashboard', labelKey: 'nav.supervisorPanel', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', roles: ['supervisor', 'dgms_officer'] },
    { to: '/admin-dashboard', labelKey: 'nav.adminPanel', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', roles: ['admin', 'dgms_officer'] },
    
    // Admin Pages
    { to: '/admin/user-management', labelKey: 'nav.userManagement', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', roles: ['admin', 'dgms_officer'] },
    { to: '/admin/reports', labelKey: 'nav.reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', roles: ['admin', 'dgms_officer'] },
    { to: '/admin/sos-alerts', labelKey: 'nav.sosAlerts', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', roles: ['admin', 'dgms_officer'] },
  ];

  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(userRole || 'employee')
  );

  console.log('Sidebar - userRole:', userRole);
  console.log('Sidebar - filteredNavItems:', filteredNavItems);

  return (
    <motion.div 
      className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white w-full h-full flex flex-col shadow-2xl overflow-hidden"
      initial={{ opacity: 0.9, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, type: "spring" }}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-gradient"></div>
      </div>
      
      {/* Glowing Border */}
      <div className="absolute inset-0 border-r-2 border-gradient-to-b from-blue-500/50 via-purple-500/50 to-pink-500/50"></div>
      <div className="relative flex items-center justify-between h-20 px-6 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur-md opacity-75"></div>
            <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg shadow-xl">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <div>
            <span className="text-2xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">MSC</span>
            <p className="text-[10px] text-gray-400 font-medium -mt-1 tracking-wider">SAFETY FIRST</p>
          </div>
        </div>
        <motion.button
          onClick={onClose}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          className="lg:hidden p-2 bg-red-500/20 hover:bg-red-500/30 rounded-xl transition-all duration-300 border border-red-500/30 text-red-400 hover:text-red-300 shadow-lg"
          aria-label="Close sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.button>
      </div>
      
      <div className="relative overflow-y-auto flex-grow py-6 px-4 pt-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        <nav className="space-y-2">
          {filteredNavItems.map((item, index) => (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `group relative flex items-center space-x-4 py-3.5 px-4 rounded-xl transition-all duration-300 overflow-hidden ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl shadow-blue-500/30' 
                      : 'text-gray-400 hover:text-white hover:bg-white/10 hover:shadow-lg'
                  }`
                }
              >
                {/* Animated Background on Hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="relative h-5 w-5 group-hover:scale-110 transition-transform duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={item.icon}
                  />
                </svg>
                
                {/* Label */}
                <span className="relative font-semibold text-sm tracking-wide">{t(item.labelKey)}</span>
                
                {/* Active Indicator */}
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    isActive
                      ? 'absolute right-4 w-2 h-2 bg-white rounded-full shadow-lg shadow-white/50'
                      : 'hidden'
                  }
                />
              </NavLink>
            </motion.div>
          ))}
        </nav>
      </div>
      
      <div className="relative p-6 border-t border-white/10 mt-auto bg-gradient-to-t from-black/20 to-transparent backdrop-blur-sm">
        <motion.div 
          className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/20 overflow-hidden shadow-xl"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          {/* Animated Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-50"></div>
          
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-sm text-white">MSC Platform</p>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-2">Mine Safety Companion</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Version 1.0.0</span>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-[10px] font-semibold border border-green-500/30">ACTIVE</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Sidebar;