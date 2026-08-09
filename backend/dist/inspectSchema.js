"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("./config/db"));
async function inspectDatabaseSchema() {
    try {
        const [tables] = await db_1.default.query("SHOW TABLES");
        console.log("Existing Tables:", tables);
        const dbName = process.env.DB_NAME || "railway";
        for (const tableObj of tables) {
            const tableName = Object.values(tableObj)[0];
            console.log(`\n=================== TABLE: ${tableName} ===================`);
            const [columns] = await db_1.default.query(`DESCRIBE \`${tableName}\``);
            console.log(columns);
        }
    }
    catch (err) {
        console.error("Schema inspection error:", err);
    }
    finally {
        process.exit(0);
    }
}
inspectDatabaseSchema();
