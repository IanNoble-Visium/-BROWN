// api/index.ts
import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";

// server/_core/env.ts
var ENV = {
  cookieSecret: process.env.JWT_SECRET || "brown-eli-demo-secret-key-2024",
  databaseUrl: process.env.DATABASE_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",
  port: parseInt(process.env.PORT || "3000")
};

// server/_core/notification.ts
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
import { z as z2 } from "zod";

// server/db.ts
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

// drizzle/schema.ts
import { integer, pgEnum, pgTable, text, timestamp, varchar, decimal, json, boolean, serial } from "drizzle-orm/pg-core";
var userRoleEnum = pgEnum("user_role", ["user", "admin", "operator", "viewer"]);
var zoneTypeEnum = pgEnum("zone_type", ["classroom", "hallway", "stairwell", "entry", "office", "lab", "common", "restroom", "other"]);
var cameraTypeEnum = pgEnum("camera_type", ["dome", "bullet", "ptz", "fisheye", "thermal"]);
var equipmentStatusEnum = pgEnum("equipment_status", ["online", "offline", "maintenance", "error"]);
var accessReaderTypeEnum = pgEnum("access_reader_type", ["entry", "exit", "bidirectional"]);
var sensorTypeEnum = pgEnum("sensor_type", ["motion", "glass_break", "smoke", "temperature", "occupancy"]);
var sensorStatusEnum = pgEnum("sensor_status", ["online", "offline", "triggered", "maintenance"]);
var entityTypeEnum = pgEnum("entity_type", ["person", "device", "vehicle", "unknown"]);
var entityRoleEnum = pgEnum("entity_role", ["staff", "student", "visitor", "contractor", "unknown"]);
var locationSourceEnum = pgEnum("location_source", ["wifi", "rfid", "facial", "phone", "motion", "manual"]);
var eventTypeEnum = pgEnum("event_type", [
  "camera_alert",
  "access_entry",
  "access_denied",
  "motion_detect",
  "wifi_probe",
  "facial_match",
  "weapon_detect",
  "anomaly",
  "crowd_gather",
  "person_down",
  "intrusion",
  "system"
]);
var severityEnum = pgEnum("severity", ["info", "low", "medium", "high", "critical"]);
var alertTypeEnum = pgEnum("alert_type", ["weapon", "intrusion", "anomaly", "crowd", "access_violation", "system", "person_down", "fire"]);
var alertSeverityEnum = pgEnum("alert_severity", ["low", "medium", "high", "critical"]);
var alertStatusEnum = pgEnum("alert_status", ["active", "acknowledged", "investigating", "resolved", "false_alarm"]);
var incidentStatusEnum = pgEnum("incident_status", ["open", "in_progress", "resolved", "closed"]);
var incidentPriorityEnum = pgEnum("incident_priority", ["low", "medium", "high", "critical"]);
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("open_id", { length: 64 }).notNull().unique(),
  username: varchar("username", { length: 255 }),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("login_method", { length: 64 }),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in").defaultNow().notNull()
});
var buildings = pgTable("buildings", {
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
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var floors = pgTable("floors", {
  id: serial("id").primaryKey(),
  buildingId: integer("building_id").notNull(),
  level: integer("level").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  floorplanUrl: text("floorplan_url"),
  floorplanWidth: integer("floorplan_width"),
  floorplanHeight: integer("floorplan_height"),
  scalePxPerMeter: decimal("scale_px_per_meter", { precision: 10, scale: 4 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var zones = pgTable("zones", {
  id: serial("id").primaryKey(),
  floorId: integer("floor_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: zoneTypeEnum("type").default("other"),
  polygonPoints: json("polygon_points"),
  // Array of {x, y} coordinates
  color: varchar("color", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var cameras = pgTable("cameras", {
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
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var accessReaders = pgTable("access_readers", {
  id: serial("id").primaryKey(),
  buildingId: integer("building_id").notNull(),
  floorId: integer("floor_id"),
  name: varchar("name", { length: 255 }).notNull(),
  type: accessReaderTypeEnum("type").default("bidirectional"),
  x: decimal("x", { precision: 10, scale: 4 }),
  y: decimal("y", { precision: 10, scale: 4 }),
  externalId: varchar("external_id", { length: 255 }),
  status: equipmentStatusEnum("status").default("online"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var sensors = pgTable("sensors", {
  id: serial("id").primaryKey(),
  buildingId: integer("building_id").notNull(),
  floorId: integer("floor_id"),
  name: varchar("name", { length: 255 }).notNull(),
  type: sensorTypeEnum("type").default("motion"),
  x: decimal("x", { precision: 10, scale: 4 }),
  y: decimal("y", { precision: 10, scale: 4 }),
  externalId: varchar("external_id", { length: 255 }),
  status: sensorStatusEnum("status").default("online"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var wifiAccessPoints = pgTable("wifi_access_points", {
  id: serial("id").primaryKey(),
  buildingId: integer("building_id").notNull(),
  floorId: integer("floor_id"),
  name: varchar("name", { length: 255 }).notNull(),
  bssid: varchar("bssid", { length: 17 }),
  x: decimal("x", { precision: 10, scale: 4 }),
  y: decimal("y", { precision: 10, scale: 4 }),
  coverageRadius: integer("coverage_radius").default(30),
  status: equipmentStatusEnum("status").default("online"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var trackedEntities = pgTable("tracked_entities", {
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
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var locationEvents = pgTable("location_events", {
  id: serial("id").primaryKey(),
  entityId: integer("entity_id").notNull(),
  floorId: integer("floor_id").notNull(),
  sourceType: locationSourceEnum("source_type").notNull(),
  x: decimal("x", { precision: 10, scale: 4 }).notNull(),
  y: decimal("y", { precision: 10, scale: 4 }).notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 4 }).default("0.8"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  metadata: json("metadata")
});
var events = pgTable("events", {
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
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var alerts = pgTable("alerts", {
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
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var incidents = pgTable("incidents", {
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
  closedAt: timestamp("closed_at")
});
var config = pgTable("config", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: json("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }),
  entityId: integer("entity_id"),
  details: json("details"),
  ipAddress: varchar("ip_address", { length: 45 }),
  timestamp: timestamp("timestamp").defaultNow().notNull()
});
var demoScenarios = pgTable("demo_scenarios", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  duration: integer("duration"),
  // in seconds
  events: json("events"),
  // Array of timed events
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// server/db.ts
var _db = null;
async function getDb() {
  const dbUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
  if (!_db && dbUrl) {
    try {
      const client = neon(dbUrl);
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// server/routers.ts
import { eq as eq2, desc, and, gte, sql as sql2 } from "drizzle-orm";
import { TRPCError as TRPCError3 } from "@trpc/server";

// server/_core/sdk.ts
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var DEMO_SECRET = new TextEncoder().encode(ENV.cookieSecret || "brown-eli-demo-secret-key-2024");
var SDKServer = class {
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  /**
   * Create a session token for the demo user
   */
  async createSessionToken(username, role = "admin", name = "Demo Administrator") {
    const issuedAt = Date.now();
    const expiresInMs = 24 * 60 * 60 * 1e3;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    return new SignJWT({
      username,
      role,
      name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(DEMO_SECRET);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      return null;
    }
    try {
      const { payload } = await jwtVerify(cookieValue, DEMO_SECRET, {
        algorithms: ["HS256"]
      });
      return payload;
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME) || cookies.get("demo_token");
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      return null;
    }
    return {
      id: 1,
      openId: "admin",
      name: session.name,
      email: "admin@brown.edu",
      loginMethod: "password",
      role: session.role,
      lastSignedIn: /* @__PURE__ */ new Date(),
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
  }
};
var sdk = new SDKServer();

// server/routers.ts
var appRouter = router({
  system: systemRouter,
  // Authentication router
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    }),
    // Demo login with admin/admin
    demoLogin: publicProcedure.input(z2.object({
      username: z2.string(),
      password: z2.string()
    })).mutation(async ({ input, ctx }) => {
      if (input.username === "admin" && input.password === "admin") {
        const token = await sdk.createSessionToken(input.username);
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, {
          ...cookieOptions,
          maxAge: 24 * 60 * 60 * 1e3
          // 24 hours
        });
        return {
          success: true,
          user: { username: "admin", role: "admin", name: "Demo Administrator" },
          token
        };
      }
      throw new TRPCError3({ code: "UNAUTHORIZED", message: "Invalid credentials" });
    })
  }),
  // Buildings router
  buildings: router({
    list: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(buildings).orderBy(buildings.name);
    }),
    getById: publicProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(buildings).where(eq2(buildings.id, input.id)).limit(1);
      return result[0] || null;
    }),
    create: publicProcedure.input(z2.object({
      name: z2.string(),
      code: z2.string().optional(),
      address: z2.string().optional(),
      floorsCount: z2.number().optional(),
      latitude: z2.string().optional(),
      longitude: z2.string().optional(),
      description: z2.string().optional(),
      imageUrl: z2.string().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const result = await db.insert(buildings).values(input).returning();
      return result[0];
    })
  }),
  // Floors router
  floors: router({
    list: publicProcedure.input(z2.object({ buildingId: z2.number().optional() }).optional()).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      if (input?.buildingId) {
        return await db.select().from(floors).where(eq2(floors.buildingId, input.buildingId)).orderBy(floors.level);
      }
      return await db.select().from(floors).orderBy(floors.buildingId, floors.level);
    }),
    getById: publicProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(floors).where(eq2(floors.id, input.id)).limit(1);
      return result[0] || null;
    })
  }),
  // Cameras router
  cameras: router({
    list: publicProcedure.input(z2.object({
      buildingId: z2.number().optional(),
      floorId: z2.number().optional(),
      status: z2.enum(["online", "offline", "maintenance", "error"]).optional()
    }).optional()).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      let query = db.select().from(cameras);
      const conditions = [];
      if (input?.buildingId) conditions.push(eq2(cameras.buildingId, input.buildingId));
      if (input?.floorId) conditions.push(eq2(cameras.floorId, input.floorId));
      if (input?.status) conditions.push(eq2(cameras.status, input.status));
      if (conditions.length > 0) {
        return await db.select().from(cameras).where(and(...conditions)).orderBy(cameras.name);
      }
      return await db.select().from(cameras).orderBy(cameras.name);
    }),
    getById: publicProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(cameras).where(eq2(cameras.id, input.id)).limit(1);
      return result[0] || null;
    }),
    updateStatus: publicProcedure.input(z2.object({
      id: z2.number(),
      status: z2.enum(["online", "offline", "maintenance", "error"])
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(cameras).set({ status: input.status, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(cameras.id, input.id));
      return { success: true };
    }),
    stats: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return { total: 0, online: 0, offline: 0, maintenance: 0, error: 0 };
      const result = await db.select({
        status: cameras.status,
        count: sql2`count(*)::int`
      }).from(cameras).groupBy(cameras.status);
      const stats = { total: 0, online: 0, offline: 0, maintenance: 0, error: 0 };
      result.forEach((r) => {
        const count = Number(r.count);
        stats.total += count;
        if (r.status === "online") stats.online = count;
        else if (r.status === "offline") stats.offline = count;
        else if (r.status === "maintenance") stats.maintenance = count;
        else if (r.status === "error") stats.error = count;
      });
      return stats;
    })
  }),
  // Tracked Entities router
  entities: router({
    list: publicProcedure.input(z2.object({
      floorId: z2.number().optional(),
      role: z2.enum(["staff", "student", "visitor", "contractor", "unknown"]).optional(),
      isWatchlist: z2.boolean().optional()
    }).optional()).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const conditions = [];
      if (input?.floorId) conditions.push(eq2(trackedEntities.lastFloorId, input.floorId));
      if (input?.role) conditions.push(eq2(trackedEntities.role, input.role));
      if (input?.isWatchlist !== void 0) conditions.push(eq2(trackedEntities.isWatchlist, input.isWatchlist));
      if (conditions.length > 0) {
        return await db.select().from(trackedEntities).where(and(...conditions)).orderBy(desc(trackedEntities.lastSeenAt));
      }
      return await db.select().from(trackedEntities).orderBy(desc(trackedEntities.lastSeenAt));
    }),
    getById: publicProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(trackedEntities).where(eq2(trackedEntities.id, input.id)).limit(1);
      return result[0] || null;
    }),
    getLocationHistory: publicProcedure.input(z2.object({
      entityId: z2.number(),
      minutes: z2.number().default(30)
    })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const since = new Date(Date.now() - input.minutes * 60 * 1e3);
      return await db.select().from(locationEvents).where(and(
        eq2(locationEvents.entityId, input.entityId),
        gte(locationEvents.timestamp, since)
      )).orderBy(locationEvents.timestamp);
    }),
    stats: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return { total: 0, staff: 0, students: 0, visitors: 0, unknown: 0, watchlist: 0 };
      const roleResult = await db.select({
        role: trackedEntities.role,
        count: sql2`count(*)::int`
      }).from(trackedEntities).groupBy(trackedEntities.role);
      const watchlistResult = await db.select({
        count: sql2`count(*)::int`
      }).from(trackedEntities).where(eq2(trackedEntities.isWatchlist, true));
      const stats = { total: 0, staff: 0, students: 0, visitors: 0, unknown: 0, watchlist: 0 };
      roleResult.forEach((r) => {
        const count = Number(r.count);
        stats.total += count;
        if (r.role === "staff") stats.staff = count;
        else if (r.role === "student") stats.students = count;
        else if (r.role === "visitor") stats.visitors = count;
        else stats.unknown += count;
      });
      stats.watchlist = Number(watchlistResult[0]?.count || 0);
      return stats;
    })
  }),
  // Location Events router (for real-time tracking)
  locations: router({
    current: publicProcedure.input(z2.object({ floorId: z2.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1e3);
      return await db.select({
        entityId: trackedEntities.id,
        displayName: trackedEntities.displayName,
        role: trackedEntities.role,
        isWatchlist: trackedEntities.isWatchlist,
        x: trackedEntities.lastX,
        y: trackedEntities.lastY,
        lastSeenAt: trackedEntities.lastSeenAt
      }).from(trackedEntities).where(and(
        eq2(trackedEntities.lastFloorId, input.floorId),
        gte(trackedEntities.lastSeenAt, fiveMinutesAgo)
      ));
    }),
    record: publicProcedure.input(z2.object({
      entityId: z2.number(),
      floorId: z2.number(),
      sourceType: z2.enum(["wifi", "rfid", "facial", "phone", "motion", "manual"]),
      x: z2.string(),
      y: z2.string(),
      confidence: z2.string().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      await db.insert(locationEvents).values({
        entityId: input.entityId,
        floorId: input.floorId,
        sourceType: input.sourceType,
        x: input.x,
        y: input.y,
        confidence: input.confidence || "0.8"
      });
      await db.update(trackedEntities).set({
        lastFloorId: input.floorId,
        lastX: input.x,
        lastY: input.y,
        lastSeenAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq2(trackedEntities.id, input.entityId));
      return { success: true };
    })
  }),
  // Alerts router
  alerts: router({
    list: publicProcedure.input(z2.object({
      status: z2.enum(["active", "acknowledged", "investigating", "resolved", "false_alarm"]).optional(),
      severity: z2.enum(["low", "medium", "high", "critical"]).optional(),
      type: z2.enum(["weapon", "intrusion", "anomaly", "crowd", "access_violation", "system", "person_down", "fire"]).optional(),
      limit: z2.number().default(50)
    }).optional()).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const conditions = [];
      if (input?.status) conditions.push(eq2(alerts.status, input.status));
      if (input?.severity) conditions.push(eq2(alerts.severity, input.severity));
      if (input?.type) conditions.push(eq2(alerts.type, input.type));
      if (conditions.length > 0) {
        return await db.select().from(alerts).where(and(...conditions)).orderBy(desc(alerts.createdAt)).limit(input?.limit || 50);
      }
      return await db.select().from(alerts).orderBy(desc(alerts.createdAt)).limit(input?.limit || 50);
    }),
    getById: publicProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(alerts).where(eq2(alerts.id, input.id)).limit(1);
      return result[0] || null;
    }),
    updateStatus: publicProcedure.input(z2.object({
      id: z2.number(),
      status: z2.enum(["active", "acknowledged", "investigating", "resolved", "false_alarm"]),
      resolutionNotes: z2.string().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const updateData = {
        status: input.status,
        updatedAt: /* @__PURE__ */ new Date()
      };
      if (input.status === "resolved" || input.status === "false_alarm") {
        updateData.resolvedAt = /* @__PURE__ */ new Date();
        if (input.resolutionNotes) updateData.resolutionNotes = input.resolutionNotes;
      }
      if (input.status === "acknowledged") {
        updateData.acknowledgedAt = /* @__PURE__ */ new Date();
      }
      await db.update(alerts).set(updateData).where(eq2(alerts.id, input.id));
      return { success: true };
    }),
    create: publicProcedure.input(z2.object({
      type: z2.enum(["weapon", "intrusion", "anomaly", "crowd", "access_violation", "system", "person_down", "fire"]),
      severity: z2.enum(["low", "medium", "high", "critical"]),
      title: z2.string(),
      description: z2.string().optional(),
      buildingId: z2.number().optional(),
      floorId: z2.number().optional(),
      x: z2.string().optional(),
      y: z2.string().optional(),
      aiConfidence: z2.string().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const result = await db.insert(alerts).values(input).returning();
      return result[0];
    }),
    stats: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return { total: 0, active: 0, critical: 0, high: 0, medium: 0, low: 0 };
      const statusResult = await db.select({
        status: alerts.status,
        count: sql2`count(*)::int`
      }).from(alerts).groupBy(alerts.status);
      const severityResult = await db.select({
        severity: alerts.severity,
        count: sql2`count(*)::int`
      }).from(alerts).where(eq2(alerts.status, "active")).groupBy(alerts.severity);
      const stats = { total: 0, active: 0, critical: 0, high: 0, medium: 0, low: 0 };
      statusResult.forEach((r) => {
        const count = Number(r.count);
        stats.total += count;
        if (r.status === "active") stats.active = count;
      });
      severityResult.forEach((r) => {
        const count = Number(r.count);
        if (r.severity === "critical") stats.critical = count;
        else if (r.severity === "high") stats.high = count;
        else if (r.severity === "medium") stats.medium = count;
        else if (r.severity === "low") stats.low = count;
      });
      return stats;
    })
  }),
  // Incidents router
  incidents: router({
    list: publicProcedure.input(z2.object({
      status: z2.enum(["open", "in_progress", "resolved", "closed"]).optional(),
      priority: z2.enum(["low", "medium", "high", "critical"]).optional(),
      limit: z2.number().default(50)
    }).optional()).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const conditions = [];
      if (input?.status) conditions.push(eq2(incidents.status, input.status));
      if (input?.priority) conditions.push(eq2(incidents.priority, input.priority));
      if (conditions.length > 0) {
        return await db.select().from(incidents).where(and(...conditions)).orderBy(desc(incidents.createdAt)).limit(input?.limit || 50);
      }
      return await db.select().from(incidents).orderBy(desc(incidents.createdAt)).limit(input?.limit || 50);
    }),
    getById: publicProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(incidents).where(eq2(incidents.id, input.id)).limit(1);
      return result[0] || null;
    }),
    create: publicProcedure.input(z2.object({
      title: z2.string(),
      description: z2.string().optional(),
      priority: z2.enum(["low", "medium", "high", "critical"]),
      buildingId: z2.number().optional(),
      floorId: z2.number().optional(),
      linkedAlertIds: z2.array(z2.number()).optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const result = await db.insert(incidents).values({
        ...input,
        linkedAlertIds: input.linkedAlertIds || []
      }).returning();
      return result[0];
    }),
    updateStatus: publicProcedure.input(z2.object({
      id: z2.number(),
      status: z2.enum(["open", "in_progress", "resolved", "closed"])
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const updateData = {
        status: input.status,
        updatedAt: /* @__PURE__ */ new Date()
      };
      if (input.status === "resolved") updateData.resolvedAt = /* @__PURE__ */ new Date();
      if (input.status === "closed") updateData.closedAt = /* @__PURE__ */ new Date();
      await db.update(incidents).set(updateData).where(eq2(incidents.id, input.id));
      return { success: true };
    }),
    stats: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return { total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0 };
      const result = await db.select({
        status: incidents.status,
        count: sql2`count(*)::int`
      }).from(incidents).groupBy(incidents.status);
      const stats = { total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0 };
      result.forEach((r) => {
        const count = Number(r.count);
        stats.total += count;
        if (r.status === "open") stats.open = count;
        else if (r.status === "in_progress") stats.inProgress = count;
        else if (r.status === "resolved") stats.resolved = count;
        else if (r.status === "closed") stats.closed = count;
      });
      return stats;
    })
  }),
  // Events router (general events/activity log)
  events: router({
    list: publicProcedure.input(z2.object({
      type: z2.string().optional(),
      severity: z2.enum(["info", "low", "medium", "high", "critical"]).optional(),
      buildingId: z2.number().optional(),
      floorId: z2.number().optional(),
      limit: z2.number().default(100)
    }).optional()).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const conditions = [];
      if (input?.severity) conditions.push(eq2(events.severity, input.severity));
      if (input?.buildingId) conditions.push(eq2(events.buildingId, input.buildingId));
      if (input?.floorId) conditions.push(eq2(events.floorId, input.floorId));
      if (conditions.length > 0) {
        return await db.select().from(events).where(and(...conditions)).orderBy(desc(events.timestamp)).limit(input?.limit || 100);
      }
      return await db.select().from(events).orderBy(desc(events.timestamp)).limit(input?.limit || 100);
    })
  }),
  // Dashboard stats
  dashboard: router({
    overview: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return {
        totalCameras: 0,
        camerasOnline: 0,
        activeAlerts: 0,
        criticalAlerts: 0,
        openIncidents: 0,
        trackedEntities: 0,
        recentEvents: 0
      };
      const [cameraStats, alertStats, incidentStats, entityCount, eventCount] = await Promise.all([
        db.select({
          total: sql2`count(*)::int`,
          online: sql2`count(*) filter (where status = 'online')::int`
        }).from(cameras),
        db.select({
          active: sql2`count(*) filter (where status = 'active')::int`,
          critical: sql2`count(*) filter (where status = 'active' and severity = 'critical')::int`
        }).from(alerts),
        db.select({
          open: sql2`count(*) filter (where status = 'open' or status = 'in_progress')::int`
        }).from(incidents),
        db.select({
          count: sql2`count(*)::int`
        }).from(trackedEntities).where(gte(trackedEntities.lastSeenAt, new Date(Date.now() - 5 * 60 * 1e3))),
        db.select({
          count: sql2`count(*)::int`
        }).from(events).where(gte(events.timestamp, new Date(Date.now() - 60 * 60 * 1e3)))
      ]);
      return {
        totalCameras: Number(cameraStats[0]?.total || 0),
        camerasOnline: Number(cameraStats[0]?.online || 0),
        activeAlerts: Number(alertStats[0]?.active || 0),
        criticalAlerts: Number(alertStats[0]?.critical || 0),
        openIncidents: Number(incidentStats[0]?.open || 0),
        trackedEntities: Number(entityCount[0]?.count || 0),
        recentEvents: Number(eventCount[0]?.count || 0)
      };
    })
  }),
  // Sensors router
  sensors: router({
    list: publicProcedure.input(z2.object({
      buildingId: z2.number().optional(),
      floorId: z2.number().optional(),
      type: z2.enum(["motion", "glass_break", "smoke", "temperature", "occupancy"]).optional()
    }).optional()).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const conditions = [];
      if (input?.buildingId) conditions.push(eq2(sensors.buildingId, input.buildingId));
      if (input?.floorId) conditions.push(eq2(sensors.floorId, input.floorId));
      if (input?.type) conditions.push(eq2(sensors.type, input.type));
      if (conditions.length > 0) {
        return await db.select().from(sensors).where(and(...conditions)).orderBy(sensors.name);
      }
      return await db.select().from(sensors).orderBy(sensors.name);
    })
  }),
  // Access Readers router
  accessReaders: router({
    list: publicProcedure.input(z2.object({
      buildingId: z2.number().optional(),
      floorId: z2.number().optional()
    }).optional()).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const conditions = [];
      if (input?.buildingId) conditions.push(eq2(accessReaders.buildingId, input.buildingId));
      if (input?.floorId) conditions.push(eq2(accessReaders.floorId, input.floorId));
      if (conditions.length > 0) {
        return await db.select().from(accessReaders).where(and(...conditions)).orderBy(accessReaders.name);
      }
      return await db.select().from(accessReaders).orderBy(accessReaders.name);
    })
  }),
  // Zones router
  zones: router({
    list: publicProcedure.input(z2.object({ floorId: z2.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(zones).where(eq2(zones.floorId, input.floorId)).orderBy(zones.name);
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// api/index.ts
var app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext
  })
);
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
var index_default = app;
export {
  index_default as default
};
