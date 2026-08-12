require("dotenv").config();
const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'GCN@6677',
  database: process.env.DB_NAME || 'hummingtone',
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
