import mysql from "mysql2/promise";
import { env } from "./env";

function createMysqlPool(): mysql.Pool {
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.MYSQL_URL ||
    process.env.MYSQLPRIVATEURL ||
    env.DATABASE_URL;

  if (connectionString) {
    try {
      const parsedUrl = new URL(connectionString);
      return mysql.createPool({
        host: parsedUrl.hostname,
        port: parseInt(parsedUrl.port || "3306", 10),
        user: decodeURIComponent(parsedUrl.username || "root"),
        password: decodeURIComponent(parsedUrl.password || ""),
        database: parsedUrl.pathname.replace(/^\//, "") || "railway",
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 20000,
        enableKeepAlive: true,
        ssl: { rejectUnauthorized: false },
      });
    } catch (e) {
      console.warn("Could not parse DATABASE_URL string, using direct string pool creation:", e);
      return mysql.createPool(connectionString);
    }
  }

  return mysql.createPool({
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
    ssl: { rejectUnauthorized: false },
  });
}

const pool = createMysqlPool();

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
