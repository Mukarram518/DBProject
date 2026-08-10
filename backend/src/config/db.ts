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
      const host = parsedUrl.hostname && parsedUrl.hostname !== "localhost" ? parsedUrl.hostname : env.DB_HOST;
      const port = parsedUrl.port ? parseInt(parsedUrl.port, 10) : env.DB_PORT;
      const user = parsedUrl.username ? decodeURIComponent(parsedUrl.username) : env.DB_USER;
      const password = parsedUrl.password ? decodeURIComponent(parsedUrl.password) : env.DB_PASSWORD;
      const database = parsedUrl.pathname && parsedUrl.pathname !== "/" ? parsedUrl.pathname.replace(/^\//, "") : env.DB_NAME;

      console.log(`Connecting to MySQL database at ${host}:${port}/${database} as user ${user}`);

      return mysql.createPool({
        host,
        port,
        user,
        password,
        database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 20000,
        enableKeepAlive: true,
        ssl: { rejectUnauthorized: false },
      });
    } catch (e) {
      console.warn("Could not parse connection string, using direct string pool creation:", e);
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
