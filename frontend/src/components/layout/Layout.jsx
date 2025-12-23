import { Outlet } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import SOSButton from '../sos/SOSButton';
import SOSNotification from '../sos/SOSNotification';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = () => {
  const { user } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive sidebar behavior
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      if (width < 1024) {
        setIsSidebarOpen(false);
        setIsMobile(true);
      } else {
        setIsSidebarOpen(true);
        setIsMobile(false);
      }
    };

    // Initial check
    checkScreenSize();

    // Add event listener
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar overlay for mobile */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={isMobile ? { x: -280 } : false}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={`${isMobile ? 'fixed z-50' : 'relative'} h-screen w-64`}
          >
            <Sidebar userRole={user?.role} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar user={user} toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pt-20">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* SOS Components */}
      <SOSButton />
      <SOSNotification />
    </div>
  );
};

export default Layout;