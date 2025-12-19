import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { 
  buildings, floors, cameras, sensors, accessReaders, wifiAccessPoints,
  trackedEntities, locationEvents, events, alerts, incidents, 
  zones, config, auditLogs, demoScenarios
} from "../drizzle/schema";
import { eq, desc, and, gte, lte, sql, or, like } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { sdk } from "./_core/sdk";

export const appRouter = router({
  system: systemRouter,
  
  // Authentication router
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    
    // Demo login with admin/admin
    demoLogin: publicProcedure
      .input(z.object({
        username: z.string(),
        password: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (input.username === "admin" && input.password === "admin") {
          const token = await sdk.createSessionToken(input.username);
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, token, {
            ...cookieOptions,
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
          });
          return { 
            success: true, 
            user: { username: "admin", role: "admin", name: "Demo Administrator" },
            token 
          };
        }
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
      }),
  }),

  // Buildings router
  buildings: router({
    list: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(buildings).orderBy(buildings.name);
    }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        const result = await db.select().from(buildings).where(eq(buildings.id, input.id)).limit(1);
        return result[0] || null;
      }),
      
    create: publicProcedure
      .input(z.object({
        name: z.string(),
        code: z.string().optional(),
        address: z.string().optional(),
        floorsCount: z.number().optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const result = await db.insert(buildings).values(input).returning();
        return result[0];
      }),
  }),

  // Floors router
  floors: router({
    list: publicProcedure
      .input(z.object({ buildingId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        if (input?.buildingId) {
          return await db.select().from(floors).where(eq(floors.buildingId, input.buildingId)).orderBy(floors.level);
        }
        return await db.select().from(floors).orderBy(floors.buildingId, floors.level);
      }),
      
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        const result = await db.select().from(floors).where(eq(floors.id, input.id)).limit(1);
        return result[0] || null;
      }),
  }),

  // Cameras router
  cameras: router({
    list: publicProcedure
      .input(z.object({ 
        buildingId: z.number().optional(),
        floorId: z.number().optional(),
        status: z.enum(["online", "offline", "maintenance", "error"]).optional(),
      }).optional())
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        let query = db.select().from(cameras);
        const conditions = [];
        if (input?.buildingId) conditions.push(eq(cameras.buildingId, input.buildingId));
        if (input?.floorId) conditions.push(eq(cameras.floorId, input.floorId));
        if (input?.status) conditions.push(eq(cameras.status, input.status));
        if (conditions.length > 0) {
          return await db.select().from(cameras).where(and(...conditions)).orderBy(cameras.name);
        }
        return await db.select().from(cameras).orderBy(cameras.name);
      }),
      
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        const result = await db.select().from(cameras).where(eq(cameras.id, input.id)).limit(1);
        return result[0] || null;
      }),
      
    updateStatus: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["online", "offline", "maintenance", "error"]),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.update(cameras).set({ status: input.status, updatedAt: new Date() }).where(eq(cameras.id, input.id));
        return { success: true };
      }),
      
    stats: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return { total: 0, online: 0, offline: 0, maintenance: 0, error: 0 };
      const result = await db.select({
        status: cameras.status,
        count: sql<number>`count(*)::int`,
      }).from(cameras).groupBy(cameras.status);
      
      const stats = { total: 0, online: 0, offline: 0, maintenance: 0, error: 0 };
      result.forEach(r => {
        const count = Number(r.count);
        stats.total += count;
        if (r.status === "online") stats.online = count;
        else if (r.status === "offline") stats.offline = count;
        else if (r.status === "maintenance") stats.maintenance = count;
        else if (r.status === "error") stats.error = count;
      });
      return stats;
    }),
  }),

  // Tracked Entities router
  entities: router({
    list: publicProcedure
      .input(z.object({
        floorId: z.number().optional(),
        role: z.enum(["staff", "student", "visitor", "contractor", "unknown"]).optional(),
        isWatchlist: z.boolean().optional(),
      }).optional())
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const conditions = [];
        if (input?.floorId) conditions.push(eq(trackedEntities.lastFloorId, input.floorId));
        if (input?.role) conditions.push(eq(trackedEntities.role, input.role));
        if (input?.isWatchlist !== undefined) conditions.push(eq(trackedEntities.isWatchlist, input.isWatchlist));
        if (conditions.length > 0) {
          return await db.select().from(trackedEntities).where(and(...conditions)).orderBy(desc(trackedEntities.lastSeenAt));
        }
        return await db.select().from(trackedEntities).orderBy(desc(trackedEntities.lastSeenAt));
      }),
      
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        const result = await db.select().from(trackedEntities).where(eq(trackedEntities.id, input.id)).limit(1);
        return result[0] || null;
      }),
      
    getLocationHistory: publicProcedure
      .input(z.object({
        entityId: z.number(),
        minutes: z.number().default(30),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const since = new Date(Date.now() - input.minutes * 60 * 1000);
        return await db.select().from(locationEvents)
          .where(and(
            eq(locationEvents.entityId, input.entityId),
            gte(locationEvents.timestamp, since)
          ))
          .orderBy(locationEvents.timestamp);
      }),
      
    stats: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return { total: 0, staff: 0, students: 0, visitors: 0, unknown: 0, watchlist: 0 };
      
      const roleResult = await db.select({
        role: trackedEntities.role,
        count: sql<number>`count(*)::int`,
      }).from(trackedEntities).groupBy(trackedEntities.role);
      
      const watchlistResult = await db.select({
        count: sql<number>`count(*)::int`,
      }).from(trackedEntities).where(eq(trackedEntities.isWatchlist, true));
      
      const stats = { total: 0, staff: 0, students: 0, visitors: 0, unknown: 0, watchlist: 0 };
      roleResult.forEach(r => {
        const count = Number(r.count);
        stats.total += count;
        if (r.role === "staff") stats.staff = count;
        else if (r.role === "student") stats.students = count;
        else if (r.role === "visitor") stats.visitors = count;
        else stats.unknown += count;
      });
      stats.watchlist = Number(watchlistResult[0]?.count || 0);
      return stats;
    }),
  }),

  // Location Events router (for real-time tracking)
  locations: router({
    current: publicProcedure
      .input(z.object({ floorId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        // Get latest location for each entity on this floor
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        return await db.select({
          entityId: trackedEntities.id,
          displayName: trackedEntities.displayName,
          role: trackedEntities.role,
          isWatchlist: trackedEntities.isWatchlist,
          x: trackedEntities.lastX,
          y: trackedEntities.lastY,
          lastSeenAt: trackedEntities.lastSeenAt,
        }).from(trackedEntities)
          .where(and(
            eq(trackedEntities.lastFloorId, input.floorId),
            gte(trackedEntities.lastSeenAt, fiveMinutesAgo)
          ));
      }),
      
    record: publicProcedure
      .input(z.object({
        entityId: z.number(),
        floorId: z.number(),
        sourceType: z.enum(["wifi", "rfid", "facial", "phone", "motion", "manual"]),
        x: z.string(),
        y: z.string(),
        confidence: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        
        // Record location event
        await db.insert(locationEvents).values({
          entityId: input.entityId,
          floorId: input.floorId,
          sourceType: input.sourceType,
          x: input.x,
          y: input.y,
          confidence: input.confidence || "0.8",
        });
        
        // Update entity's last known position
        await db.update(trackedEntities).set({
          lastFloorId: input.floorId,
          lastX: input.x,
          lastY: input.y,
          lastSeenAt: new Date(),
          updatedAt: new Date(),
        }).where(eq(trackedEntities.id, input.entityId));
        
        return { success: true };
      }),
  }),

  // Alerts router
  alerts: router({
    list: publicProcedure
      .input(z.object({
        status: z.enum(["active", "acknowledged", "investigating", "resolved", "false_alarm"]).optional(),
        severity: z.enum(["low", "medium", "high", "critical"]).optional(),
        type: z.enum(["weapon", "intrusion", "anomaly", "crowd", "access_violation", "system", "person_down", "fire"]).optional(),
        limit: z.number().default(50),
      }).optional())
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const conditions = [];
        if (input?.status) conditions.push(eq(alerts.status, input.status));
        if (input?.severity) conditions.push(eq(alerts.severity, input.severity));
        if (input?.type) conditions.push(eq(alerts.type, input.type));
        if (conditions.length > 0) {
          return await db.select().from(alerts).where(and(...conditions)).orderBy(desc(alerts.createdAt)).limit(input?.limit || 50);
        }
        return await db.select().from(alerts).orderBy(desc(alerts.createdAt)).limit(input?.limit || 50);
      }),
      
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        const result = await db.select().from(alerts).where(eq(alerts.id, input.id)).limit(1);
        return result[0] || null;
      }),
      
    updateStatus: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["active", "acknowledged", "investigating", "resolved", "false_alarm"]),
        resolutionNotes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        
        const updateData: Record<string, unknown> = { 
          status: input.status, 
          updatedAt: new Date() 
        };
        
        if (input.status === "resolved" || input.status === "false_alarm") {
          updateData.resolvedAt = new Date();
          if (input.resolutionNotes) updateData.resolutionNotes = input.resolutionNotes;
        }
        if (input.status === "acknowledged") {
          updateData.acknowledgedAt = new Date();
        }
        
        await db.update(alerts).set(updateData).where(eq(alerts.id, input.id));
        return { success: true };
      }),
      
    create: publicProcedure
      .input(z.object({
        type: z.enum(["weapon", "intrusion", "anomaly", "crowd", "access_violation", "system", "person_down", "fire"]),
        severity: z.enum(["low", "medium", "high", "critical"]),
        title: z.string(),
        description: z.string().optional(),
        buildingId: z.number().optional(),
        floorId: z.number().optional(),
        x: z.string().optional(),
        y: z.string().optional(),
        aiConfidence: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const result = await db.insert(alerts).values(input).returning();
        return result[0];
      }),
      
    stats: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return { total: 0, active: 0, critical: 0, high: 0, medium: 0, low: 0 };
      
      const statusResult = await db.select({
        status: alerts.status,
        count: sql<number>`count(*)::int`,
      }).from(alerts).groupBy(alerts.status);
      
      const severityResult = await db.select({
        severity: alerts.severity,
        count: sql<number>`count(*)::int`,
      }).from(alerts).where(eq(alerts.status, "active")).groupBy(alerts.severity);
      
      const stats = { total: 0, active: 0, critical: 0, high: 0, medium: 0, low: 0 };
      statusResult.forEach(r => {
        const count = Number(r.count);
        stats.total += count;
        if (r.status === "active") stats.active = count;
      });
      severityResult.forEach(r => {
        const count = Number(r.count);
        if (r.severity === "critical") stats.critical = count;
        else if (r.severity === "high") stats.high = count;
        else if (r.severity === "medium") stats.medium = count;
        else if (r.severity === "low") stats.low = count;
      });
      return stats;
    }),
  }),

  // Incidents router
  incidents: router({
    list: publicProcedure
      .input(z.object({
        status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
        priority: z.enum(["low", "medium", "high", "critical"]).optional(),
        limit: z.number().default(50),
      }).optional())
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const conditions = [];
        if (input?.status) conditions.push(eq(incidents.status, input.status));
        if (input?.priority) conditions.push(eq(incidents.priority, input.priority));
        if (conditions.length > 0) {
          return await db.select().from(incidents).where(and(...conditions)).orderBy(desc(incidents.createdAt)).limit(input?.limit || 50);
        }
        return await db.select().from(incidents).orderBy(desc(incidents.createdAt)).limit(input?.limit || 50);
      }),
      
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        const result = await db.select().from(incidents).where(eq(incidents.id, input.id)).limit(1);
        return result[0] || null;
      }),
      
    create: publicProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        priority: z.enum(["low", "medium", "high", "critical"]),
        buildingId: z.number().optional(),
        floorId: z.number().optional(),
        linkedAlertIds: z.array(z.number()).optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const result = await db.insert(incidents).values({
          ...input,
          linkedAlertIds: input.linkedAlertIds || [],
        }).returning();
        return result[0];
      }),
      
    updateStatus: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["open", "in_progress", "resolved", "closed"]),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        
        const updateData: Record<string, unknown> = { 
          status: input.status, 
          updatedAt: new Date() 
        };
        
        if (input.status === "resolved") updateData.resolvedAt = new Date();
        if (input.status === "closed") updateData.closedAt = new Date();
        
        await db.update(incidents).set(updateData).where(eq(incidents.id, input.id));
        return { success: true };
      }),
      
    stats: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return { total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0 };
      
      const result = await db.select({
        status: incidents.status,
        count: sql<number>`count(*)::int`,
      }).from(incidents).groupBy(incidents.status);
      
      const stats = { total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0 };
      result.forEach(r => {
        const count = Number(r.count);
        stats.total += count;
        if (r.status === "open") stats.open = count;
        else if (r.status === "in_progress") stats.inProgress = count;
        else if (r.status === "resolved") stats.resolved = count;
        else if (r.status === "closed") stats.closed = count;
      });
      return stats;
    }),
  }),

  // Events router (general events/activity log)
  events: router({
    list: publicProcedure
      .input(z.object({
        type: z.string().optional(),
        severity: z.enum(["info", "low", "medium", "high", "critical"]).optional(),
        buildingId: z.number().optional(),
        floorId: z.number().optional(),
        limit: z.number().default(100),
      }).optional())
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const conditions = [];
        if (input?.severity) conditions.push(eq(events.severity, input.severity));
        if (input?.buildingId) conditions.push(eq(events.buildingId, input.buildingId));
        if (input?.floorId) conditions.push(eq(events.floorId, input.floorId));
        if (conditions.length > 0) {
          return await db.select().from(events).where(and(...conditions)).orderBy(desc(events.timestamp)).limit(input?.limit || 100);
        }
        return await db.select().from(events).orderBy(desc(events.timestamp)).limit(input?.limit || 100);
      }),
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
        recentEvents: 0,
      };
      
      const [cameraStats, alertStats, incidentStats, entityCount, eventCount] = await Promise.all([
        db.select({
          total: sql<number>`count(*)::int`,
          online: sql<number>`count(*) filter (where status = 'online')::int`,
        }).from(cameras),
        db.select({
          active: sql<number>`count(*) filter (where status = 'active')::int`,
          critical: sql<number>`count(*) filter (where status = 'active' and severity = 'critical')::int`,
        }).from(alerts),
        db.select({
          open: sql<number>`count(*) filter (where status = 'open' or status = 'in_progress')::int`,
        }).from(incidents),
        db.select({
          count: sql<number>`count(*)::int`,
        }).from(trackedEntities).where(gte(trackedEntities.lastSeenAt, new Date(Date.now() - 5 * 60 * 1000))),
        db.select({
          count: sql<number>`count(*)::int`,
        }).from(events).where(gte(events.timestamp, new Date(Date.now() - 60 * 60 * 1000))),
      ]);
      
      return {
        totalCameras: Number(cameraStats[0]?.total || 0),
        camerasOnline: Number(cameraStats[0]?.online || 0),
        activeAlerts: Number(alertStats[0]?.active || 0),
        criticalAlerts: Number(alertStats[0]?.critical || 0),
        openIncidents: Number(incidentStats[0]?.open || 0),
        trackedEntities: Number(entityCount[0]?.count || 0),
        recentEvents: Number(eventCount[0]?.count || 0),
      };
    }),
  }),

  // Sensors router
  sensors: router({
    list: publicProcedure
      .input(z.object({
        buildingId: z.number().optional(),
        floorId: z.number().optional(),
        type: z.enum(["motion", "glass_break", "smoke", "temperature", "occupancy"]).optional(),
      }).optional())
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const conditions = [];
        if (input?.buildingId) conditions.push(eq(sensors.buildingId, input.buildingId));
        if (input?.floorId) conditions.push(eq(sensors.floorId, input.floorId));
        if (input?.type) conditions.push(eq(sensors.type, input.type));
        if (conditions.length > 0) {
          return await db.select().from(sensors).where(and(...conditions)).orderBy(sensors.name);
        }
        return await db.select().from(sensors).orderBy(sensors.name);
      }),
  }),

  // Access Readers router
  accessReaders: router({
    list: publicProcedure
      .input(z.object({
        buildingId: z.number().optional(),
        floorId: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const conditions = [];
        if (input?.buildingId) conditions.push(eq(accessReaders.buildingId, input.buildingId));
        if (input?.floorId) conditions.push(eq(accessReaders.floorId, input.floorId));
        if (conditions.length > 0) {
          return await db.select().from(accessReaders).where(and(...conditions)).orderBy(accessReaders.name);
        }
        return await db.select().from(accessReaders).orderBy(accessReaders.name);
      }),
  }),

  // Zones router
  zones: router({
    list: publicProcedure
      .input(z.object({ floorId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        return await db.select().from(zones).where(eq(zones.floorId, input.floorId)).orderBy(zones.name);
      }),
  }),
});

export type AppRouter = typeof appRouter;
