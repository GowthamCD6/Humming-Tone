const db = require('../config/db');

const setupNotificationsTable = async () => {
  try {
    console.log('🚀 Creating notifications table if not exists...');
    await db.promise().query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'product_drop',
        product_id INT NULL,
        image_url VARCHAR(500) NULL,
        is_read TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_created (created_at DESC),
        INDEX idx_prod (product_id)
      )
    `);
    console.log('✅ notifications table created/verified successfully.');

    // Check count of notifications
    const [rows] = await db.promise().query('SELECT COUNT(*) as count FROM notifications');
    if (rows[0].count === 0) {
      console.log('🌱 Seeding initial featured & new arrival product drop notifications...');
      const [products] = await db.promise().query(
        'SELECT id, name, subcategory, image_path, is_featured FROM products WHERE is_active = 1 LIMIT 5'
      );

      for (const prod of products) {
        const isFeatured = prod.is_featured === 1;
        const title = isFeatured
          ? `✨ Featured Atelier Drop: ${prod.name}`
          : `🔥 New Arrival: ${prod.name}`;
        const message = isFeatured
          ? `A signature piece has been featured in the Humming Tone Atelier. Discover the handcrafted design now.`
          : `Explore the newest ${prod.subcategory || 'Atelier'} silhouette crafted in 100% heavyweight luxury cotton.`;

        await db.promise().query(
          'INSERT INTO notifications (title, message, type, product_id, image_url, is_read) VALUES (?, ?, ?, ?, ?, ?)',
          [
            title,
            message,
            isFeatured ? 'featured_drop' : 'new_arrival',
            prod.id,
            prod.image_path || null,
            0,
          ]
        );
      }
      console.log('✅ Initial notifications seeded successfully.');
    }
  } catch (err) {
    console.error('❌ Error setting up notifications table:', err);
  } finally {
    process.exit(0);
  }
};

setupNotificationsTable();
