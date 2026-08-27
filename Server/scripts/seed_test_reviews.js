const db = require('../config/db');

const testReviews = async () => {
  try {
    // 1. Find a sample product
    const [products] = await db.promise().query("SELECT id, name FROM products WHERE is_active = 1 LIMIT 1");
    if (!products || products.length === 0) {
      console.log("No active products found to test reviews.");
      process.exit(0);
    }
    const product = products[0];
    console.log(`Testing with product ID: ${product.id} (${product.name})`);

    // 2. Insert sample review if none exists
    const [existing] = await db.promise().query("SELECT COUNT(*) as count FROM product_reviews WHERE product_id = ?", [product.id]);
    if (existing[0].count === 0) {
      await db.promise().query(`
        INSERT INTO product_reviews 
        (product_id, reviewer_name, reviewer_email, rating, title, comment, status)
        VALUES 
        (?, 'Priya Nair', 'priya.nair@example.com', 5, 'Absolutely love the fabric quality!', 'The fit is true to size and the material feels incredibly premium and soft against the skin. Highly recommend!', 'approved'),
        (?, 'Rahul Menon', 'rahul.m@example.com', 4, 'Great styling and quick delivery', 'Nice product, exactly as shown in the images. Packaging was also very neat.', 'approved')
      `, [product.id, product.id]);
      console.log("Sample reviews seeded successfully.");
    } else {
      console.log(`Product already has ${existing[0].count} review(s).`);
    }

    // 3. Query stats
    const [stats] = await db.promise().query(`
      SELECT 
        COUNT(*) AS total_reviews,
        AVG(rating) AS average_rating
      FROM product_reviews
      WHERE product_id = ? AND status = 'approved'
    `, [product.id]);
    console.log("Stats calculated:", stats[0]);

    process.exit(0);
  } catch (err) {
    console.error("Test error:", err);
    process.exit(1);
  }
};

testReviews();
