const db = require('../config/db');

const createTableSql = `
  CREATE TABLE IF NOT EXISTS product_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
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
`;

db.query(createTableSql, (err, result) => {
  if (err) {
    console.error('Error creating product_reviews table:', err);
    process.exit(1);
  } else {
    console.log('product_reviews table created/verified successfully.');
    process.exit(0);
  }
});
