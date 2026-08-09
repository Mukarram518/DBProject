"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testConnection = testConnection;
const promise_1 = __importDefault(require("mysql2/promise"));
const env_1 = require("./env");
let pool;
if (env_1.env.DATABASE_URL) {
    pool = promise_1.default.createPool({
        uri: env_1.env.DATABASE_URL,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 20000,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
    });
}
else {
    pool = promise_1.default.createPool({
        host: env_1.env.DB_HOST,
        port: env_1.env.DB_PORT,
        user: env_1.env.DB_USER,
        password: env_1.env.DB_PASSWORD,
        database: env_1.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 20000,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
    });
}
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        console.log("Successfully connected to MySQL database on Railway/Host.");
        return true;
    }
    catch (error) {
        return false;
    }
}
exports.default = pool;
