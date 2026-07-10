const db = require('../config/db');

const migrate = async () => {
  db.getConnection(async (err, connection) => {
    if (err) {
      console.error("Failed to connect to database:", err.message);
      process.exit(1);
    }

    console.log("Connected to database successfully. Starting migration...");

    try {
      // 1. Check if columns already exist in 'orders' table
      const [columns] = await connection.promise().query("SHOW COLUMNS FROM orders");
      const columnNames = columns.map(c => c.Field);

      console.log("Existing columns:", columnNames);

      // Add shipping_date if it does not exist
      if (!columnNames.includes('shipping_date')) {
        console.log("Adding column shipping_date...");
        await connection.promise().query("ALTER TABLE orders ADD COLUMN shipping_date DATE DEFAULT NULL");
        console.log("Column shipping_date added successfully.");
      }

      // Add delivery_date if it does not exist
      if (!columnNames.includes('delivery_date')) {
        console.log("Adding column delivery_date...");
        await connection.promise().query("ALTER TABLE orders ADD COLUMN delivery_date DATE DEFAULT NULL");
        console.log("Column delivery_date added successfully.");
      }

      // Add packed_at if it does not exist
      if (!columnNames.includes('packed_at')) {
        console.log("Adding column packed_at...");
        await connection.promise().query("ALTER TABLE orders ADD COLUMN packed_at TIMESTAMP NULL DEFAULT NULL");
        console.log("Column packed_at added successfully.");
      }

      // 2. Modify order_status ENUM to include 'packed' and 'out_for_delivery'
      console.log("Modifying order_status ENUM column...");
      await connection.promise().query(`
        ALTER TABLE orders MODIFY COLUMN order_status 
        ENUM('pending','confirmed','packed','shipped','out_for_delivery','delivered','cancelled') DEFAULT 'pending'
      `);
      console.log("order_status ENUM modified successfully.");

      console.log("Migration completed successfully!");
      connection.release();
      process.exit(0);
    } catch (e) {
      console.error("Migration failed:", e.message);
      connection.release();
      process.exit(1);
    }
  });
};

migrate();
