require("dotenv").config();
const mysql = require("mysql2"); // Use the non-promise version

// Create a connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', 
  database: 'humming_tone', 
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Check connection using callback
pool.getConnection((err, connection) => {
  if (err) {
    console.error("An error occurred while connecting to the database:", err);
    return;
  }
  console.log("db connected successfully");
  connection.release(); // Always release the connection after use
});

module.exports = pool;
