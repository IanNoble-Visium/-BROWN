export const ENV = {
  cookieSecret: process.env.JWT_SECRET || "brown-eli-demo-secret-key-2024",
  databaseUrl: process.env.DATABASE_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",
  port: parseInt(process.env.PORT || "3000"),
};
