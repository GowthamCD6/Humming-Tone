require("dotenv").config();
const db = require("../config/db");

async function cleanupPendingOrders() {
  try {
    const [result] = await db.promise().query(
      "UPDATE orders SET payment_status = 'failed', order_status = 'cancelled' WHERE payment_verified = 0 AND payment_status = 'created' AND order_status = 'pending'"
    );
    console.log("Updated abandoned/unpaid pending orders to 'cancelled' and 'failed':", result.affectedRows, "rows affected.");

    const [rows] = await db.promise().query(
      "SELECT id, order_number, payment_id, payment_status, order_status, payment_verified, created_at FROM orders ORDER BY id DESC LIMIT 5"
    );
    console.log("Current orders in DB:", JSON.stringify(rows, null, 2));
  } catch (error) {
    console.error("Cleanup error:", error);
  } finally {
    process.exit(0);
  }
}

cleanupPendingOrders();
