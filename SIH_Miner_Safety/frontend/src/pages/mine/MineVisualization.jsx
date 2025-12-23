import { useState, useEffect, useRef, useContext } from 'react';
import { FaUsers, FaExclamationTriangle, FaCog, FaExpand, FaCompress, FaEye } from 'react-icons/fa';
import { MdPerson, MdWarning } from 'react-icons/md';
import MineView3D from '../../components/mine3d/MineView3D';
import {
  generateMineStructure,
  generateWorkers,
  generateDangerZones,
  getWorkerStatusColor,
  getSeverityColor,
} from '../../utils/mineData';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/axiosConfig';

const MineVisualization = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  const [tunnels] = useState(generateMineStructure());
  const [workers, setWorkers] = useState(generateWorkers());
  const [dangerZones, setDangerZones] = useState(generateDangerZones());
  const [riskZones, setRiskZones] = useState([]);

  const [selectedWorker, setSelectedWorker] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedRiskZone, setSelectedRiskZone] = useState(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [showCameraControls, setShowCameraControls] = useState(true);
  const [viewMode, setViewMode] = useState('overview'); // overview, workers, dangers
  const [currentLevel, setCurrentLevel] = useState('all'); // all, surface, level1, level2
  const [cameraAngle, setCameraAngle] = useState('default'); // default, top, side, front
  const [showRiskHeatmap, setShowRiskHeatmap] = useState(false);
  const [riskLoading, setRiskLoading] = useState(false);
  const [riskError, setRiskError] = useState(null);

  const cameraKey = useRef(0); // Force camera update
  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      // Update worker positions slightly (simulate movement)
      setWorkers((prev) =>
        prev.map((worker) => ({
          ...worker,
          heartRate: worker.heartRate + Math.floor(Math.random() * 5 - 2),
          oxygenLevel: Math.max(92, Math.min(100, worker.oxygenLevel + Math.random() * 2 - 1)),
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleWorkerClick = (worker) => {
    setSelectedWorker(worker);
    setSelectedZone(null);
    setSelectedRiskZone(null);
  };

  const handleDangerZoneClick = (zone) => {
    setSelectedZone(zone);
    setSelectedWorker(null);
    setSelectedRiskZone(null);
  };

  const handleRiskZoneClick = (riskZone) => {
    setSelectedRiskZone(riskZone);
    setSelectedWorker(null);
    setSelectedZone(null);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Fetch predictive AI risk zones when admin toggles heatmap on
  useEffect(() => {
    const fetchRisk = async () => {
      if (!isAdmin || !showRiskHeatmap) return;
      setRiskLoading(true);
      setRiskError(null);
      try {
        const { data } = await api.get('/mine/risk', {
          params: { horizonHours: 24 },
        });
        // Expect backend to return an array of risk zones with position, radius, riskLevel, riskScore, etc.
        setRiskZones(Array.isArray(data) ? data : data?.zones || []);
      } catch (error) {
        console.error('Failed to load AI risk predictions:', error);
        setRiskError('Unable to load AI risk predictions');
        setRiskZones([]);
      } finally {
        setRiskLoading(false);
      }
    };

    fetchRisk();
  }, [isAdmin, showRiskHeatmap]);
  const getCameraPosition = () => {
    // Camera angle presets
    if (cameraAngle === 'top') {
      return [0, 50, 0]; // Bird's eye view
    } else if (cameraAngle === 'side') {
      return [60, 0, 0]; // Side cross-section view
    } else if (cameraAngle === 'front') {
      return [0, 0, 60]; // Front view
    }
    
    // Level-specific views
    if (currentLevel === 'surface') {
      return [25, 10, 25];
    } else if (currentLevel === 'level1') {
      return [25, -5, 25]; // Focus on -10m depth
    } else if (currentLevel === 'level2') {
      return [30, -15, 30]; // Focus on -20m depth
    }
    
    // View mode overrides
    switch (viewMode) {
      case 'workers':
        return [30, 15, 30];
      case 'dangers':
        return [20, 10, 20];
      default:
        return [40, 20, 40];
    }
  };

  const handleCameraAngleChange = (angle) => {
    setCameraAngle(angle);
    cameraKey.current += 1; // Trigger re-render
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 overflow-hidden mt-20">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 md:px-6 py-3 flex-shrink-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-3xl">🏗️</span>
              3D Mine Visualization
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Real-time mine monitoring with worker tracking and hazard detection
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{workers.length}</div>
                <div className="text-xs text-gray-400">Workers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{dangerZones.length}</div>
                <div className="text-xs text-gray-400">Danger Zones</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {workers.filter(w => w.status === 'warning').length}
                </div>
                <div className="text-xs text-gray-400">Warnings</div>
              </div>
              {isAdmin && (
                <div className="text-center">
                  <div className="text-xs text-gray-400 mb-1">AI Risk Zones</div>
                  <button
                    onClick={() => setShowRiskHeatmap((prev) => !prev)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                      showRiskHeatmap
                        ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                        : 'bg-gray-800 text-gray-200 border-gray-600 hover:bg-gray-700'
                    }`}
                    title="Toggle AI-predicted risk heatmap (admins only)"
                  >
                    {riskLoading ? 'Loading…' : showRiskHeatmap ? 'Hide AI risk' : 'Show AI risk'}
                  </button>
                </div>
              )}
            </div>

            {/* Camera Angle Quick Buttons */}
            {showCameraControls && (
              <div className="hidden lg:flex gap-2 border-l border-gray-600 pl-4">
                <button
                  onClick={() => handleCameraAngleChange('default')}
                  className={`px-3 py-1.5 rounded-lg transition-colors text-xs font-medium ${
                    cameraAngle === 'default'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  title="Default View"
                >
                  🎯 Default
                </button>
                <button
                  onClick={() => handleCameraAngleChange('top')}
                  className={`px-3 py-1.5 rounded-lg transition-colors text-xs font-medium ${
                    cameraAngle === 'top'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  title="Top View (Bird's Eye)"
                >
                  ⬆️ Top
                </button>
                <button
                  onClick={() => handleCameraAngleChange('side')}
                  className={`px-3 py-1.5 rounded-lg transition-colors text-xs font-medium ${
                    cameraAngle === 'side'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  title="Side View (Cross-section)"
                >
                  ➡️ Side
                </button>
                <button
                  onClick={() => handleCameraAngleChange('front')}
                  className={`px-3 py-1.5 rounded-lg transition-colors text-xs font-medium ${
                    cameraAngle === 'front'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  title="Front View"
                >
                  👁️ Front
                </button>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-2 border-l border-gray-600 pl-4">
              <button
                onClick={() => setShowCameraControls(!showCameraControls)}
                className={`p-2 rounded-lg transition-colors ${
                  showCameraControls ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                title="Toggle Camera Controls"
              >
                <FaEye className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowLeftSidebar(!showLeftSidebar)}
                className={`p-2 rounded-lg transition-colors ${
                  showLeftSidebar ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                title="Toggle Left Sidebar"
              >
                <FaCog className="w-4 h-4" />
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? (
                  <FaCompress className="w-4 h-4" />
                ) : (
                  <FaExpand className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar - Controls */}
        {showLeftSidebar && (
          <div className="w-72 lg:w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto flex-shrink-0 z-20">
            <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            {/* Level Selector */}
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-white font-semibold mb-3">📍 Mine Level</h3>
              <div className="space-y-2">
                {[
                  { id: 'all', label: 'All Levels', icon: '🗺️' },
                  { id: 'surface', label: 'Surface (0m)', icon: '🏔️' },
                  { id: 'level1', label: 'Level 1 (-10m)', icon: '⬇️' },
                  { id: 'level2', label: 'Level 2 (-20m)', icon: '⬇️⬇️' },
                ].map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setCurrentLevel(level.id)}
                    className={`w-full px-4 py-2 rounded-lg text-left transition-colors flex items-center gap-2 ${
                      currentLevel === level.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <span>{level.icon}</span>
                    <span>{level.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* View Mode Selector */}
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-white font-semibold mb-3">👁️ View Mode</h3>
              <div className="space-y-2">
                {['overview', 'workers', 'dangers'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`w-full px-4 py-2 rounded-lg text-left transition-colors ${
                      viewMode === mode
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Workers List */}
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <FaUsers /> Workers ({workers.length})
              </h3>
              <div className="space-y-2">
                {workers.map((worker) => (
                  <div
                    key={worker.id}
                    onClick={() => handleWorkerClick(worker)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedWorker?.id === worker.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{worker.name}</span>
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getWorkerStatusColor(worker.status) }}
                      />
                    </div>
                    <div className="text-xs space-y-0.5">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Role:</span>
                        <span>{worker.role}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Heart Rate:</span>
                        <span>{worker.heartRate} bpm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">O₂ Level:</span>
                        <span>{worker.oxygenLevel}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Danger Zones List */}
            <div className="p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <FaExclamationTriangle className="text-red-400" /> Danger Zones ({dangerZones.length})
              </h3>
              <div className="space-y-2">
                {dangerZones.map((zone) => (
                  <div
                    key={zone.id}
                    onClick={() => handleDangerZoneClick(zone)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedZone?.id === zone.id
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm uppercase">{zone.type}</span>
                      <span
                        className="px-2 py-0.5 rounded text-xs font-bold"
                        style={{
                          backgroundColor: getSeverityColor(zone.severity),
                          color: 'white',
                        }}
                      >
                        {zone.severity}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {zone.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            </div>
          </div>
        )}

        {/* 3D Viewport */}
        <div className="flex-1 relative overflow-hidden">
          <MineView3D
            key={cameraKey.current}
            workers={workers}
            dangerZones={dangerZones}
            tunnels={tunnels}
            onWorkerClick={handleWorkerClick}
            onDangerZoneClick={handleDangerZoneClick}
            riskZones={isAdmin && showRiskHeatmap ? riskZones : []}
            onRiskZoneClick={isAdmin ? handleRiskZoneClick : undefined}
            cameraPosition={getCameraPosition()}
          />

          {/* Status Overlays */}
          <div className="absolute top-4 left-4 space-y-2 z-10">
            {/* Live status */}
            <div className="bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-700">
              <p className="text-white text-sm">
                <span className="text-green-400">●</span> Live View Active
              </p>
            </div>
            
            {/* Current level indicator */}
            <div className="bg-blue-600/90 backdrop-blur-sm px-4 py-3 rounded-lg border border-blue-400 shadow-lg">
              <div className="text-white text-xs font-semibold mb-1">Current View</div>
              <div className="text-white text-sm">
                {currentLevel === 'all' && '🗺️ All Levels'}
                {currentLevel === 'surface' && '🏔️ Surface (0m)'}
                {currentLevel === 'level1' && '⬇️ Level 1 (-10m)'}
                {currentLevel === 'level2' && '⬇️⬇️ Level 2 (-20m)'}
              </div>
            </div>
          </div>

          {/* Enhanced Controls Help */}
          {showCameraControls && (
          <div className="absolute bottom-4 right-4 bg-gray-800/95 backdrop-blur-sm px-4 py-3 rounded-lg border border-gray-600 text-xs text-gray-300 max-w-xs shadow-xl z-10 hidden md:block">
            <div className="font-bold text-white mb-3 text-sm flex items-center gap-2">
              🎮 Camera Controls
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-blue-400">🖊️</span>
                <div>
                  <div className="font-semibold text-white">Rotate View</div>
                  <div>Left Click + Drag</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-400">🖊️</span>
                <div>
                  <div className="font-semibold text-white">Pan Camera</div>
                  <div>Right Click + Drag</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-400">🔍</span>
                <div>
                  <div className="font-semibold text-white">Zoom In/Out</div>
                  <div>Mouse Wheel Scroll</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-400">👆</span>
                <div>
                  <div className="font-semibold text-white">Select Object</div>
                  <div>Click Workers/Zones</div>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-700 text-yellow-300 text-xs">
              💡 Tip: Use level selector to navigate between mine depths
            </div>
          </div>
          )}
        </div>

        {/* Right Sidebar - Details */}
        {(selectedWorker || selectedZone || selectedRiskZone) && (
          <div className="w-72 lg:w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto flex-shrink-0 z-20">
            <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            <div className="p-4">
              {selectedWorker && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <MdPerson /> Worker Details
                    </h3>
                    <button
                      onClick={() => setSelectedWorker(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-gray-400 text-sm">Name</label>
                      <div className="text-white font-medium">{selectedWorker.name}</div>
                    </div>
                    
                    <div>
                      <label className="text-gray-400 text-sm">Role</label>
                      <div className="text-white">{selectedWorker.role}</div>
                    </div>
                    
                    <div>
                      <label className="text-gray-400 text-sm">Status</label>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getWorkerStatusColor(selectedWorker.status) }}
                        />
                        <span className="text-white">{selectedWorker.status}</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-gray-400 text-sm">Vitals</label>
                      <div className="mt-2 space-y-2">
                        <div className="bg-gray-700 p-3 rounded">
                          <div className="text-xs text-gray-400">Heart Rate</div>
                          <div className="text-lg font-bold text-red-400">
                            {selectedWorker.heartRate} bpm
                          </div>
                        </div>
                        <div className="bg-gray-700 p-3 rounded">
                          <div className="text-xs text-gray-400">Oxygen Level</div>
                          <div className="text-lg font-bold text-blue-400">
                            {selectedWorker.oxygenLevel}%
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-gray-400 text-sm">Location</label>
                      <div className="text-white font-mono text-xs">
                        [{selectedWorker.position.join(', ')}]
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedZone && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <MdWarning className="text-red-400" /> Danger Zone Details
                    </h3>
                    <button
                      onClick={() => setSelectedZone(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-gray-400 text-sm">Type</label>
                      <div className="text-white font-medium uppercase">{selectedZone.type}</div>
                    </div>
                    
                    <div>
                      <label className="text-gray-400 text-sm">Severity</label>
                      <div
                        className="inline-block px-3 py-1 rounded font-bold text-white"
                        style={{ backgroundColor: getSeverityColor(selectedZone.severity) }}
                      >
                        {selectedZone.severity.toUpperCase()}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-gray-400 text-sm">Description</label>
                      <div className="text-white">{selectedZone.description}</div>
                    </div>
                    
                    {selectedZone.gasType && (
                      <div>
                        <label className="text-gray-400 text-sm">Gas Information</label>
                        <div className="mt-2 bg-gray-700 p-3 rounded space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Type:</span>
                            <span className="text-white">{selectedZone.gasType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Level:</span>
                            <span className="text-red-400 font-bold">{selectedZone.level} ppm</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Threshold:</span>
                            <span className="text-yellow-400">{selectedZone.threshold} ppm</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedZone.temperature && (
                      <div>
                        <label className="text-gray-400 text-sm">Temperature</label>
                        <div className="mt-2 bg-gray-700 p-3 rounded">
                          <div className="text-lg font-bold text-orange-400">
                            {selectedZone.temperature}°C
                          </div>
                          <div className="text-xs text-gray-400">
                            Threshold: {selectedZone.threshold}°C
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <label className="text-gray-400 text-sm">Affected Radius</label>
                      <div className="text-white">{selectedZone.radius}m</div>
                    </div>
                  </div>
                </div>
              )}

              {selectedRiskZone && (
                <div className="mt-6 border-t border-gray-700 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <span className="text-blue-400">⚠️</span> AI Risk Zone Details
                    </h3>
                    <button
                      onClick={() => setSelectedRiskZone(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4 text-sm">
                    <div>
                      <label className="text-gray-400 text-xs">Zone ID</label>
                      <div className="text-white font-mono">
                        {selectedRiskZone.zoneId || selectedRiskZone.id}
                      </div>
                    </div>

                    <div>
                      <label className="text-gray-400 text-xs">Risk Level</label>
                      <div className="text-white font-semibold">
                        {selectedRiskZone.riskLevel} ({(selectedRiskZone.riskScore * 100).toFixed(0)}% confidence)
                      </div>
                    </div>

                    {Array.isArray(selectedRiskZone.topReasons) && selectedRiskZone.topReasons.length > 0 && (
                      <div>
                        <label className="text-gray-400 text-xs">Top contributing factors</label>
                        <ul className="mt-1 list-disc list-inside text-gray-200 space-y-0.5">
                          {selectedRiskZone.topReasons.slice(0, 4).map((reason, idx) => (
                            <li key={idx}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div>
                      <label className="text-gray-400 text-xs">Predicted risk window</label>
                      <div className="text-gray-300">
                        Next 24 hours (from latest model run)
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MineVisualization;
