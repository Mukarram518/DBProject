"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables from backend/.env or root .env
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), ".env") });
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), "../.env") });
exports.env = {
    PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
    NODE_ENV: process.env.NODE_ENV || "development",
    DATABASE_URL: process.env.DATABASE_URL || process.env.MYSQL_URL || "",
    DB_HOST: process.env.DB_HOST || process.env.MYSQLHOST || "localhost",
    DB_PORT: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : (process.env.MYSQLPORT ? parseInt(process.env.MYSQLPORT, 10) : 3306),
    DB_USER: process.env.DB_USER || process.env.MYSQLUSER || "root",
    DB_PASSWORD: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || "",
    DB_NAME: process.env.DB_NAME || process.env.MYSQLDATABASE || "railway",
    JWT_SECRET: process.env.JWT_SECRET || "super-secret-jwt-key-shop-shine-realm-2026",
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
    FRONTEND_URL: process.env.FRONTEND_URL || "*",
};
