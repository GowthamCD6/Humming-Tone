require("dotenv").config();
const mysql = require("mysql2");

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "Rithish@2006",
    database: process.env.DB_NAME || "humming_tone",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

pool.getConnection((err, connection) => {
    if(err) {
        console.log("An error occured while connecting to the database:", err);
    } else {
        console.log("db connected successfully");
        connection.release();
    }
})

module.exports = pool;