import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database module
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue({
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    execute: vi.fn().mockResolvedValue([]),
  }),
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createMockContext(authenticated = false): TrpcContext {
  const user: AuthenticatedUser | null = authenticated ? {
    id: 1,
    openId: "demo-admin",
    email: "admin@brown.edu",
    name: "Demo Administrator",
    loginMethod: "demo",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  } : null;

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
      cookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("ELI Platform API", () => {
  describe("auth.demoLogin", () => {
    it("should authenticate with valid demo credentials", async () => {
      const ctx = createMockContext(false);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.demoLogin({
        username: "admin",
        password: "admin",
      });

      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty("user");
      expect(result.user).toHaveProperty("name", "Demo Administrator");
      expect(result.user).toHaveProperty("role", "admin");
      expect(result).toHaveProperty("token");
    });

    it("should reject invalid credentials", async () => {
      const ctx = createMockContext(false);
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.auth.demoLogin({
          username: "wrong",
          password: "wrong",
        })
      ).rejects.toThrow("Invalid credentials");
    });
  });

  describe("auth.me", () => {
    it("should return null for unauthenticated user", async () => {
      const ctx = createMockContext(false);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();
      expect(result).toBeNull();
    });

    it("should return user for authenticated user", async () => {
      const ctx = createMockContext(true);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();
      expect(result).not.toBeNull();
      expect(result?.name).toBe("Demo Administrator");
      expect(result?.role).toBe("admin");
    });
  });

  describe("auth.logout", () => {
    it("should clear session and return success", async () => {
      const ctx = createMockContext(true);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.logout();
      expect(result).toEqual({ success: true });
    });
  });
});

describe("Dashboard Stats Calculation", () => {
  it("should calculate camera online percentage correctly", () => {
    const totalCameras = 666;
    const camerasOnline = 633;
    const percentage = (camerasOnline / totalCameras) * 100;
    
    expect(percentage).toBeCloseTo(95.05, 1);
  });

  it("should categorize alert severities correctly", () => {
    const alerts = [
      { severity: "critical" },
      { severity: "critical" },
      { severity: "high" },
      { severity: "medium" },
      { severity: "low" },
    ];

    const criticalCount = alerts.filter(a => a.severity === "critical").length;
    const highCount = alerts.filter(a => a.severity === "high").length;

    expect(criticalCount).toBe(2);
    expect(highCount).toBe(1);
  });

  it("should group entities by role correctly", () => {
    const entities = [
      { role: "student" },
      { role: "student" },
      { role: "staff" },
      { role: "visitor" },
      { role: "unknown" },
    ];

    const byRole = entities.reduce((acc, e) => {
      acc[e.role] = (acc[e.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    expect(byRole.student).toBe(2);
    expect(byRole.staff).toBe(1);
    expect(byRole.visitor).toBe(1);
    expect(byRole.unknown).toBe(1);
  });
});

describe("Location Tracking Calculations", () => {
  it("should calculate distance between two points", () => {
    const point1 = { x: 0, y: 0 };
    const point2 = { x: 3, y: 4 };
    
    const distance = Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + 
      Math.pow(point2.y - point1.y, 2)
    );
    
    expect(distance).toBe(5);
  });

  it("should filter entities within floor bounds", () => {
    const floorBounds = { width: 1200, height: 800 };
    const entities = [
      { x: 100, y: 100 },
      { x: 1500, y: 100 }, // out of bounds
      { x: 600, y: 400 },
      { x: 100, y: 900 }, // out of bounds
    ];

    const inBounds = entities.filter(
      e => e.x >= 0 && e.x <= floorBounds.width && 
           e.y >= 0 && e.y <= floorBounds.height
    );

    expect(inBounds.length).toBe(2);
  });

  it("should calculate trail duration correctly", () => {
    const trailDurationMinutes = 30;
    const trailDurationMs = trailDurationMinutes * 60 * 1000;
    const now = Date.now();
    const cutoffTime = now - trailDurationMs;

    const locationEvents = [
      { timestamp: now - 10 * 60 * 1000 }, // 10 min ago - include
      { timestamp: now - 20 * 60 * 1000 }, // 20 min ago - include
      { timestamp: now - 40 * 60 * 1000 }, // 40 min ago - exclude
    ];

    const recentEvents = locationEvents.filter(
      e => e.timestamp >= cutoffTime
    );

    expect(recentEvents.length).toBe(2);
  });
});

describe("Alert Severity Helpers", () => {
  it("should return correct color for severity", () => {
    const getSeverityColor = (severity: string) => {
      switch (severity) {
        case "critical": return "red";
        case "high": return "orange";
        case "medium": return "yellow";
        case "low": return "blue";
        default: return "gray";
      }
    };

    expect(getSeverityColor("critical")).toBe("red");
    expect(getSeverityColor("high")).toBe("orange");
    expect(getSeverityColor("medium")).toBe("yellow");
    expect(getSeverityColor("low")).toBe("blue");
    expect(getSeverityColor("unknown")).toBe("gray");
  });

  it("should sort alerts by severity priority", () => {
    const severityPriority: Record<string, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    const alerts = [
      { id: 1, severity: "low" },
      { id: 2, severity: "critical" },
      { id: 3, severity: "medium" },
      { id: 4, severity: "high" },
    ];

    const sorted = [...alerts].sort(
      (a, b) => (severityPriority[b.severity] || 0) - (severityPriority[a.severity] || 0)
    );

    expect(sorted[0].severity).toBe("critical");
    expect(sorted[1].severity).toBe("high");
    expect(sorted[2].severity).toBe("medium");
    expect(sorted[3].severity).toBe("low");
  });
});

describe("Camera Grid Pagination", () => {
  it("should calculate correct page count", () => {
    const totalCameras = 666;
    const pageSize = 9; // 3x3 grid
    const pageCount = Math.ceil(totalCameras / pageSize);

    expect(pageCount).toBe(74);
  });

  it("should return correct cameras for page", () => {
    const cameras = Array.from({ length: 100 }, (_, i) => ({ id: i + 1 }));
    const pageSize = 9;
    const page = 3;
    
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pageCameras = cameras.slice(start, end);

    expect(pageCameras.length).toBe(9);
    expect(pageCameras[0].id).toBe(19);
    expect(pageCameras[8].id).toBe(27);
  });
});

describe("Entity Role Classification", () => {
  it("should identify watchlist entities", () => {
    const entities = [
      { id: 1, isWatchlist: true, riskScore: 85 },
      { id: 2, isWatchlist: false, riskScore: 20 },
      { id: 3, isWatchlist: true, riskScore: 92 },
    ];

    const watchlistEntities = entities.filter(e => e.isWatchlist);
    expect(watchlistEntities.length).toBe(2);
  });

  it("should categorize risk scores correctly", () => {
    const getRiskLevel = (score: number) => {
      if (score >= 80) return "high";
      if (score >= 50) return "medium";
      return "low";
    };

    expect(getRiskLevel(90)).toBe("high");
    expect(getRiskLevel(65)).toBe("medium");
    expect(getRiskLevel(30)).toBe("low");
  });
});
