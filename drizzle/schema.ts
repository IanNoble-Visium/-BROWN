import { integer, pgEnum, pgTable, text, timestamp, varchar, decimal, json, boolean, serial } from "drizzle-orm/pg-core";

// ============================================
// ENUMS
// ============================================

export const userRoleEnum = pgEnum("user_role", ["user", "admin", "operator", "viewer"]);
export const zoneTypeEnum = pgEnum("zone_type", ["classroom", "hallway", "stairwell", "entry", "office", "lab", "common", "restroom", "other"]);
export const cameraTypeEnum = pgEnum("camera_type", ["dome", "bullet", "ptz", "fisheye", "thermal"]);
export const equipmentStatusEnum = pgEnum("equipment_status", ["online", "offline", "maintenance", "error"]);
export const accessReaderTypeEnum = pgEnum("access_reader_type", ["entry", "exit", "bidirectional"]);
export const sensorTypeEnum = pgEnum("sensor_type", ["motion", "glass_break", "smoke", "temperature", "occupancy"]);
export const sensorStatusEnum = pgEnum("sensor_status", ["online", "offline", "triggered", "maintenance"]);
export const entityTypeEnum = pgEnum("entity_type", ["person", "device", "vehicle", "unknown"]);
export const entityRoleEnum = pgEnum("entity_role", ["staff", "student", "visitor", "contractor", "unknown"]);
export const locationSourceEnum = pgEnum("location_source", ["wifi", "rfid", "facial", "phone", "motion", "manual"]);
export const eventTypeEnum = pgEnum("event_type", [
  "camera_alert", "access_entry", "access_denied", "motion_detect", 
  "wifi_probe", "facial_match", "weapon_detect", "anomaly", 
  "crowd_gather", "person_down", "intrusion", "system"
]);
export const severityEnum = pgEnum("severity", ["info", "low", "medium", "high", "critical"]);
export const alertTypeEnum = pgEnum("alert_type", ["weapon", "intrusion", "anomaly", "crowd", "access_violation", "system", "person_down", "fire"]);
export const alertSeverityEnum = pgEnum("alert_severity", ["low", "medium", "high", "critical"]);
export const alertStatusEnum = pgEnum("alert_status", ["active", "acknowledged", "investigating", "resolved", "false_alarm"]);
export const incidentStatusEnum = pgEnum("incident_status", ["open", "in_progress", "resolved", "closed"]);
export const incidentPriorityEnum = pgEnum("incident_priority", ["low", "medium", "high", "critical"]);

// ============================================
// USER & AUTH TABLES
// ============================================

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("open_id", { length: 64 }).notNull().unique(),
  username: varchar("username", { length: 255 }),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("login_method", { length: 64 }),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================
// CAMPUS STRUCTURE TABLES
// ============================================

export const buildings = pgTable("buildings", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }),
  address: text("address"),
  floorsCount: integer("floors_count").default(1),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  description: text("description"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Building = typeof buildings.$inferSelect;
export type InsertBuilding = typeof buildings.$inferInsert;

export const floors = pgTable("floors", {
  id: serial("id").primaryKey(),
  buildingId: integer("building_id").notNull(),
  level: integer("level").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  floorplanUrl: text("floorplan_url"),
  floorplanWidth: integer("floorplan_width"),
  floorplanHeight: integer("floorplan_height"),
  scalePxPerMeter: decimal("scale_px_per_meter", { precision: 10, scale: 4 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Floor = typeof floors.$inferSelect;
export type InsertFloor = typeof floors.$inferInsert;

export const zones = pgTable("zones", {
  id: serial("id").primaryKey(),
  floorId: integer("floor_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: zoneTypeEnum("type").default("other"),
  polygonPoints: json("polygon_points"), // Array of {x, y} coordinates
  color: varchar("color", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Zone = typeof zones.$inferSelect;
export type InsertZone = typeof zones.$inferInsert;

// ============================================
// SECURITY EQUIPMENT TABLES
// ============================================

export const cameras = pgTable("cameras", {
  id: serial("id").primaryKey(),
  buildingId: integer("building_id").notNull(),
  floorId: integer("floor_id"),
  name: varchar("name", { length: 255 }).notNull(),
  type: cameraTypeEnum("type").default("dome"),
  rtspUrl: text("rtsp_url"),
  hlsUrl: text("hls_url"),
  snapshotUrl: text("snapshot_url"),
  x: decimal("x", { precision: 10, scale: 4 }),
  y: decimal("y", { precision: 10, scale: 4 }),
  fovDegrees: integer("fov_degrees").default(90),
  rotation: integer("rotation").default(0),
  status: equipmentStatusEnum("status").default("online"),
  hasAI: boolean("has_ai").default(false),
  lastHealthCheck: timestamp("last_health_check"),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Camera = typeof cameras.$inferSelect;
export type InsertCamera = typeof cameras.$inferInsert;

export const accessReaders = pgTable("access_readers", {
  id: serial("id").primaryKey(),
  buildingId: integer("building_id").notNull(),
  floorId: integer("floor_id"),
  name: varchar("name", { length: 255 }).notNull(),
  type: accessReaderTypeEnum("type").default("bidirectional"),
  x: decimal("x", { precision: 10, scale: 4 }),
  y: decimal("y", { precision: 10, scale: 4 }),
  externalId: varchar("external_id", { length: 255 }),
  status: equipmentStatusEnum("status").default("online"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AccessReader = typeof accessReaders.$inferSelect;
export type InsertAccessReader = typeof accessReaders.$inferInsert;

export const sensors = pgTable("sensors", {
  id: serial("id").primaryKey(),
  buildingId: integer("building_id").notNull(),
  floorId: integer("floor_id"),
  name: varchar("name", { length: 255 }).notNull(),
  type: sensorTypeEnum("type").default("motion"),
  x: decimal("x", { precision: 10, scale: 4 }),
  y: decimal("y", { precision: 10, scale: 4 }),
  externalId: varchar("external_id", { length: 255 }),
  status: sensorStatusEnum("status").default("online"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Sensor = typeof sensors.$inferSelect;
export type InsertSensor = typeof sensors.$inferInsert;

export const wifiAccessPoints = pgTable("wifi_access_points", {
  id: serial("id").primaryKey(),
  buildingId: integer("building_id").notNull(),
  floorId: integer("floor_id"),
  name: varchar("name", { length: 255 }).notNull(),
  bssid: varchar("bssid", { length: 17 }),
  x: decimal("x", { precision: 10, scale: 4 }),
  y: decimal("y", { precision: 10, scale: 4 }),
  coverageRadius: integer("coverage_radius").default(30),
  status: equipmentStatusEnum("status").default("online"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type WifiAccessPoint = typeof wifiAccessPoints.$inferSelect;
export type InsertWifiAccessPoint = typeof wifiAccessPoints.$inferInsert;

// ============================================
// TRACKING & EVENTS TABLES
// ============================================

export const trackedEntities = pgTable("tracked_entities", {
  id: serial("id").primaryKey(),
  type: entityTypeEnum("type").default("unknown"),
  identifierHash: varchar("identifier_hash", { length: 255 }),
  displayName: varchar("display_name", { length: 255 }),
  role: entityRoleEnum("role").default("unknown"),
  isWatchlist: boolean("is_watchlist").default(false),
  riskScore: integer("risk_score").default(0),
  lastSeenAt: timestamp("last_seen_at"),
  lastFloorId: integer("last_floor_id"),
  lastX: decimal("last_x", { precision: 10, scale: 4 }),
  lastY: decimal("last_y", { precision: 10, scale: 4 }),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type TrackedEntity = typeof trackedEntities.$inferSelect;
export type InsertTrackedEntity = typeof trackedEntities.$inferInsert;

export const locationEvents = pgTable("location_events", {
  id: serial("id").primaryKey(),
  entityId: integer("entity_id").notNull(),
  floorId: integer("floor_id").notNull(),
  sourceType: locationSourceEnum("source_type").notNull(),
  x: decimal("x", { precision: 10, scale: 4 }).notNull(),
  y: decimal("y", { precision: 10, scale: 4 }).notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 4 }).default("0.8"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  metadata: json("metadata"),
});

export type LocationEvent = typeof locationEvents.$inferSelect;
export type InsertLocationEvent = typeof locationEvents.$inferInsert;

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  type: eventTypeEnum("type").notNull(),
  severity: severityEnum("severity").default("info"),
  sourceType: varchar("source_type", { length: 50 }),
  sourceId: integer("source_id"),
  buildingId: integer("building_id"),
  floorId: integer("floor_id"),
  x: decimal("x", { precision: 10, scale: 4 }),
  y: decimal("y", { precision: 10, scale: 4 }),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  metadata: json("metadata"),
  incidentId: integer("incident_id"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

// ============================================
// ALERTS & INCIDENTS TABLES
// ============================================

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  type: alertTypeEnum("type").notNull(),
  severity: alertSeverityEnum("severity").default("medium"),
  status: alertStatusEnum("status").default("active"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  buildingId: integer("building_id"),
  floorId: integer("floor_id"),
  x: decimal("x", { precision: 10, scale: 4 }),
  y: decimal("y", { precision: 10, scale: 4 }),
  aiConfidence: decimal("ai_confidence", { precision: 5, scale: 4 }),
  sourceEventId: integer("source_event_id"),
  assignedTo: integer("assigned_to"),
  acknowledgedBy: integer("acknowledged_by"),
  acknowledgedAt: timestamp("acknowledged_at"),
  resolvedBy: integer("resolved_by"),
  resolvedAt: timestamp("resolved_at"),
  resolutionNotes: text("resolution_notes"),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;

export const incidents = pgTable("incidents", {
  id: serial("id").primaryKey(),
  status: incidentStatusEnum("status").default("open"),
  priority: incidentPriorityEnum("priority").default("medium"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  buildingId: integer("building_id"),
  floorId: integer("floor_id"),
  commanderId: integer("commander_id"),
  assignedTo: integer("assigned_to"),
  tags: json("tags"),
  timeline: json("timeline"),
  linkedAlertIds: json("linked_alert_ids"),
  linkedEventIds: json("linked_event_ids"),
  linkedEntityIds: json("linked_entity_ids"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
  closedAt: timestamp("closed_at"),
});

export type Incident = typeof incidents.$inferSelect;
export type InsertIncident = typeof incidents.$inferInsert;

// ============================================
// CONFIGURATION & AUDIT TABLES
// ============================================

export const config = pgTable("config", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: json("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Config = typeof config.$inferSelect;
export type InsertConfig = typeof config.$inferInsert;

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }),
  entityId: integer("entity_id"),
  details: json("details"),
  ipAddress: varchar("ip_address", { length: 45 }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

// ============================================
// DEMO SCENARIOS TABLE
// ============================================

export const demoScenarios = pgTable("demo_scenarios", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  duration: integer("duration"), // in seconds
  events: json("events"), // Array of timed events
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type DemoScenario = typeof demoScenarios.$inferSelect;
export type InsertDemoScenario = typeof demoScenarios.$inferInsert;
