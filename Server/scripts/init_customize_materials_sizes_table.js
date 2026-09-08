const db = require('../config/db');

const createMaterialsTableSql = `
CREATE TABLE IF NOT EXISTS customize_materials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  fabric_weight VARCHAR(50) DEFAULT '180 GSM',
  price_adjustment DECIMAL(10,2) DEFAULT 0.00,
  display_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

const createSizesTableSql = `
CREATE TABLE IF NOT EXISTS customize_sizes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(20) NOT NULL,
  chest VARCHAR(50) DEFAULT '',
  length VARCHAR(50) DEFAULT '',
  shoulder VARCHAR(50) DEFAULT '',
  price_adjustment DECIMAL(10,2) DEFAULT 0.00,
  display_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

const defaultMaterials = [
  ['100% Bio-Washed Combed Cotton', 'Ultra-soft 180 GSM ring-spun cotton. Breathable, pre-shrunk, ideal for everyday luxury comfort.', '180 GSM', 0.00, 1, 1],
  ['Premium Supima Cotton', 'Finest long-staple luxury cotton with silky hand feel and vibrant dye retention.', '220 GSM', 150.00, 2, 1],
  ['Heavyweight French Terry', 'Substantial 260 GSM streetwear drape with structured silhouette and textured reverse.', '260 GSM', 250.00, 3, 1],
  ['Poly-Cotton Performance Blend', 'Moisture-wicking active stretch fabric, wrinkle-resistant and shape-retaining.', '170 GSM', 50.00, 4, 1],
];

const defaultSizes = [
  ['XS', '34-36"', '26.5"', '16.5"', 0.00, 1, 1],
  ['S', '36-38"', '27.5"', '17.5"', 0.00, 2, 1],
  ['M', '38-40"', '28.5"', '18.5"', 0.00, 3, 1],
  ['L', '40-42"', '29.5"', '19.5"', 0.00, 4, 1],
  ['XL', '42-44"', '30.5"', '20.5"', 0.00, 5, 1],
  ['XXL', '44-46"', '31.5"', '21.5"', 0.00, 6, 1],
  ['3XL', '46-48"', '32.5"', '22.5"', 50.00, 7, 1],
];

async function initialize() {
  try {
    await new Promise((resolve, reject) => {
      db.query(createMaterialsTableSql, (err) => {
        if (err) return reject(err);
        console.log('customize_materials table verified/created successfully.');
        resolve();
      });
    });

    await new Promise((resolve, reject) => {
      db.query(createSizesTableSql, (err) => {
        if (err) return reject(err);
        console.log('customize_sizes table verified/created successfully.');
        resolve();
      });
    });

    // Check if materials table is empty
    const materialsCount = await new Promise((resolve, reject) => {
      db.query('SELECT COUNT(*) as count FROM customize_materials', (err, rows) => {
        if (err) return reject(err);
        resolve(rows[0]?.count || 0);
      });
    });

    if (materialsCount === 0) {
      await new Promise((resolve, reject) => {
        const sql = 'INSERT INTO customize_materials (name, description, fabric_weight, price_adjustment, display_order, is_active) VALUES ?';
        db.query(sql, [defaultMaterials], (err) => {
          if (err) return reject(err);
          console.log(`Seeded ${defaultMaterials.length} default materials.`);
          resolve();
        });
      });
    } else {
      console.log(`customize_materials already contains ${materialsCount} items. Skipping seed.`);
    }

    // Check if sizes table is empty
    const sizesCount = await new Promise((resolve, reject) => {
      db.query('SELECT COUNT(*) as count FROM customize_sizes', (err, rows) => {
        if (err) return reject(err);
        resolve(rows[0]?.count || 0);
      });
    });

    if (sizesCount === 0) {
      await new Promise((resolve, reject) => {
        const sql = 'INSERT INTO customize_sizes (name, chest, length, shoulder, price_adjustment, display_order, is_active) VALUES ?';
        db.query(sql, [defaultSizes], (err) => {
          if (err) return reject(err);
          console.log(`Seeded ${defaultSizes.length} default sizes.`);
          resolve();
        });
      });
    } else {
      console.log(`customize_sizes already contains ${sizesCount} items. Skipping seed.`);
    }

    console.log('Database initialization for customize_materials & customize_sizes complete!');
    process.exit(0);
  } catch (err) {
    console.error('Database initialization error:', err);
    process.exit(1);
  }
}

initialize();
