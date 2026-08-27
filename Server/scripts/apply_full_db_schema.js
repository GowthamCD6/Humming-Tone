const db = require('../config/db');

const applyAllDatabaseMigrations = async () => {
  try {
    console.log("=========================================");
    console.log("Checking and Applying Database Migrations");
    console.log("=========================================");

    // 1. Check / Create `users` table
    await db.promise().query(`
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_email (email),
        INDEX idx_user_google (google_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log("✓ `users` table created/verified.");

    // 2. Alter `admin_users` table
    const [adminCols] = await db.promise().query("SHOW COLUMNS FROM admin_users");
    const colNames = adminCols.map(c => c.Field);

    if (!colNames.includes("email")) {
      await db.promise().query("ALTER TABLE admin_users ADD COLUMN email VARCHAR(255) DEFAULT NULL");
      console.log("✓ Added `email` to admin_users.");
    }
    if (!colNames.includes("google_id")) {
      await db.promise().query("ALTER TABLE admin_users ADD COLUMN google_id VARCHAR(255) DEFAULT NULL");
      await db.promise().query("CREATE UNIQUE INDEX idx_admin_google ON admin_users (google_id)");
      console.log("✓ Added `google_id` with unique index to admin_users.");
    }
    if (!colNames.includes("avatar_url")) {
      await db.promise().query("ALTER TABLE admin_users ADD COLUMN avatar_url VARCHAR(500) DEFAULT NULL");
      console.log("✓ Added `avatar_url` to admin_users.");
    }
    if (!colNames.includes("updated_at")) {
      await db.promise().query("ALTER TABLE admin_users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
      console.log("✓ Added `updated_at` to admin_users.");
    }

    // 3. Alter `orders` table
    const [orderCols] = await db.promise().query("SHOW COLUMNS FROM orders");
    const orderColNames = orderCols.map(c => c.Field);

    if (!orderColNames.includes("user_id")) {
      try {
        await db.promise().query("ALTER TABLE orders ADD COLUMN user_id INT DEFAULT NULL");
        console.log("✓ Added `user_id` to orders.");
      } catch (e) {
        console.log("Notice on orders.user_id:", e.message);
      }
    }

    // 4. Create `product_reviews` table
    await db.promise().query(`
      CREATE TABLE IF NOT EXISTS product_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        user_id INT DEFAULT NULL,
        reviewer_name VARCHAR(150) NOT NULL,
        reviewer_email VARCHAR(255) NOT NULL,
        rating TINYINT NOT NULL,
        title VARCHAR(255) DEFAULT NULL,
        comment TEXT NOT NULL,
        status ENUM('approved', 'pending', 'rejected') DEFAULT 'approved',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        INDEX idx_product_status (product_id, status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log("✓ `product_reviews` table created/verified.");

    console.log("=========================================");
    console.log("All Database Migrations Applied Successfully!");
    console.log("=========================================");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
};

applyAllDatabaseMigrations();
