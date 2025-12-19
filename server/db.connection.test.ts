import { describe, expect, it } from "vitest";
import { neon } from "@neondatabase/serverless";

describe("Neon Database Connection", () => {
  it("should connect to Neon PostgreSQL and execute a simple query", async () => {
    const dbUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
    
    if (!dbUrl) {
      console.warn("No database URL configured, skipping connection test");
      return;
    }

    const sql = neon(dbUrl);
    
    // Execute a simple query to verify connection
    const result = await sql`SELECT 1 as test_value`;
    
    expect(result).toBeDefined();
    expect(result.length).toBe(1);
    expect(result[0].test_value).toBe(1);
  });

  it("should verify the database is PostgreSQL", async () => {
    const dbUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
    
    if (!dbUrl) {
      console.warn("No database URL configured, skipping version test");
      return;
    }

    const sql = neon(dbUrl);
    
    // Get PostgreSQL version
    const result = await sql`SELECT version()`;
    
    expect(result).toBeDefined();
    expect(result.length).toBe(1);
    expect(result[0].version).toContain("PostgreSQL");
  });
});
