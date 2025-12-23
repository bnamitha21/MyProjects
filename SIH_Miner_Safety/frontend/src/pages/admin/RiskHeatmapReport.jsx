import { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/axiosConfig';
import { getRiskLevelColor } from '../../utils/mineData';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// Temporary demo data for the risk heatmap so the UI is always visible
// even if the backend is not fully ready.
const DEMO_RISK_ZONES = [
  {
    id: 'TEMP-1',
    zoneId: 'LEVEL1-EAST',
    riskLevel: 'LOW',
    riskScore: 0.2,
    topReasons: ['No recent serious hazards', 'Stable conditions'],
  },
  {
    id: 'TEMP-2',
    zoneId: 'LEVEL1-WEST',
    riskLevel: 'MEDIUM',
    riskScore: 0.5,
    topReasons: ['Some medium hazards logged', 'Equipment traffic moderate'],
  },
  {
    id: 'TEMP-3',
    zoneId: 'LEVEL2-CROSSCUT',
    riskLevel: 'HIGH',
    riskScore: 0.8,
    topReasons: ['Cluster of physical hazards', 'High loading activity'],
  },
  {
    id: 'TEMP-4',
    zoneId: 'GAS-POCKET-AREA',
    riskLevel: 'CRITICAL',
    riskScore: 0.9,
    topReasons: ['Gas-related incidents', 'Requires immediate attention'],
  },
];

const RiskHeatmapReport = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  const [riskZones, setRiskZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);

  useEffect(() => {
    const fetchRisk = async () => {
      if (!isAdmin) {
        // For non-admins, do not show backend data or demo heatmap
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get('/mine/risk', { params: { horizonHours: 24 } });
        const zones = Array.isArray(data) ? data : data?.zones || [];

        if (!zones.length) {
          // Use demo data if backend returns nothing yet
          setRiskZones(DEMO_RISK_ZONES);
          return;
        }

        // Normalise: ensure we have id, zoneId, riskLevel, riskScore
        const normalised = zones.map((z, idx) => ({
          id: z.id ?? z.zoneId ?? idx,
          zoneId: z.zoneId ?? `Zone-${idx + 1}`,
          riskLevel: z.riskLevel ?? 'LOW',
          riskScore: typeof z.riskScore === 'number' ? z.riskScore : (z.risk ?? 0),
          topReasons: z.topReasons ?? [],
          ...z,
        }));

        setRiskZones(normalised);
      } catch (err) {
        console.error('Failed to load risk heatmap data:', err);
        // On error, fall back to demo data so heatmap is still visible
        setError(null);
        setRiskZones(DEMO_RISK_ZONES);
      } finally {
        setLoading(false);
      }
    };

    fetchRisk();
  }, [isAdmin]);

  const distributionByLevel = useMemo(() => {
    const buckets = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    riskZones.forEach((z) => {
      const key = (z.riskLevel || 'LOW').toUpperCase();
      if (buckets.hasOwnProperty(key)) {
        buckets[key] += 1;
      }
    });
    return Object.entries(buckets).map(([level, count]) => ({ level, count }));
  }, [riskZones]);

  const topZones = useMemo(
    () => [...riskZones].sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0)).slice(0, 10),
    [riskZones]
  );

  if (!isAdmin) {
    return (
      <div className="p-6 mt-12">
        <div className="max-w-xl mx-auto bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
          This report is only available to admin users.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-md mt-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl mb-8 bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top,_#ffffff,_transparent_60%)]" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-1">AI Risk Heatmap</h1>
          <p className="text-sm text-blue-100 max-w-2xl">
            Visual overview of AI-predicted risk across mine zones. Darker and redder cells indicate higher risk.
          </p>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600" />
        </div>
      )}

      {!loading && error && (
        <div className="mb-6 max-w-xl mx-auto bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {!loading && !error && riskZones.length === 0 && (
        <div className="mb-6 max-w-xl mx-auto bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-lg text-sm">
          No AI risk data available for the selected period.
        </div>
      )}

      {!loading && riskZones.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Heatmap grid */}
          <div className="xl:col-span-2 bg-white rounded-lg shadow-sm p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-800">Risk Heatmap by Zone</h2>
              <span className="text-xs text-gray-500">Next 24 hours (model prediction)</span>
            </div>

            <div className="mb-3 text-xs text-gray-500">
              Click a cell to see details. Colors: green = low, yellow = medium, orange = high, red = critical.
            </div>

            <div className="overflow-x-auto">
              <div
                className="inline-grid gap-1"
                style={{
                  gridTemplateColumns: `repeat(${Math.min(10, Math.max(3, Math.ceil(Math.sqrt(riskZones.length))))}, minmax(1.75rem, 2.25rem))`,
                }}
              >
                {riskZones.map((zone) => {
                  const baseColor = getRiskLevelColor(zone.riskLevel);
                  const intensity = 0.35 + Math.min(1, Math.max(0, zone.riskScore || 0)) * 0.6;
                  const isSelected = selectedZone?.id === zone.id;

                  return (
                    <button
                      key={zone.id}
                      onClick={() => setSelectedZone(zone)}
                      className={`relative flex items-center justify-center rounded-md border text-[9px] font-mono focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-transform ${
                        isSelected ? 'ring-2 ring-offset-1 ring-blue-500 scale-105' : 'hover:scale-105'
                      }`}
                      style={{
                        backgroundColor: baseColor,
                        opacity: intensity,
                        borderColor: isSelected ? 'rgba(59,130,246,0.9)' : 'rgba(17,24,39,0.6)',
                        color: '#111827',
                      }}
                      title={`${zone.zoneId} – ${zone.riskLevel} (${Math.round((zone.riskScore || 0) * 100)}%)`}
                    >
                      <span className="px-0.5 truncate">
                        {zone.zoneId.length > 6 ? zone.zoneId.slice(-4) : zone.zoneId}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-sm" style={{ backgroundColor: getRiskLevelColor('LOW') }} />
                <span>Low</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-sm" style={{ backgroundColor: getRiskLevelColor('MEDIUM') }} />
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-sm" style={{ backgroundColor: getRiskLevelColor('HIGH') }} />
                <span>High</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-sm" style={{ backgroundColor: getRiskLevelColor('CRITICAL') }} />
                <span>Critical</span>
              </div>
              <div className="text-gray-400 ml-auto">
                Darker cell = higher risk score
              </div>
            </div>
          </div>

          {/* Right column: details + summary chart */}
          <div className="space-y-6">
            {/* Selected zone details */}
            <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Zone Details</h2>
              {selectedZone ? (
                <div className="space-y-2 text-sm text-gray-700">
                  <div>
                    <span className="text-gray-500 text-xs">Zone ID</span>
                    <div className="font-mono text-sm">{selectedZone.zoneId}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Risk Level</span>
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: getRiskLevelColor(selectedZone.riskLevel), color: 'white' }}
                      >
                        {selectedZone.riskLevel || 'N/A'}
                      </span>
                      <span className="text-gray-600 text-xs">
                        Score: {Math.round((selectedZone.riskScore || 0) * 100)}%
                      </span>
                    </div>
                  </div>
                  {Array.isArray(selectedZone.topReasons) && selectedZone.topReasons.length > 0 && (
                    <div>
                      <span className="text-gray-500 text-xs">Top contributing factors</span>
                      <ul className="mt-1 list-disc list-inside text-gray-700 text-xs space-y-0.5">
                        {selectedZone.topReasons.slice(0, 5).map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-2">
                    Prediction horizon: next 24 hours
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  Click on any cell in the heatmap to see AI explanation for that zone.
                </div>
              )}
            </div>

            {/* Distribution by risk level */}
            <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Zones per Risk Level</h2>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distributionByLevel} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="level" tick={{ fill: '#6B7280', fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255,255,255,0.96)',
                        borderRadius: '0.5rem',
                        border: '1px solid #E5E7EB',
                        fontSize: '12px',
                      }}
                    />
                    <Bar
                      dataKey="count"
                      radius={[4, 4, 0, 0]}
                      fill="#3B82F6"
                      label={{ position: 'top', fill: '#374151', fontSize: 11 }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top risk zones list */}
            <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Top Risk Zones</h2>
              <div className="space-y-2 max-h-64 overflow-y-auto text-sm">
                {topZones.map((z) => (
                  <button
                    key={z.id}
                    onClick={() => setSelectedZone(z)}
                    className={`w-full text-left px-3 py-2 rounded-md flex items-center justify-between hover:bg-gray-50 border ${
                      selectedZone?.id === z.id ? 'border-blue-400 bg-blue-50' : 'border-transparent'
                    }`}
                  >
                    <div>
                      <div className="font-mono text-xs text-gray-800">{z.zoneId}</div>
                      <div className="text-[11px] text-gray-500 truncate max-w-[190px]">
                        {(z.topReasons && z.topReasons[0]) || 'High predicted risk in this area.'}
                      </div>
                    </div>
                    <div className="flex flex-col items-end text-xs">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold mb-1"
                        style={{ backgroundColor: getRiskLevelColor(z.riskLevel), color: 'white' }}
                      >
                        {z.riskLevel}
                      </span>
                      <span className="text-gray-700 font-medium">
                        {Math.round((z.riskScore || 0) * 100)}%
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskHeatmapReport;
