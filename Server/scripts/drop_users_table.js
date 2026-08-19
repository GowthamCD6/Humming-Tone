require("dotenv").config();
const db = require("../config/db");

async function dropUsersTable() {
  try {
    await db.promise().query("DROP TABLE IF EXISTS users;");
    console.log("Successfully dropped unused 'users' table from database.");
  } catch (error) {
    console.error("Drop table error:", error);
  } finally {
    process.exit(0);
  }
}

dropUsersTable();
