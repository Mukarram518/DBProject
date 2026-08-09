import pool from "./config/db";

async function fetchAllUsersFromDatabase() {
  try {
    const [rows]: any = await pool.query("SELECT * FROM users ORDER BY user_id ASC");
    console.log("=== TOTAL USERS IN RAILWAY DATABASE ===", rows.length);
    console.log(JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error("Error querying users table:", err);
  } finally {
    process.exit(0);
  }
}

fetchAllUsersFromDatabase();
