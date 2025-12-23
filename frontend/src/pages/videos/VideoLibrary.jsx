import { useState, useEffect, useMemo, useRef } from 'react';
import ReactPlayer from 'react-player';
import { motion } from 'framer-motion';
import { logBehaviorEvent } from '../../utils/behaviorTracker';
import playlistVideos from '../../data/playlistVideos.json';

const VideoLibrary = () => {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [milestonesLogged, setMilestonesLogged] = useState({ 25: false, 50: false, 75: false });
  const lastProgressRef = useRef({ playedSeconds: 0 });

  const categoryConfig = {
    equipment: {
      label: 'Equipment & Ops',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    emergency: {
      label: 'Emergency Response',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    hazards: {
      label: 'Hazard Prevention',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    compliance: {
      label: 'Compliance & Rights',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10m-9 4h4m2 0h3m2 0a2 2 0 002-2V7a2 2 0 00-2-2h-2V3a2 2 0 00-2-2h-4a2 2 0 00-2 2v2H7a2 2 0 00-2 2v6a2 2 0 002 2z" />
        </svg>
      )
    }
  };

  const categoryBadgeClasses = {
    equipment: 'bg-blue-100 text-blue-800',
    emergency: 'bg-red-100 text-red-800',
    hazards: 'bg-yellow-100 text-yellow-800',
    compliance: 'bg-purple-100 text-purple-800'
  };

  const getCategoryLabel = (key) => categoryConfig[key]?.label || key;

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

  useEffect(() => {
    setVideos(playlistVideos);
    setIsLoading(false);
  }, []);

  const videoOfTheDay = useMemo(() => {
    if (!videos.length) return null;
    const today = new Date().toISOString().split('T')[0];
    const hash = today
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return videos[hash % videos.length];
  }, [videos]);

  const filteredVideos = filter === 'all' 
    ? videos 
    : videos.filter(video => video.category === filter);

  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
    setMilestonesLogged({ 25: false, 50: false, 75: false });
    lastProgressRef.current = { playedSeconds: 0 };
    logBehaviorEvent('video_started', {
      videoId: video.id,
      title: video.title,
      category: video.category,
      duration: video.duration,
    });
    // Scroll to player
    document.getElementById('video-player')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleVideoProgress = (progressState) => {
    if (!selectedVideo) return;
    const percent = Math.round(progressState.played * 100);
    const deltaSeconds = Math.max(0, progressState.playedSeconds - (lastProgressRef.current.playedSeconds || 0));
    lastProgressRef.current = progressState;

    [25, 50, 75].forEach((milestone) => {
      if (percent >= milestone && !milestonesLogged[milestone]) {
        setMilestonesLogged((prev) => {
          if (prev[milestone]) {
            return prev;
          }
          logBehaviorEvent('video_progress', {
            videoId: selectedVideo.id,
            title: selectedVideo.title,
            milestone,
            percentage: percent,
          });
          return { ...prev, [milestone]: true };
        });
      }
    });

    if (deltaSeconds >= 15) {
      logBehaviorEvent('video_progress', {
        videoId: selectedVideo.id,
        title: selectedVideo.title,
        percentage: percent,
        deltaSeconds,
      });
    }
  };

  const handleVideoCompleted = () => {
    if (!selectedVideo) return;
    const watchSeconds = lastProgressRef.current.playedSeconds || 0;
    logBehaviorEvent('video_completed', {
      videoId: selectedVideo.id,
      title: selectedVideo.title,
      category: selectedVideo.category,
      durationSeconds: Math.round(watchSeconds),
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600 border-opacity-75"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8 mt-10"
    >
      {/* Header with Gradient */}
      <div className="relative overflow-hidden rounded-xl mb-8 bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
        <div className="absolute top-0 left-0 w-full h-full bg-white opacity-5">
          <div className="absolute top-0 left-0 w-full h-full" 
               style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z\' fill=\'%23ffffff\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")'}}></div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <div className="flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <h1 className="text-3xl font-bold">Safety Training Videos</h1>
          </div>
          <p className="text-white text-opacity-90 text-lg ml-11">Enhance your safety knowledge with our curated video collection</p>
        </motion.div>
      </div>
      
      {/* Video of the Day */}
      {videoOfTheDay && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-card rounded-2xl shadow-xl p-6 mb-8 border border-white border-opacity-20 bg-gradient-to-r from-yellow-100 via-white to-blue-50"
        >
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="flex-1">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 uppercase tracking-wider">
                Video of the Day
              </span>
              <h2 className="text-2xl font-bold text-gray-900 mt-3">{videoOfTheDay.title}</h2>
              <p className="text-gray-700 mt-2">{videoOfTheDay.description}</p>
              <div className="flex flex-wrap gap-3 mt-4 text-sm">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {videoOfTheDay.duration || 'Short Watch'}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {getCategoryLabel(videoOfTheDay.category)}
                </span>
              </div>
              <button
                onClick={() => handleVideoSelect(videoOfTheDay)}
                className="mt-5 inline-flex items-center px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold shadow hover:shadow-lg transition-all"
              >
                Watch today’s spotlight
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
            <div className="w-full lg:w-1/2 rounded-xl overflow-hidden border border-white border-opacity-30 shadow-lg bg-black">
              <ReactPlayer
                url={videoOfTheDay.url}
                width="100%"
                height="240px"
                light={videoOfTheDay.thumbnail}
                playing={false}
                controls={false}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Category Filter */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="glass-card rounded-xl shadow-lg p-6 border border-white border-opacity-20 bg-gradient-to-br from-white to-gray-50 mb-8"
      >
        <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filter by Category
        </h2>
        <div className="flex flex-wrap gap-3">
          <motion.button
            variants={itemVariants}
            onClick={() => setFilter('all')}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
              filter === 'all' 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            All Videos
          </motion.button>
          {Object.entries(categoryConfig).map(([key, meta]) => (
            <motion.button
              key={key}
              variants={itemVariants}
              onClick={() => setFilter(key)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                filter === key
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              <span className="flex items-center">
                {meta.icon}
                {meta.label}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>
      
      {/* Video Player (if video is selected) */}
      {selectedVideo && (
        <motion.div 
          id="video-player" 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="glass-card rounded-xl shadow-lg overflow-hidden border border-white border-opacity-20 bg-gradient-to-br from-gray-900 to-black p-1">
            <div className="rounded-lg overflow-hidden">
              <ReactPlayer
                url={selectedVideo.url}
                width="100%"
                height="480px"
                controls
                playing
                className="rounded-lg"
                onProgress={handleVideoProgress}
                onEnded={handleVideoCompleted}
              />
            </div>
          </div>
          <div className="mt-6 glass-card rounded-xl shadow-lg p-6 border border-white border-opacity-20 bg-gradient-to-br from-white to-gray-50">
            <h2 className="text-2xl font-bold text-gray-800">{selectedVideo.title}</h2>
            <div className="flex items-center mt-2 mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {selectedVideo.duration || 'Short Watch'}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {getCategoryLabel(selectedVideo.category)}
              </span>
            </div>
            <p className="text-gray-700 mt-2 text-lg">{selectedVideo.description}</p>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setSelectedVideo(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to videos
              </button>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Video Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredVideos.map(video => (
          <motion.div 
            key={video.id}
            variants={itemVariants}
            className="glass-card rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white border-opacity-20 bg-gradient-to-br from-white to-gray-50"
            onClick={() => handleVideoSelect(video)}
          >
            <div className="relative">
              <img 
                src={video.thumbnail} 
                alt={video.title} 
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
              <div className="absolute bottom-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded-md text-xs flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {video.duration || 'Short Watch'}
              </div>
              <div className="absolute top-3 left-3">
                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                  categoryBadgeClasses[video.category] || 'bg-gray-100 text-gray-800'
                }`}>
                  {getCategoryLabel(video.category)}
                </span>
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                <div className="w-16 h-16 rounded-full bg-white bg-opacity-80 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-lg mb-2 text-gray-800">{video.title}</h3>
              <p className="text-gray-600 text-sm line-clamp-2 mb-3">{video.description}</p>
              <div className="flex justify-end">
                <button className="text-blue-600 text-sm font-medium flex items-center hover:text-blue-800 transition-colors">
                  Watch Now
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      {filteredVideos.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card rounded-xl shadow-lg p-12 text-center border border-white border-opacity-20 bg-gradient-to-br from-white to-gray-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
          </svg>
          <p className="text-gray-500 text-xl mb-4">No videos found in this category.</p>
          <button 
            onClick={() => setFilter('all')} 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            View all videos
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default VideoLibrary;