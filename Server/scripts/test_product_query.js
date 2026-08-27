const db = require('../config/db');

const testQuery = async () => {
  const gender = 'men';
  let fetchSql = `SELECT 
                    p.id,
                    p.name,
                    p.brand,
                    COALESCE(MAX(c.name), p.subcategory) as category,
                    p.gender,
                    p.is_featured,
                    COALESCE(
                        p.image_path,
                        (
                            SELECT pi.image_path
                            FROM product_images pi
                            WHERE pi.product_id = p.id
                            ORDER BY pi.is_primary DESC, pi.id ASC
                            LIMIT 1
                        )
                    ) AS image_path,
                    MIN(pv.price) AS price,
                    SUM(pv.stock_quantity) AS total_stock
                    FROM products p
                    LEFT JOIN categories c ON p.category_id = c.id
                    LEFT JOIN product_variants pv 
                    ON pv.product_id = p.id
                    WHERE p.is_active = 1`;

  const params = [];
  const normalizedGender = gender.toLowerCase() === 'baby' ? 'babies' : gender.toLowerCase();
  fetchSql += ` AND (p.gender = ? OR p.gender = ?)`;
  params.push(gender.toLowerCase(), normalizedGender);
  fetchSql += ` GROUP BY p.id, p.name, p.brand, p.subcategory, p.gender, p.is_featured, p.image_path, p.created_at ORDER BY p.created_at DESC`;

  console.log("SQL:", fetchSql);
  console.log("Params:", params);

  try {
    const [rows] = await db.promise().query(fetchSql, params);
    console.log("Success! Rows fetched:", rows.length);
    process.exit(0);
  } catch (err) {
    console.error("SQL Error:", err);
    process.exit(1);
  }
};

testQuery();
