// Mock data for mine visualization

export const generateMineStructure = () => {
  // Main tunnel system - Extended and more realistic
  const tunnels = [
    // Main shaft (vertical entrance)
    { id: 1, start: [0, 0, 0], end: [0, -30, 0], type: 'main', width: 4 },
    
    // Level 1 tunnels (-10m depth) - Extended
    { id: 2, start: [0, -10, 0], end: [35, -10, 0], type: 'horizontal', width: 2.8 },
    { id: 3, start: [0, -10, 0], end: [-35, -10, 0], type: 'horizontal', width: 2.8 },
    { id: 4, start: [0, -10, 0], end: [0, -10, 35], type: 'horizontal', width: 2.8 },
    { id: 5, start: [0, -10, 0], end: [0, -10, -35], type: 'horizontal', width: 2.8 },
    
    // Level 1 branch tunnels
    { id: 6, start: [35, -10, 0], end: [35, -10, 20], type: 'branch', width: 2.2 },
    { id: 7, start: [35, -10, 0], end: [35, -10, -20], type: 'branch', width: 2.2 },
    { id: 8, start: [-35, -10, 0], end: [-35, -10, 20], type: 'branch', width: 2.2 },
    { id: 9, start: [-35, -10, 0], end: [-35, -10, -20], type: 'branch', width: 2.2 },
    
    // Level 1 connecting tunnels
    { id: 10, start: [20, -10, 0], end: [20, -10, 25], type: 'cross', width: 2 },
    { id: 11, start: [-20, -10, 0], end: [-20, -10, -25], type: 'cross', width: 2 },
    { id: 12, start: [0, -10, 20], end: [25, -10, 20], type: 'cross', width: 2 },
    { id: 13, start: [0, -10, -20], end: [-25, -10, -20], type: 'cross', width: 2 },
    
    // Level 2 tunnels (-20m depth) - Extended
    { id: 14, start: [0, -20, 0], end: [40, -20, 0], type: 'horizontal', width: 2.8 },
    { id: 15, start: [0, -20, 0], end: [-40, -20, 0], type: 'horizontal', width: 2.8 },
    { id: 16, start: [0, -20, 0], end: [0, -20, 40], type: 'horizontal', width: 2.8 },
    { id: 17, start: [0, -20, 0], end: [0, -20, -40], type: 'horizontal', width: 2.8 },
    
    // Level 2 branch tunnels
    { id: 18, start: [40, -20, 0], end: [40, -20, 25], type: 'branch', width: 2.2 },
    { id: 19, start: [40, -20, 0], end: [40, -20, -25], type: 'branch', width: 2.2 },
    { id: 20, start: [-40, -20, 0], end: [-40, -20, 25], type: 'branch', width: 2.2 },
    { id: 21, start: [-40, -20, 0], end: [-40, -20, -25], type: 'branch', width: 2.2 },
    
    // Level 2 connecting tunnels
    { id: 22, start: [25, -20, 0], end: [25, -20, 30], type: 'cross', width: 2 },
    { id: 23, start: [-25, -20, 0], end: [-25, -20, -30], type: 'cross', width: 2 },
    { id: 24, start: [0, -20, 25], end: [30, -20, 25], type: 'cross', width: 2 },
    { id: 25, start: [0, -20, -25], end: [-30, -20, -25], type: 'cross', width: 2 },
    
    // Vertical access shafts between levels
    { id: 26, start: [25, -10, 0], end: [25, -20, 0], type: 'vertical', width: 2.5 },
    { id: 27, start: [-25, -10, 0], end: [-25, -20, 0], type: 'vertical', width: 2.5 },
    { id: 28, start: [0, -10, 25], end: [0, -20, 25], type: 'vertical', width: 2.5 },
  ];

  return tunnels;
};

export const generateWorkers = () => {
  return [
    {
      id: 1,
      name: 'John Doe',
      position: [28, -10, 8],
      status: 'active',
      role: 'miner',
      heartRate: 85,
      oxygenLevel: 98,
    },
    {
      id: 2,
      name: 'Jane Smith',
      position: [3, -10, 3],
      status: 'active',
      role: 'supervisor',
      heartRate: 72,
      oxygenLevel: 99,
    },
    {
      id: 3,
      name: 'Mike Johnson',
      position: [-30, -10, 12],
      status: 'active',
      role: 'miner',
      heartRate: 90,
      oxygenLevel: 97,
    },
    {
      id: 4,
      name: 'Sarah Williams',
      position: [8, -20, 28],
      status: 'warning',
      role: 'miner',
      heartRate: 110,
      oxygenLevel: 94,
    },
    {
      id: 5,
      name: 'Tom Brown',
      position: [32, -20, -5],
      status: 'active',
      role: 'engineer',
      heartRate: 78,
      oxygenLevel: 98,
    },
    {
      id: 6,
      name: 'Emily Davis',
      position: [-25, -20, -18],
      status: 'active',
      role: 'miner',
      heartRate: 88,
      oxygenLevel: 96,
    },
    {
      id: 7,
      name: 'David Martinez',
      position: [18, -10, 22],
      status: 'active',
      role: 'technician',
      heartRate: 82,
      oxygenLevel: 97,
    },
    {
      id: 8,
      name: 'Lisa Anderson',
      position: [-8, -10, -28],
      status: 'active',
      role: 'miner',
      heartRate: 87,
      oxygenLevel: 96,
    },
    {
      id: 9,
      name: 'Robert Chen',
      position: [35, -20, 18],
      status: 'active',
      role: 'miner',
      heartRate: 92,
      oxygenLevel: 95,
    },
    {
      id: 10,
      name: 'Maria Garcia',
      position: [-32, -20, 22],
      status: 'active',
      role: 'safety_officer',
      heartRate: 75,
      oxygenLevel: 98,
    },
  ];
};

export const generateDangerZones = () => {
  return [
    {
      id: 1,
      type: 'gas',
      position: [0, -10, -15],
      radius: 5,
      severity: 'high',
      gasType: 'Methane',
      level: 2.5,
      threshold: 1.5,
      description: 'Elevated methane levels detected',
    },
    {
      id: 2,
      type: 'structural',
      position: [-20, -20, -20],
      radius: 4,
      severity: 'critical',
      description: 'Unstable rock formation - risk of collapse',
    },
    {
      id: 3,
      type: 'gas',
      position: [18, -10, 12],
      radius: 3,
      severity: 'medium',
      gasType: 'Carbon Monoxide',
      level: 35,
      threshold: 30,
      description: 'CO levels above normal',
    },
    {
      id: 4,
      type: 'temperature',
      position: [0, -20, 20],
      radius: 3.5,
      severity: 'medium',
      temperature: 45,
      threshold: 35,
      description: 'High temperature zone',
    },
  ];
};

export const generateEquipment = () => {
  return [
    {
      id: 1,
      type: 'drill',
      position: [10, -10, 5],
      status: 'operational',
      name: 'Drill Machine A1',
    },
    {
      id: 2,
      type: 'cart',
      position: [-8, -10, -5],
      status: 'operational',
      name: 'Mining Cart B2',
    },
    {
      id: 3,
      type: 'ventilator',
      position: [0, -5, 0],
      status: 'operational',
      name: 'Ventilation System V1',
    },
    {
      id: 4,
      type: 'sensor',
      position: [0, -10, -15],
      status: 'alert',
      name: 'Gas Sensor GS-03',
    },
  ];
};

export const getSeverityColor = (severity) => {
  switch (severity) {
    case 'low':
      return '#fbbf24'; // yellow
    case 'medium':
      return '#f97316'; // orange
    case 'high':
      return '#ef4444'; // red
    case 'critical':
      return '#dc2626'; // dark red
    default:
      return '#6b7280'; // gray
  }
};

export const getWorkerStatusColor = (status) => {
  switch (status) {
    case 'active':
      return '#10b981'; // green
    case 'warning':
      return '#f59e0b'; // amber
    case 'danger':
      return '#ef4444'; // red
    case 'offline':
      return '#6b7280'; // gray
    default:
      return '#3b82f6'; // blue
  }
};

// Map backend risk levels to colors for the 3D predictive heatmap
export const getRiskLevelColor = (riskLevel) => {
  switch (riskLevel?.toUpperCase()) {
    case 'LOW':
      return '#22c55e'; // green
    case 'MEDIUM':
      return '#eab308'; // yellow
    case 'HIGH':
      return '#f97316'; // orange
    case 'CRITICAL':
      return '#ef4444'; // red
    default:
      return '#6b7280'; // gray
  }
};
