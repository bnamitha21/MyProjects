import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = ({ user, toggleSidebar, isSidebarOpen }) => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useTranslation();

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.user-menu-container')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Animated Background Gradient */}
      <div className="fixed top-0 left-0 right-0 h-20 z-40 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-gradient"></div>
      </div>
      
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-gray-900/95 backdrop-blur-2xl shadow-2xl border-b border-white/10' 
          : 'bg-gray-900/80 backdrop-blur-xl border-b border-white/5 shadow-lg'
      }`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-6">
            {/* Sidebar Toggle Button with Glow */}
            <motion.button
              onClick={toggleSidebar}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/20 text-blue-300 hover:text-white hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300 shadow-lg hover:shadow-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Toggle sidebar"
            >
              <motion.svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                animate={{ rotate: isSidebarOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isSidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </motion.svg>
            </motion.button>
            
            {/* Logo with Gradient */}
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-md opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <div className="hidden sm:block">
                <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
                  MSC
                </span>
                <p className="text-xs text-gray-400 font-medium -mt-1">Mine Safety</p>
              </div>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <motion.button 
              onClick={toggleMobileMenu}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/20 text-blue-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <motion.div
                animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isMobileMenuOpen ? (
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </motion.div>
            </motion.button>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {/* Navigation Links with Glassmorphism */}
            <div className="flex items-center space-x-2">
              <Link 
                to="/dashboard" 
                className="px-4 py-2 rounded-lg text-gray-300 hover:text-white font-medium transition-all duration-300 hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/20 hover:shadow-lg"
              >
                {t('nav.dashboard')}
              </Link>
              <Link 
                to="/hazard-reporting" 
                className="px-4 py-2 rounded-lg text-gray-300 hover:text-white font-medium transition-all duration-300 hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/20 hover:shadow-lg"
              >
                {t('nav.hazards')}
              </Link>
              <Link 
                to="/video-library" 
                className="px-4 py-2 rounded-lg text-gray-300 hover:text-white font-medium transition-all duration-300 hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/20 hover:shadow-lg"
              >
                {t('nav.training')}
              </Link>
              {(user?.role === 'worker' || user?.role === 'supervisor') && (
                <Link 
                  to="/daily-checklist" 
                  className="px-4 py-2 rounded-lg text-gray-300 hover:text-white font-medium transition-all duration-300 hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/20 hover:shadow-lg"
                >
                  {t('nav.checklists')}
                </Link>
              )}
            </div>

            <div className="hidden lg:block">
              <LanguageSwitcher />
            </div>

            {/* Notification Bell with Pulse */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/20 text-blue-300 hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <motion.span 
                className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                2
              </motion.span>
            </motion.button>

            {/* User Menu with Glassmorphism */}
            <div className="relative user-menu-container">
              <motion.button 
                onClick={toggleDropdown}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 p-2 pr-4 rounded-xl bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm border border-white/20 hover:border-white/30 transition-all duration-300 hover:shadow-lg"
              >
                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white/20">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-semibold text-white">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-400 capitalize">{user?.role || 'Worker'}</p>
                </div>
                <motion.svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 text-gray-400" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                  animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </motion.svg>
              </motion.button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, type: "spring" }}
                    className="absolute right-0 mt-3 w-56 bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl py-2 z-10 border border-white/20 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-sm font-semibold text-white">{user?.name || 'User'}</p>
                      <p className="text-xs text-gray-400">{user?.email || 'user@example.com'}</p>
                    </div>
                    <Link 
                      to="/profile" 
                      className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {t('actions.profileSettings')}
                    </Link>
                    <Link 
                      to="/preferences" 
                      className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      </svg>
                      {t('actions.preferences')}
                    </Link>
                    <div className="border-t border-white/10 my-1"></div>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full text-left px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      {t('actions.logout')}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </nav>

    {/* Mobile menu, show/hide based on menu state */}
    <AnimatePresence>
      {isMobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-20 left-0 right-0 z-40 md:hidden bg-gray-900/95 backdrop-blur-xl shadow-2xl border-t border-white/10"
        >
          <div className="px-4 pt-4 pb-3 space-y-2">
            <Link 
              to="/dashboard" 
              className="block px-4 py-3 rounded-xl text-base font-semibold text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 border border-transparent hover:border-white/20"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.dashboard')}
            </Link>
            <Link 
              to="/hazard-reporting" 
              className="block px-4 py-3 rounded-xl text-base font-semibold text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 border border-transparent hover:border-white/20"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.hazards')}
            </Link>
            <Link 
              to="/video-library" 
              className="block px-4 py-3 rounded-xl text-base font-semibold text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 border border-transparent hover:border-white/20"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.training')}
            </Link>
            <Link 
              to="/daily-checklist" 
              className="block px-4 py-3 rounded-xl text-base font-semibold text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 border border-transparent hover:border-white/20"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.checklists')}
            </Link>
            <div className="pb-3">
              <LanguageSwitcher variant="mobile" />
            </div>
          </div>
          <div className="pt-4 pb-3 border-t border-white/10 mx-4">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold ring-2 ring-white/20">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="ml-3">
                <div className="text-base font-semibold text-white">{user?.name || 'User'}</div>
                <div className="text-sm font-medium text-gray-400 capitalize">{user?.role || 'Worker'}</div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Link 
                to="/profile" 
                className="block px-4 py-3 rounded-xl text-base font-semibold text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 border border-transparent hover:border-white/20"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('actions.profileSettings')}
              </Link>
              <Link 
                to="/preferences" 
                className="block px-4 py-3 rounded-xl text-base font-semibold text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 border border-transparent hover:border-white/20"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('actions.preferences')}
              </Link>
              <button 
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-3 rounded-xl text-base font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 border border-transparent hover:border-red-500/30"
              >
                {t('actions.logout')}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </>
  );
};

export default Navbar;