require("dotenv").config();
const mysql = require("mysql2/promise"); // Add /promise here

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'GCN@6677', 
  database: 'hummingtone', 
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Check connection (Note: promise pool uses .getConnection() without callback)
pool.getConnection()
    .then(connection => {
        console.log("db connected successfully");
        connection.release();
    })
    .catch(err => {
        console.log("An error occured while connecting to the database:", err);
    });

module.exports = pool;