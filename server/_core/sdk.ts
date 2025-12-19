import { COOKIE_NAME } from "@shared/const";
import { ForbiddenError } from "@shared/_core/errors";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../drizzle/schema";
import { ENV } from "./env";

// Demo authentication - simple JWT for admin/admin
const DEMO_SECRET = new TextEncoder().encode(ENV.cookieSecret || "brown-eli-demo-secret-key-2024");

export type SessionPayload = {
  username: string;
  role: string;
  name: string;
};

class SDKServer {
  private parseCookies(cookieHeader: string | undefined) {
    if (!cookieHeader) {
      return new Map<string, string>();
    }

    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }

  /**
   * Create a session token for the demo user
   */
  async createSessionToken(
    username: string,
    role: string = "admin",
    name: string = "Demo Administrator"
  ): Promise<string> {
    const issuedAt = Date.now();
    const expiresInMs = 24 * 60 * 60 * 1000; // 24 hours
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1000);

    return new SignJWT({
      username,
      role,
      name,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(expirationSeconds)
      .sign(DEMO_SECRET);
  }

  async verifySession(
    cookieValue: string | undefined | null
  ): Promise<SessionPayload | null> {
    if (!cookieValue) {
      return null;
    }

    try {
      const { payload } = await jwtVerify(cookieValue, DEMO_SECRET, {
        algorithms: ["HS256"],
      });
      
      return payload as unknown as SessionPayload;
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }

  async authenticateRequest(req: Request): Promise<User | null> {
    const cookies = this.parseCookies(req.headers.cookie);
    // Support both COOKIE_NAME and demo_token for backward compatibility during transition
    const sessionCookie = cookies.get(COOKIE_NAME) || cookies.get("demo_token");
    const session = await this.verifySession(sessionCookie);

    if (!session) {
      return null;
    }

    // For demo, we return a mock user object that matches the drizzle User type
    // In a real app, you might fetch from DB. Here we just mock it for the demo.
    return {
      id: 1,
      openId: "admin",
      name: session.name,
      email: "admin@brown.edu",
      loginMethod: "password",
      role: session.role as "admin" | "user",
      lastSignedIn: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;
  }
}

export const sdk = new SDKServer();

