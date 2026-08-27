const db = require('../config/db');

const migrateAuthTables = async () => {
  try {
    console.log("Setting up Users and Admin Users tables for Google OAuth...");

    // 1. Create customers / storefront users table if not exists
    const createUsersTableSql = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        google_id VARCHAR(255) DEFAULT NULL UNIQUE,
        avatar_url VARCHAR(500) DEFAULT NULL,
        phone VARCHAR(50) DEFAULT NULL,
        password_hash VARCHAR(255) DEFAULT NULL,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    await db.promise().query(createUsersTableSql);
    console.log("✓ users table verified.");

    // 2. Add google_id and email to admin_users if not present
    try {
      await db.promise().query(`ALTER TABLE admin_users ADD COLUMN google_id VARCHAR(255) DEFAULT NULL UNIQUE`);
    } catch (e) {
      // Column might already exist
    }

    try {
      await db.promise().query(`ALTER TABLE admin_users ADD COLUMN email VARCHAR(255) DEFAULT NULL`);
    } catch (e) {
      // Column might already exist
    }

    try {
      await db.promise().query(`ALTER TABLE admin_users ADD COLUMN avatar_url VARCHAR(500) DEFAULT NULL`);
    } catch (e) {
      // Column might already exist
    }

    console.log("✓ admin_users table updated.");
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
};

migrateAuthTables();
