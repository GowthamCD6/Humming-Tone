const db = require('../config/db');

const sql = `
CREATE TABLE IF NOT EXISTS customize_designs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(100) DEFAULT 'General',
  image_url LONGTEXT NOT NULL,
  price DECIMAL(10,2) DEFAULT 0.00,
  display_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

db.query(sql, (err) => {
  if (err) {
    console.error('Error creating customize_designs table:', err);
    process.exit(1);
  }
  console.log('customize_designs table verified/created successfully.');
  process.exit(0);
});
