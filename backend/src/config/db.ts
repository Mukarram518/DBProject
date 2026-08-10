import mysql from "mysql2/promise";
import { env } from "./env";

let pool: mysql.Pool;

if (env.DATABASE_URL) {
  pool = mysql.createPool({
    uri: env.DATABASE_URL,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 20000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  });
} else {
  pool = mysql.createPool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 20000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  });
}

export async function testConnection(): Promise<{ connected: boolean; error?: string }> {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log("Successfully connected to MySQL database on Railway/Host.");
    return { connected: true };
  } catch (error: any) {
    console.error("MySQL connection error:", error?.message || error);
    return { connected: false, error: error?.message || String(error) };
  }
}

export default pool;
