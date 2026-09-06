const db = require('../config/db');

const sql = `
CREATE TABLE IF NOT EXISTS customize_tshirts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  color_name VARCHAR(50) NOT NULL,
  color_hex VARCHAR(20) NOT NULL,
  front_image LONGTEXT NOT NULL,
  back_image LONGTEXT NOT NULL,
  base_price DECIMAL(10,2) DEFAULT 699.00,
  display_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

db.query(sql, (err, res) => {
  if (err) {
    console.error('Error creating customize_tshirts:', err);
    process.exit(1);
  }
  console.log('customize_tshirts table created/verified successfully');
  process.exit(0);
});
