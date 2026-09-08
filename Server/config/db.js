const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mysql = require("mysql2");
const fs = require("fs");

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

const dbHost = process.env.DB_HOST || process.env.TIDB_HOST || 'localhost';
// Default to port 3306 (TiDB Cloud supports both 4000 and 3306; 3306 is open across networks)
const dbPort = Number(process.env.DB_PORT || process.env.TIDB_PORT) || 3306;
const dbUser = process.env.DB_USER || process.env.TIDB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || process.env.TIDB_PASSWORD || '';
const dbName = process.env.DB_NAME || process.env.TIDB_DATABASE || process.env.TIDB_NAME || 'HummingTone';

const poolConfig = {
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  waitForConnections: true,
  connectionLimit: 15,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  connectTimeout: 30000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
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
