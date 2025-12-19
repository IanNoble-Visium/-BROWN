import type {
  Building,
  Floor,
  Camera,
  TrackedEntity,
  Alert,
  Incident,
  Event,
  EntityRole,
  AlertSeverity,
  AlertType,
  DashboardStats,
} from './eli-types';

// ============================================
// BUILDINGS
// ============================================

export const mockBuildings: Building[] = [
  {
    id: 1,
    name: 'Barus & Holley',
    code: 'BH',
    address: '184 Hope Street, Providence, RI 02912',
    floorsCount: 4,
    latitude: 41.8268,
    longitude: -71.4025,
    description: 'School of Engineering building housing research labs and classrooms',
    imageUrl: '/floorplans/barus-holley-1.png',
  },
  {
    id: 2,
    name: 'Sciences Library (SciLi)',
    code: 'SCILI',
    address: '201 Thayer Street, Providence, RI 02912',
    floorsCount: 14,
    latitude: 41.8271,
    longitude: -71.4003,
    description: 'Main science library and study center',
    imageUrl: '/floorplans/sciences-library-1.png',
  },
  {
    id: 3,
    name: 'Keeney Quad',
    code: 'KEEN',
    address: '90 Waterman Street, Providence, RI 02912',
    floorsCount: 4,
    latitude: 41.8255,
    longitude: -71.4018,
    description: 'Freshman residential dormitory complex',
    imageUrl: '/floorplans/keeney-quad-1.png',
  },
  {
    id: 4,
    name: 'Faunce House',
    code: 'FAUN',
    address: '75 Waterman Street, Providence, RI 02912',
    floorsCount: 3,
    latitude: 41.8262,
    longitude: -71.4028,
    description: 'Student center with dining, meeting rooms, and student organizations',
    imageUrl: '/floorplans/faunce-house-1.png',
  },
  {
    id: 5,
    name: 'Main Green',
    code: 'MGRN',
    address: 'College Street, Providence, RI 02912',
    floorsCount: 1,
    latitude: 41.8265,
    longitude: -71.4035,
    description: 'Central outdoor campus quad',
    imageUrl: '/floorplans/main-green-1.png',
  },
  {
    id: 6,
    name: 'Wilson Hall',
    code: 'WILS',
    address: '69 Brown Street, Providence, RI 02912',
    floorsCount: 3,
    latitude: 41.8258,
    longitude: -71.4042,
    description: 'Administrative offices and student services',
    imageUrl: '/floorplans/wilson-hall-1.png',
  },
  {
    id: 7,
    name: 'Sayles Hall',
    code: 'SAYL',
    address: '79 Waterman Street, Providence, RI 02912',
    floorsCount: 2,
    latitude: 41.8267,
    longitude: -71.4038,
    description: 'Historic auditorium and event space',
    imageUrl: '/floorplans/sayles-hall-1.png',
  },
  {
    id: 8,
    name: 'MacMillan Hall',
    code: 'MACM',
    address: '167 Thayer Street, Providence, RI 02912',
    floorsCount: 4,
    latitude: 41.8273,
    longitude: -71.4012,
    description: 'Science building with chemistry and biology labs',
    imageUrl: '/floorplans/macmillan-hall-1.png',
  },
  {
    id: 9,
    name: 'Pembroke Hall',
    code: 'PEMB',
    address: '172 Meeting Street, Providence, RI 02912',
    floorsCount: 3,
    latitude: 41.8278,
    longitude: -71.4022,
    description: 'Humanities building with seminar rooms and faculty offices',
    imageUrl: '/floorplans/pembroke-hall-1.png',
  },
];

// ============================================
// FLOORS
// ============================================

export const mockFloors: Floor[] = [
  // Barus & Holley
  { id: 1, buildingId: 1, level: 1, name: 'First Floor', floorplanUrl: '/floorplans/barus-holley-1.png', floorplanWidth: 1200, floorplanHeight: 800, scalePxPerMeter: 10 },
  { id: 2, buildingId: 1, level: 2, name: 'Second Floor', floorplanUrl: '/floorplans/barus-holley-2.png', floorplanWidth: 1200, floorplanHeight: 800, scalePxPerMeter: 10 },
  // Sciences Library
  { id: 3, buildingId: 2, level: 1, name: 'First Floor', floorplanUrl: '/floorplans/sciences-library-1.png', floorplanWidth: 1400, floorplanHeight: 900, scalePxPerMeter: 10 },
  // Keeney Quad
  { id: 4, buildingId: 3, level: 1, name: 'First Floor', floorplanUrl: '/floorplans/keeney-quad-1.png', floorplanWidth: 1300, floorplanHeight: 700, scalePxPerMeter: 10 },
  // Faunce House
  { id: 5, buildingId: 4, level: 1, name: 'First Floor', floorplanUrl: '/floorplans/faunce-house-1.png', floorplanWidth: 1200, floorplanHeight: 800, scalePxPerMeter: 10 },
  // Main Green
  { id: 6, buildingId: 5, level: 1, name: 'Ground Level', floorplanUrl: '/floorplans/main-green-1.png', floorplanWidth: 1000, floorplanHeight: 1000, scalePxPerMeter: 5 },
  // Wilson Hall
  { id: 7, buildingId: 6, level: 1, name: 'First Floor', floorplanUrl: '/floorplans/wilson-hall-1.png', floorplanWidth: 1100, floorplanHeight: 750, scalePxPerMeter: 10 },
  // Sayles Hall
  { id: 8, buildingId: 7, level: 1, name: 'First Floor', floorplanUrl: '/floorplans/sayles-hall-1.png', floorplanWidth: 1000, floorplanHeight: 850, scalePxPerMeter: 10 },
  // MacMillan Hall
  { id: 9, buildingId: 8, level: 1, name: 'First Floor', floorplanUrl: '/floorplans/macmillan-hall-1.png', floorplanWidth: 1300, floorplanHeight: 900, scalePxPerMeter: 10 },
  // Pembroke Hall
  { id: 10, buildingId: 9, level: 1, name: 'First Floor', floorplanUrl: '/floorplans/pembroke-hall-1.png', floorplanWidth: 1150, floorplanHeight: 800, scalePxPerMeter: 10 },
];

// ============================================
// CAMERAS
// ============================================

const cameraNames = [
  'Main Entrance', 'Lobby', 'Hallway North', 'Hallway South', 'Hallway East', 'Hallway West',
  'Stairwell A', 'Stairwell B', 'Elevator Bank', 'Loading Dock', 'Emergency Exit',
  'Lecture Hall', 'Lab 101', 'Lab 102', 'Office Wing', 'Conference Room',
  'Study Area', 'Computer Lab', 'Cafeteria', 'Courtyard', 'Parking Lot'
];

export const mockCameras: Camera[] = [];
let cameraId = 1;

mockBuildings.forEach((building) => {
  const camerasPerBuilding = (building.code ?? '') === 'MGRN' ? 8 : Math.floor(Math.random() * 15) + 20;
  for (let i = 0; i < camerasPerBuilding; i++) {
    const statuses: Camera['status'][] = ['online', 'online', 'online', 'online', 'online', 'offline', 'maintenance'];
    const types: Camera['type'][] = ['dome', 'dome', 'dome', 'bullet', 'ptz', 'fisheye'];
    mockCameras.push({
      id: cameraId++,
      buildingId: building.id,
      floorId: mockFloors.find(f => f.buildingId === building.id)?.id,
      name: `${building.code}-${cameraNames[i % cameraNames.length]}-${Math.floor(i / cameraNames.length) + 1}`,
      type: types[Math.floor(Math.random() * types.length)],
      rtspUrl: `rtsp://cameras.brown.edu/${(building.code ?? 'unknown').toLowerCase()}/cam${i + 1}`,
      hlsUrl: `/api/cameras/${cameraId}/stream.m3u8`,
      snapshotUrl: `https://picsum.photos/seed/${cameraId}/640/360`,
      x: Math.random() * 1000 + 100,
      y: Math.random() * 600 + 100,
      fovDegrees: [60, 90, 120, 180, 360][Math.floor(Math.random() * 5)],
      rotation: Math.floor(Math.random() * 360),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      hasAI: Math.random() > 0.3,
      lastHealthCheck: new Date(Date.now() - Math.random() * 3600000),
    });
  }
});

// ============================================
// TRACKED ENTITIES
// ============================================

const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

export const mockEntities: TrackedEntity[] = [];
const roles: EntityRole[] = ['staff', 'student', 'student', 'student', 'student', 'visitor', 'contractor', 'unknown'];

for (let i = 1; i <= 150; i++) {
  const role = roles[Math.floor(Math.random() * roles.length)];
  const floor = mockFloors[Math.floor(Math.random() * mockFloors.length)];
  mockEntities.push({
    id: i,
    type: 'person',
    identifierHash: `hash_${i}_${Math.random().toString(36).substring(7)}`,
    displayName: role === 'unknown' ? undefined : `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
    role,
    isWatchlist: Math.random() < 0.02,
    riskScore: role === 'unknown' ? Math.floor(Math.random() * 50) + 20 : Math.floor(Math.random() * 20),
    lastSeenAt: new Date(Date.now() - Math.random() * 3600000),
    lastFloorId: floor.id,
    lastX: Math.random() * 1000 + 100,
    lastY: Math.random() * 600 + 100,
  });
}

// ============================================
// ALERTS
// ============================================

const alertTypes: AlertType[] = ['weapon', 'intrusion', 'anomaly', 'crowd', 'access_violation', 'system', 'person_down'];
const alertSeverities: AlertSeverity[] = ['low', 'medium', 'high', 'critical'];
const alertTitles: Record<AlertType, string[]> = {
  weapon: ['Potential weapon detected', 'Suspicious object identified', 'Metal detector alert'],
  intrusion: ['Unauthorized access attempt', 'Perimeter breach detected', 'After-hours entry'],
  anomaly: ['Unusual behavior detected', 'Loitering alert', 'Abnormal movement pattern'],
  crowd: ['Crowd gathering detected', 'Occupancy threshold exceeded', 'Unusual congregation'],
  access_violation: ['Invalid credential used', 'Tailgating detected', 'Access denied - watchlist'],
  system: ['Camera offline', 'Sensor malfunction', 'Network connectivity issue'],
  person_down: ['Person down detected', 'Medical emergency possible', 'Unresponsive individual'],
  fire: ['Smoke detected', 'Fire alarm triggered', 'Evacuation required'],
};

export const mockAlerts: Alert[] = [];

for (let i = 1; i <= 25; i++) {
  const type = alertTypes[Math.floor(Math.random() * alertTypes.length)];
  const severity = type === 'weapon' || type === 'person_down' ? 'critical' : alertSeverities[Math.floor(Math.random() * alertSeverities.length)];
  const building = mockBuildings[Math.floor(Math.random() * mockBuildings.length)];
  const floor = mockFloors.find(f => f.buildingId === building.id);
  const titles = alertTitles[type];
  const statuses: Alert['status'][] = ['active', 'active', 'acknowledged', 'investigating', 'resolved'];
  
  mockAlerts.push({
    id: i,
    type,
    severity,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    title: titles[Math.floor(Math.random() * titles.length)],
    description: `Alert triggered at ${building.name}. AI confidence: ${(Math.random() * 30 + 70).toFixed(1)}%`,
    buildingId: building.id,
    floorId: floor?.id,
    x: Math.random() * 1000 + 100,
    y: Math.random() * 600 + 100,
    aiConfidence: Math.random() * 0.3 + 0.7,
    createdAt: new Date(Date.now() - Math.random() * 86400000),
  });
}

// Sort alerts by creation time (newest first)
mockAlerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

// ============================================
// INCIDENTS
// ============================================

export const mockIncidents: Incident[] = [
  {
    id: 1,
    status: 'in_progress',
    priority: 'high',
    title: 'Suspicious Activity - Barus & Holley',
    description: 'Multiple alerts triggered in engineering building. Security team dispatched.',
    buildingId: 1,
    floorId: 1,
    tags: ['suspicious', 'engineering', 'active'],
    linkedAlertIds: [1, 2, 3],
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    id: 2,
    status: 'open',
    priority: 'medium',
    title: 'Access Control Issue - Keeney Quad',
    description: 'Multiple failed access attempts at main entrance.',
    buildingId: 3,
    floorId: 4,
    tags: ['access', 'residential'],
    linkedAlertIds: [5, 6],
    createdAt: new Date(Date.now() - 7200000),
  },
  {
    id: 3,
    status: 'resolved',
    priority: 'low',
    title: 'Camera Maintenance - Sciences Library',
    description: 'Scheduled maintenance completed for floor 3 cameras.',
    buildingId: 2,
    floorId: 3,
    tags: ['maintenance', 'camera'],
    createdAt: new Date(Date.now() - 86400000),
    resolvedAt: new Date(Date.now() - 82800000),
  },
];

// ============================================
// EVENTS
// ============================================

export const mockEvents: Event[] = [];
const eventTypes: Event['type'][] = ['camera_alert', 'access_entry', 'access_denied', 'motion_detect', 'wifi_probe', 'facial_match'];

for (let i = 1; i <= 100; i++) {
  const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
  const building = mockBuildings[Math.floor(Math.random() * mockBuildings.length)];
  const floor = mockFloors.find(f => f.buildingId === building.id);
  
  mockEvents.push({
    id: i,
    type,
    severity: ['info', 'low', 'medium'][Math.floor(Math.random() * 3)] as Event['severity'],
    sourceType: type === 'camera_alert' ? 'camera' : type === 'access_entry' ? 'access_reader' : 'sensor',
    sourceId: Math.floor(Math.random() * 50) + 1,
    buildingId: building.id,
    floorId: floor?.id,
    x: Math.random() * 1000 + 100,
    y: Math.random() * 600 + 100,
    title: `${type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} at ${building.name}`,
    timestamp: new Date(Date.now() - Math.random() * 86400000),
  });
}

mockEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

// ============================================
// DASHBOARD STATS
// ============================================

export const mockDashboardStats: DashboardStats = {
  totalEntities: mockEntities.length,
  activeAlerts: mockAlerts.filter(a => a.status === 'active').length,
  camerasOnline: mockCameras.filter(c => c.status === 'online').length,
  camerasTotal: mockCameras.length,
  incidentsOpen: mockIncidents.filter(i => i.status === 'open' || i.status === 'in_progress').length,
  avgResponseTime: 2.4,
  entitiesByRole: {
    staff: mockEntities.filter(e => e.role === 'staff').length,
    student: mockEntities.filter(e => e.role === 'student').length,
    visitor: mockEntities.filter(e => e.role === 'visitor').length,
    contractor: mockEntities.filter(e => e.role === 'contractor').length,
    unknown: mockEntities.filter(e => e.role === 'unknown').length,
  },
  alertsBySeverity: {
    low: mockAlerts.filter(a => a.severity === 'low').length,
    medium: mockAlerts.filter(a => a.severity === 'medium').length,
    high: mockAlerts.filter(a => a.severity === 'high').length,
    critical: mockAlerts.filter(a => a.severity === 'critical').length,
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function generateRandomPosition(floorId: number): { x: number; y: number } {
  const floor = mockFloors.find(f => f.id === floorId);
  if (!floor) return { x: 500, y: 400 };
  
  return {
    x: Math.random() * (floor.floorplanWidth || 1000) * 0.8 + (floor.floorplanWidth || 1000) * 0.1,
    y: Math.random() * (floor.floorplanHeight || 800) * 0.8 + (floor.floorplanHeight || 800) * 0.1,
  };
}

export function simulateEntityMovement(entity: TrackedEntity, deltaMs: number): { x: number; y: number } {
  const speed = 0.05; // pixels per ms
  const maxMove = speed * deltaMs;
  
  const currentX = entity.lastX || 500;
  const currentY = entity.lastY || 400;
  
  // Random walk with bounds
  const newX = Math.max(50, Math.min(1150, currentX + (Math.random() - 0.5) * maxMove * 2));
  const newY = Math.max(50, Math.min(750, currentY + (Math.random() - 0.5) * maxMove * 2));
  
  return { x: newX, y: newY };
}
