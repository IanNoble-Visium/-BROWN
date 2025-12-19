// ============================================
// ENTITY & LOCATION TYPES
// ============================================

export type EntityRole = 'staff' | 'student' | 'visitor' | 'contractor' | 'unknown';
export type EntityType = 'person' | 'device' | 'vehicle' | 'unknown';
export type SourceType = 'wifi' | 'rfid' | 'facial' | 'phone' | 'motion' | 'manual';

export interface TrackedEntity {
  id: number;
  type: EntityType;
  identifierHash?: string;
  displayName?: string;
  role: EntityRole;
  isWatchlist: boolean;
  riskScore: number;
  lastSeenAt?: Date;
  lastFloorId?: number;
  lastX?: number;
  lastY?: number;
  metadata?: Record<string, unknown>;
}

export interface LocationUpdate {
  entityId: number;
  floorId: number;
  x: number;
  y: number;
  sourceType: SourceType;
  confidence: number;
  timestamp: number;
  trail?: { x: number; y: number; timestamp: number }[];
}

export interface EntityPosition {
  entity: TrackedEntity;
  position: {
    floorId: number;
    x: number;
    y: number;
    confidence: number;
    lastUpdate: number;
  };
  trail: { x: number; y: number; timestamp: number }[];
}

// ============================================
// BUILDING & FLOOR TYPES
// ============================================

export interface Building {
  id: number;
  name: string;
  code?: string;
  address?: string;
  floorsCount: number;
  latitude?: number;
  longitude?: number;
  description?: string;
  imageUrl?: string;
}

export interface Floor {
  id: number;
  buildingId: number;
  level: number;
  name: string;
  floorplanUrl?: string;
  floorplanWidth?: number;
  floorplanHeight?: number;
  scalePxPerMeter?: number;
}

export interface Zone {
  id: number;
  floorId: number;
  name: string;
  type: 'classroom' | 'hallway' | 'stairwell' | 'entry' | 'office' | 'lab' | 'common' | 'restroom' | 'other';
  polygonPoints?: { x: number; y: number }[];
  color?: string;
}

// ============================================
// CAMERA & SENSOR TYPES
// ============================================

export type CameraType = 'dome' | 'bullet' | 'ptz' | 'fisheye' | 'thermal';
export type CameraStatus = 'online' | 'offline' | 'maintenance' | 'error';
export type SensorType = 'motion' | 'glass_break' | 'smoke' | 'temperature' | 'occupancy';
export type SensorStatus = 'online' | 'offline' | 'triggered' | 'maintenance';

export interface Camera {
  id: number;
  buildingId: number;
  floorId?: number;
  name: string;
  type: CameraType;
  rtspUrl?: string;
  hlsUrl?: string;
  snapshotUrl?: string;
  x?: number;
  y?: number;
  fovDegrees: number;
  rotation: number;
  status: CameraStatus;
  hasAI: boolean;
  lastHealthCheck?: Date;
  metadata?: Record<string, unknown>;
}

export interface Sensor {
  id: number;
  buildingId: number;
  floorId?: number;
  name: string;
  type: SensorType;
  x?: number;
  y?: number;
  externalId?: string;
  status: SensorStatus;
}

export interface AccessReader {
  id: number;
  buildingId: number;
  floorId?: number;
  name: string;
  type: 'entry' | 'exit' | 'bidirectional';
  x?: number;
  y?: number;
  externalId?: string;
  status: 'online' | 'offline' | 'maintenance';
}

export interface WifiAccessPoint {
  id: number;
  buildingId: number;
  floorId?: number;
  name: string;
  bssid?: string;
  x?: number;
  y?: number;
  coverageRadius: number;
  status: 'online' | 'offline' | 'maintenance';
}

// ============================================
// EVENT & ALERT TYPES
// ============================================

export type EventType = 
  | 'camera_alert' | 'access_entry' | 'access_denied' | 'motion_detect'
  | 'wifi_probe' | 'facial_match' | 'weapon_detect' | 'anomaly'
  | 'crowd_gather' | 'person_down' | 'intrusion' | 'system';

export type AlertType = 'weapon' | 'intrusion' | 'anomaly' | 'crowd' | 'access_violation' | 'system' | 'person_down' | 'fire';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'active' | 'acknowledged' | 'investigating' | 'resolved' | 'false_alarm';

export interface Event {
  id: number;
  type: EventType;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  sourceType?: string;
  sourceId?: number;
  buildingId?: number;
  floorId?: number;
  x?: number;
  y?: number;
  title?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  incidentId?: number;
  timestamp: Date;
}

export interface Alert {
  id: number;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  description?: string;
  buildingId?: number;
  floorId?: number;
  x?: number;
  y?: number;
  aiConfidence?: number;
  sourceEventId?: number;
  assignedTo?: number;
  acknowledgedBy?: number;
  acknowledgedAt?: Date;
  resolvedBy?: number;
  resolvedAt?: Date;
  resolutionNotes?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

// ============================================
// INCIDENT TYPES
// ============================================

export type IncidentStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type IncidentPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Incident {
  id: number;
  status: IncidentStatus;
  priority: IncidentPriority;
  title: string;
  description?: string;
  buildingId?: number;
  floorId?: number;
  commanderId?: number;
  assignedTo?: number;
  tags?: string[];
  timeline?: { timestamp: Date; action: string; userId?: number }[];
  linkedAlertIds?: number[];
  linkedEventIds?: number[];
  linkedEntityIds?: number[];
  createdAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
}

// ============================================
// WEBSOCKET MESSAGE TYPES
// ============================================

export type WSMessageType = 
  | 'location_update'
  | 'alert_new'
  | 'alert_update'
  | 'camera_status'
  | 'incident_update'
  | 'system_status'
  | 'heartbeat';

export interface WSMessage<T = unknown> {
  type: WSMessageType;
  timestamp: number;
  payload: T;
}

export interface LocationBatchUpdate {
  updates: LocationUpdate[];
  timestamp: number;
}

// ============================================
// DASHBOARD STATS TYPES
// ============================================

export interface DashboardStats {
  totalEntities: number;
  activeAlerts: number;
  camerasOnline: number;
  camerasTotal: number;
  incidentsOpen: number;
  avgResponseTime: number;
  entitiesByRole: Record<EntityRole, number>;
  alertsBySeverity: Record<AlertSeverity, number>;
}

// ============================================
// FILTER & QUERY TYPES
// ============================================

export interface AlertFilters {
  types?: AlertType[];
  severities?: AlertSeverity[];
  statuses?: AlertStatus[];
  buildingId?: number;
  floorId?: number;
  startTime?: Date;
  endTime?: Date;
}

export interface EntityFilters {
  roles?: EntityRole[];
  types?: EntityType[];
  buildingId?: number;
  floorId?: number;
  isWatchlist?: boolean;
  minRiskScore?: number;
}

export interface HistoryQuery {
  entityId: number;
  startTime: Date;
  endTime: Date;
  limit?: number;
}
