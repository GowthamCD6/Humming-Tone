require("dotenv").config();
const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");

// Load TiDB SSL certificate (isrgrootx1.pem) if available or if DB_SSL is enabled / remote host is used
const sslCertPath = process.env.DB_SSL_CA || path.join(__dirname, "../isrgrootx1.pem");
let sslConfig = undefined;

if (process.env.DB_SSL === "true" || process.env.TIDB_ENABLE_SSL === "true" || (process.env.DB_HOST && !process.env.DB_HOST.includes("localhost") && !process.env.DB_HOST.includes("127.0.0.1"))) {
  try {
    if (fs.existsSync(sslCertPath)) {
      sslConfig = {
        ca: fs.readFileSync(sslCertPath),
        minVersion: "TLSv1.2",
        rejectUnauthorized: true
      };
      console.log("🔒 [Database] TiDB SSL certificate loaded successfully from:", path.basename(sslCertPath));
    } else {
      sslConfig = {
        minVersion: "TLSv1.2",
        rejectUnauthorized: true
      };
    }
  } catch (err) {
    console.error("⚠️ [Database] Failed to read SSL certificate file:", err.message);
  }
}

const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 4000,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hummingtone',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 30000,
  enableKeepAlive: true,
};

if (sslConfig) {
  poolConfig.ssl = sslConfig;
}

const pool = mysql.createPool(poolConfig);

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
