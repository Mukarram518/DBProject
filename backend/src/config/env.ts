import dotenv from "dotenv";
import path from "path";

// Load environment variables from backend/.env or root .env
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

export const env = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL:
    process.env.DATABASE_URL ||
    process.env.MYSQL_URL ||
    process.env.MYSQLPRIVATEURL ||
    "mysql://root:mRtYVZRTLHwdYsjpzbaBhumQgQDKSNEE@altaria.proxy.rlwy.net:48128/railway",
  DB_HOST: process.env.DB_HOST || process.env.MYSQLHOST || "altaria.proxy.rlwy.net",
  DB_PORT: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : (process.env.MYSQLPORT ? parseInt(process.env.MYSQLPORT, 10) : 48128),
  DB_USER: process.env.DB_USER || process.env.MYSQLUSER || "root",
  DB_PASSWORD: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || "mRtYVZRTLHwdYsjpzbaBhumQgQDKSNEE",
  DB_NAME: process.env.DB_NAME || process.env.MYSQLDATABASE || "railway",
  JWT_SECRET: process.env.JWT_SECRET || "super-secret-jwt-key-shop-shine-realm-2026",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  FRONTEND_URL: process.env.FRONTEND_URL || "*",
};
