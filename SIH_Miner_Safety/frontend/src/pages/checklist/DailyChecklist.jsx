import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { logBehaviorEvent } from '../../utils/behaviorTracker';
import { getFallbackChecklist } from '../../data/checklistTemplates';

const DailyChecklist = () => {
  const { user } = useContext(AuthContext);
  const [checklist, setChecklist] = useState({
    items: [],
    date: new Date().toISOString().split('T')[0],
    isLoading: true,
    error: null,
    userOperationRole: null // Initialize userOperationRole in state
  });
  const [showTips, setShowTips] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [totalPointsEarned, setTotalPointsEarned] = useState(0);
  const [lastPointsAwarded, setLastPointsAwarded] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const sessionStartRef = useRef(Date.now());
  const viewLoggedRef = useRef(false);

  // Motivational messages based on progress
  const getMotivationalMessage = (progress) => {
    if (progress === 0) return "Let's get started! 💪";
    if (progress < 25) return "Great start! Keep going! 🚀";
    if (progress < 50) return "You're making progress! 🌟";
    if (progress < 75) return "Almost halfway there! 🎯";
    if (progress < 100) return "So close! Finish strong! 🔥";
    return "Perfect! All done! 🎉";
  };

  // Check if user has access to checklist (only employees and supervisors)
  useEffect(() => {
    console.log('DailyChecklist - User object from AuthContext:', user);
    if (user && !['employee', 'supervisor', 'admin', 'dgms_officer'].includes(user.role)) {
      setChecklist(prev => ({
        ...prev,
        isLoading: false,
        error: 'Checklist is not available for your role.'
      }));
    }
  }, [user]);

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

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: { scale: 0.95 }
  };


  useEffect(() => {
    const fetchChecklist = async () => {
      // Handle both _id and id properties from user object
      const userId = user?._id || user?.id;

      if (!user || !userId) {
        setChecklist(prev => ({
          ...prev,
          isLoading: false,
          error: 'User not authenticated. Please log in to view your checklist.'
        }));
        return;
      }

      // Remove this block as backend now handles access for all roles
      // if (!['employee', 'supervisor'].includes(user.role)) {
      //   setChecklist(prev => ({
      //     ...prev,
      //     isLoading: false,
      //     error: 'Checklist is only available for employees and supervisors.'
      //   }));
      //   return;
      // }

      try {
        // Fetch role-based checklist from backend
        const token = localStorage.getItem('token');

        if (!token) {
          setChecklist(prev => ({
            ...prev,
            isLoading: false,
            error: 'No authentication token found. Please log in again.'
          }));
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/checklist/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.data.success) {
          setChecklist({
            items: response.data.data.items.map(item => ({ // Ensure all item properties are copied
              ...item,
              pointsAwarded: item.pointsAwarded || 0,
              isChallenge: item.isChallenge || false,
              associatedContent: item.associatedContent || null,
            })),
            date: new Date(response.data.data.date).toISOString().split('T')[0],
            checklistId: response.data.data._id,
            userRole: response.data.userRole,
            userOperationRole: response.data.userOperationRole, // Store operation role
            completionBonus: response.data.data.completionBonus,
            type: response.data.data.type,
            isLoading: false,
            error: null,
            isFallback: false
          });
          if (!viewLoggedRef.current) {
            logBehaviorEvent('checklist_viewed', {
              checklistId: response.data.data._id,
              totalItems: response.data.data.items.length,
              role: response.data.userRole,
              date: response.data.data.date,
              type: response.data.data.type, // Log checklist type
              operationRole: response.data.userOperationRole, // Log operation role
            });
            viewLoggedRef.current = true;
          }
        }
      } catch (error) {
        console.error('Error fetching checklist:', error);

        // Use fallback checklist data if backend is unavailable
        const userRole = user?.role || 'employee';
        const userOperationRole = user?.operationRole || null; // Get operation role for fallback
        const currentUserId = user?._id || user?.id || 'guest';

        // Check localStorage for previously saved fallback checklist
        const today = new Date().toISOString().split('T')[0];
        const fallbackKey = `checklist_fallback_${currentUserId}_${today}`;
        const savedFallback = localStorage.getItem(fallbackKey);

        let fallbackChecklist;
        if (savedFallback) {
          try {
            fallbackChecklist = JSON.parse(savedFallback);
            console.log('Loaded saved fallback checklist from localStorage');
          } catch (e) {
            console.error('Error parsing saved fallback checklist:', e);
            fallbackChecklist = getFallbackChecklist(userRole, userOperationRole);
          }
        } else {
          fallbackChecklist = getFallbackChecklist(userRole, userOperationRole);
        }

        setChecklist({
          items: fallbackChecklist.items.map(item => ({ // Ensure all item properties are copied
            ...item,
            pointsAwarded: item.pointsAwarded || 0,
            isChallenge: item.isChallenge || false,
            associatedContent: item.associatedContent || null,
          })) || fallbackChecklist.items,
          date: fallbackChecklist.date ? new Date(fallbackChecklist.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          checklistId: fallbackChecklist._id || 'fallback-checklist',
          userRole: userRole,
          userOperationRole: userOperationRole, // Store operation role in fallback
          completionBonus: fallbackChecklist.completionBonus || 0,
          type: fallbackChecklist.type || 'daily',
          isLoading: false,
          error: null,
          isFallback: true // Flag to indicate this is fallback data
        });

        toast.warning('Using offline checklist. Some features may be limited.');
        // console.log('Using fallback checklist data for role:', userRole);
      }
    };

    fetchChecklist();

    // Load streak from localStorage
    const savedStreak = localStorage.getItem(`checklist_streak_${user?._id || user?.id}`);
    if (savedStreak) {
      setStreak(parseInt(savedStreak, 10));
    }
  }, [user]);

  useEffect(() => {
    console.log('DailyChecklist - Checklist state:', checklist);
  }, [checklist]);

  const handleCheckItem = async (itemId) => {
    try {
      setIsSaving(true);
      // Get the current state of the item
      const currentItem = checklist.items.find(item => item._id === itemId);
      const newCompletedState = !currentItem.completed;

      // Update UI optimistically
      setChecklist(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item._id === itemId ? {
            ...item,
            completed: newCompletedState,
            completedAt: newCompletedState ? new Date() : null,
            pointsAwarded: item.pointsAwarded // Ensure points are retained on update
          } : item
        )
      }));

      // If using fallback data, skip backend update
      if (checklist.isFallback) {
        // Store in localStorage for persistence
        const currentUserId = user?._id || user?.id || 'guest';
        const fallbackKey = `checklist_fallback_${currentUserId}_${checklist.date}`;
        const updatedChecklist = {
          ...checklist,
          items: checklist.items.map(item =>
            item._id === itemId ? {
              ...item,
              completed: newCompletedState,
              completedAt: newCompletedState ? new Date() : null,
              pointsAwarded: item.pointsAwarded // Ensure points are retained on update
            } : item
          )
        };
        localStorage.setItem(fallbackKey, JSON.stringify(updatedChecklist));
        toast.info('Checklist updated locally (offline mode)');
        setIsSaving(false);
        return;
      }

      // Update the backend
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/checklist/complete`,
        {
          checklistId: checklist.checklistId,
          itemId: itemId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        // Show success message
        toast.success(response.data.message);
        setIsSaving(false);
        logBehaviorEvent('checklist_item_completed', {
          checklistId: checklist.checklistId,
          itemId,
          task: currentItem.task,
          category: currentItem.category,
          completed: newCompletedState,
          totalItems: checklist.items.length,
        });

        const isPPEItem = (currentItem.category || '').toLowerCase().includes('ppe') ||
          (currentItem.task || '').toLowerCase().includes('ppe');
        if (isPPEItem) {
          logBehaviorEvent(newCompletedState ? 'ppe_confirmed' : 'ppe_skipped', {
            checklistId: checklist.checklistId,
            itemId,
            task: currentItem.task,
          });
        }

        // Check if this was the last item to complete
        const updatedItems = checklist.items.map(item =>
          item._id === itemId ? { ...item, completed: newCompletedState } : item
        );

        if (newCompletedState && updatedItems.every(item => item.completed)) {
          // Trigger enhanced confetti for completing all items
          setShowCelebration(true);

          // Fire multiple confetti bursts
          const duration = 3000;
          const animationEnd = Date.now() + duration;
          const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

          function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
          }

          const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
              clearInterval(interval);
              setShowCelebration(false);
              return;
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
          }, 250);

          // Update streak
          const newStreak = streak + 1;
          setStreak(newStreak);
          localStorage.setItem(`checklist_streak_${user?._id || user?.id}`, newStreak.toString());
          localStorage.setItem(`last_checklist_date_${user?._id || user?.id}`, new Date().toISOString().split('T')[0]);
        }
      }
    } catch (error) {
      console.error('Error updating checklist item:', error);

      // If using fallback mode, the update already happened locally
      if (checklist.isFallback) {
        // Already handled in the fallback section above
        return;
      }

      // Revert the optimistic update (only for backend mode)
      setChecklist(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item._id === itemId ? { ...item, completed: !item.completed } : item
        )
      }));
      setIsSaving(false);
      toast.error(error.response?.data?.message || 'Failed to update checklist item');
    }
  };

  const calculateProgress = () => {
    if (checklist.items.length === 0) return 0;
    const completedItems = checklist.items.filter(item => item.completed).length;
    return Math.round((completedItems / checklist.items.length) * 100);
  };

  // Show error if user doesn't have access (updated to allow all roles)
  if (checklist.error && !['employee', 'supervisor', 'admin', 'dgms_officer'].includes(user?.role)) {
    return (
      <div className="container mx-auto px-4 py-8 mt-10">
        <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-bold text-red-800">Access Restricted</h2>
          </div>
          <p className="text-red-700 mb-4">{checklist.error}</p>
          <p className="text-sm text-red-600">
            The safety checklist is not available for your role.
            If you believe this is an error, please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  if (checklist.isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (checklist.error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
        <p className="text-red-700">{checklist.error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <motion.div
      className="container mx-auto px-4 py-6 mt-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 border border-gray-100"
        whileHover={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="p-2 rounded-full bg-primary-100 text-primary-600 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Daily Safety Checklist</h1>
              {checklist.userRole && (
                <p className="text-sm text-gray-600 mt-1">
                  Role: <span className="font-semibold capitalize">{checklist.userRole.replace('_', ' ')}</span>
                  {checklist.userOperationRole && (
                    <span className="ml-3 px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 capitalize">
                      {checklist.userOperationRole.replace('_', ' ')}
                    </span>
                  )}
                  {checklist.type &&
                    <span className="ml-3 px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700 capitalize">
                      {checklist.type} Checklist
                    </span>
                  }
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Streak Tracker */}
            {streak > 0 && (
              <motion.div
                className="flex items-center bg-gradient-to-r from-orange-50 to-yellow-50 px-4 py-2 rounded-lg border border-orange-200"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-xs text-orange-600 font-medium">🔥 Streak</p>
                  <p className="text-lg font-bold text-orange-700">{streak} {streak === 1 ? 'day' : 'days'}</p>
                </div>
              </motion.div>
            )}

            <div className="flex items-center bg-primary-50 px-4 py-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Date: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar with Motivational Message */}
        <motion.div
          className="mb-4 bg-white p-6 rounded-lg shadow-sm border border-gray-100"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Circular Progress */}
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24">
                <svg className="transform -rotate-90 w-24 h-24">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#E5E7EB"
                    strokeWidth="8"
                    fill="none"
                  />
                  <motion.circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={{
                      strokeDashoffset: 251.2 - (251.2 * calculateProgress()) / 100,
                      strokeDasharray: "251.2"
                    }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-700">{calculateProgress()}%</span>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="font-medium text-gray-700">Completion Progress</span>
                </div>
                <motion.p
                  className="text-lg font-semibold text-primary-600"
                  key={calculateProgress()}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {getMotivationalMessage(calculateProgress())}
                </motion.p>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mt-3">
                  <motion.div
                    className="bg-gradient-to-r from-primary-500 to-green-500 h-3 rounded-full"
                    style={{ width: `${calculateProgress()}%` }}
                    initial={{ width: "0%" }}
                    animate={{ width: `${calculateProgress()}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">
                    {checklist.items.filter(i => i.completed).length} of {checklist.items.length} completed
                  </span>
                  <span className="text-xs text-gray-500">
                    {checklist.items.length - checklist.items.filter(i => i.completed).length} remaining
                  </span>
                </div>
              </div>
            </div>
          </div>

          {checklist.completionBonus > 0 && (
            <motion.div
              className="mt-4 text-center text-sm font-medium text-green-700 bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-md border border-green-200"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-2 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Complete all tasks to earn <span className="font-bold">{checklist.completionBonus} bonus points!</span> 🎁
            </motion.div>
          )}
        </motion.div>

        {/* Checklist Items */}
        <motion.ul
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {checklist.items.map((item, index) => (
            <motion.li
              key={item._id}
              variants={itemVariants}
              className={`p-5 border rounded-lg transition-all transform hover:scale-[1.01] ${item.completed
                ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200 shadow-sm'
                : item.isChallenge
                  ? 'bg-gradient-to-r from-yellow-50 to-orange-100 border-orange-200 shadow-md ring-2 ring-orange-300'
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-start">
                <div className="relative mt-1">
                  <input
                    id={item._id}
                    type="checkbox"
                    checked={item.completed || false}
                    onChange={() => handleCheckItem(item._id)}
                    className="h-6 w-6 text-primary-600 rounded-md focus:ring-primary-500 border-gray-300 cursor-pointer"
                  />
                  {item.completed && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, type: "spring" }}
                      className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <label
                    htmlFor={item._id}
                    className={`text-base font-medium cursor-pointer block ${item.completed ? 'line-through text-gray-500' : 'text-gray-700'
                      }`}
                  >
                    {item.task}
                  </label>
                  <div className="flex items-center mt-1 space-x-2">
                    {item.category && (
                      <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                        {item.category}
                      </span>
                    )}
                    {item.type && item.type !== 'routine' && (
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${item.type === 'challenge' ? 'bg-purple-100 text-purple-700' : 'bg-yellow-100 text-yellow-700'
                        } capitalize`}>
                        {item.type}
                      </span>
                    )}
                    {item.pointsAwarded > 0 && (
                      <span className="inline-block px-2 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700">
                        +{item.pointsAwarded} pts
                      </span>
                    )}
                    {item.associatedContent && (
                      <a
                        href={item.associatedContent.url || `/app/${item.associatedContent.type}/${item.associatedContent.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-700 hover:bg-primary-200"
                      >
                        {item.associatedContent.type === 'video' &&
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        }
                        {item.associatedContent.type === 'caseStudy' &&
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253" />
                          </svg>
                        }
                        {item.associatedContent.type === 'hazard' &&
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        }
                        {item.associatedContent.type === 'document' &&
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        }
                        View {item.associatedContent.type}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.li>
          ))}
        </motion.ul>

        {calculateProgress() === 100 && (
          <motion.div
            className="mt-8 p-6 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-500 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-green-800">All Tasks Completed!</h3>
                <p className="text-green-700">
                  Great job! You've completed all safety checks for today.
                  {checklist.completionBonus > 0 &&
                    <span> You earned an additional <span className="font-bold">{checklist.completionBonus} points!</span></span>
                  }
                  Your commitment to safety is commendable.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          className="mt-8 flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button
            disabled={isSaving}
            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg shadow-md hover:shadow-lg transform transition-all duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={() => {
              if (calculateProgress() === 100) {
                confetti({
                  particleCount: 100,
                  spread: 70,
                  origin: { y: 0.6 }
                });
                const durationSeconds = Math.round((Date.now() - sessionStartRef.current) / 1000);
                logBehaviorEvent('checklist_completed', {
                  checklistId: checklist.checklistId,
                  totalItems: checklist.items.length,
                  completionRate: 100,
                  durationSeconds,
                  pointsEarned: checklist.items.reduce((sum, item) => sum + (item.completed ? item.pointsAwarded : 0), 0) + (checklist.completionBonus || 0),
                  type: checklist.type,
                });
                toast.success("Safety checklist submitted successfully!");
              } else {
                toast.info("Please complete all safety checks before submitting.");
              }
            }}
          >
            Submit Checklist
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default DailyChecklist;