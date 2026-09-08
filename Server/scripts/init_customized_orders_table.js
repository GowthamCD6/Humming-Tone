const db = require('../config/db');

const applyCustomizedOrdersMigration = async () => {
  try {
    console.log("=========================================");
    console.log("Checking and Creating `customized_orders` Table");
    console.log("=========================================");

    await db.promise().query(`
      CREATE TABLE IF NOT EXISTS customized_orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        order_number VARCHAR(100) NOT NULL,
        user_id INT DEFAULT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50) DEFAULT NULL,
        customer_address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        pincode VARCHAR(20),
        
        -- Garment Specs
        garment_color_name VARCHAR(100),
        garment_color_hex VARCHAR(20),
        garment_front_image TEXT,
        garment_back_image TEXT,
        fabric_name VARCHAR(150),
        fabric_weight VARCHAR(50),
        size VARCHAR(50),
        quantity INT NOT NULL DEFAULT 1,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        
        -- Front Customization
        has_custom_front TINYINT(1) DEFAULT 0,
        front_design_type ENUM('gallery', 'upload', 'none') DEFAULT 'none',
        front_design_name VARCHAR(255) DEFAULT NULL,
        front_image_url LONGTEXT DEFAULT NULL,
        front_text VARCHAR(255) DEFAULT NULL,
        front_font VARCHAR(100) DEFAULT NULL,
        front_text_color VARCHAR(50) DEFAULT NULL,
        front_placement VARCHAR(50) DEFAULT 'full',
        front_scale DECIMAL(5,2) DEFAULT 1.00,
        front_rotation INT DEFAULT 0,
        front_flip_h TINYINT(1) DEFAULT 0,
        front_pos_x INT DEFAULT 0,
        front_pos_y INT DEFAULT 0,
        front_text_pos_x INT DEFAULT 0,
        front_text_pos_y INT DEFAULT 0,
        front_preview_url LONGTEXT DEFAULT NULL,
        front_fee DECIMAL(10,2) DEFAULT 0.00,
        
        -- Back Customization
        has_custom_back TINYINT(1) DEFAULT 0,
        back_design_type ENUM('gallery', 'upload', 'none') DEFAULT 'none',
        back_design_name VARCHAR(255) DEFAULT NULL,
        back_image_url LONGTEXT DEFAULT NULL,
        back_text VARCHAR(255) DEFAULT NULL,
        back_font VARCHAR(100) DEFAULT NULL,
        back_text_color VARCHAR(50) DEFAULT NULL,
        back_placement VARCHAR(50) DEFAULT 'full',
        back_scale DECIMAL(5,2) DEFAULT 1.00,
        back_rotation INT DEFAULT 0,
        back_flip_h TINYINT(1) DEFAULT 0,
        back_pos_x INT DEFAULT 0,
        back_pos_y INT DEFAULT 0,
        back_text_pos_x INT DEFAULT 0,
        back_text_pos_y INT DEFAULT 0,
        back_preview_url LONGTEXT DEFAULT NULL,
        back_fee DECIMAL(10,2) DEFAULT 0.00,
        
        -- Raw JSON for complete design restoration
        custom_details_json JSON DEFAULT NULL,
        
        status ENUM('pending', 'confirmed', 'in_production', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_cust_ord_order_id (order_id),
        INDEX idx_cust_ord_number (order_number),
        INDEX idx_cust_ord_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log("✓ `customized_orders` table created/verified.");

    // Check / Alter `order_items` table to add is_custom, custom_details, and allow product_id to be NULL or default
    const [orderItemCols] = await db.promise().query("SHOW COLUMNS FROM order_items");
    const orderItemColNames = orderItemCols.map(c => c.Field);

    if (!orderItemColNames.includes("is_custom")) {
      await db.promise().query("ALTER TABLE order_items ADD COLUMN is_custom TINYINT(1) DEFAULT 0");
      console.log("✓ Added `is_custom` to order_items.");
    }

    if (!orderItemColNames.includes("custom_preview_image")) {
      await db.promise().query("ALTER TABLE order_items ADD COLUMN custom_preview_image LONGTEXT DEFAULT NULL");
      console.log("✓ Added `custom_preview_image` to order_items.");
    }

    if (!orderItemColNames.includes("custom_details")) {
      await db.promise().query("ALTER TABLE order_items ADD COLUMN custom_details JSON DEFAULT NULL");
      console.log("✓ Added `custom_details` to order_items.");
    }

    // Ensure product_id can accept null or custom reference if needed
    try {
      await db.promise().query("ALTER TABLE order_items MODIFY COLUMN product_id INT NULL");
      console.log("✓ `order_items.product_id` modified to allow NULL.");
    } catch (e) {
      console.log("Notice on product_id NULL:", e.message);
    }

    console.log("=========================================");
    console.log("Customized Orders Migration Completed Successfully!");
    console.log("=========================================");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
};

applyCustomizedOrdersMigration();
