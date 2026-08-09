import pool from "./config/db";

async function inspectDatabaseSchema() {
  try {
    const [tables]: any = await pool.query("SHOW TABLES");
    console.log("Existing Tables:", tables);

    const dbName = process.env.DB_NAME || "railway";
    for (const tableObj of tables) {
      const tableName = Object.values(tableObj)[0] as string;
      console.log(`\n=================== TABLE: ${tableName} ===================`);
      const [columns]: any = await pool.query(`DESCRIBE \`${tableName}\``);
      console.log(columns);
    }
  } catch (err) {
    console.error("Schema inspection error:", err);
  } finally {
    process.exit(0);
  }
}

inspectDatabaseSchema();
