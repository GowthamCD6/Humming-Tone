const db = require('../config/db');

// Professional curated SVG & transparent artwork designs for apparel customizer
const sampleDesigns = [
  {
    name: 'Vintage Crest & Eagle',
    category: 'Vintage & Retro',
    image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    price: 0.00,
    display_order: 1
  },
  {
    name: 'Atelier Heritage Seal',
    category: 'Badges & Seals',
    image_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80',
    price: 0.00,
    display_order: 2
  },
  {
    name: 'Botanical Silhouette',
    category: 'Minimalist',
    image_url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=400&q=80',
    price: 0.00,
    display_order: 3
  },
  {
    name: 'Japanese Wave & Sun',
    category: 'Streetwear',
    image_url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=400&q=80',
    price: 99.00,
    display_order: 4
  },
  {
    name: 'Cyberpunk Neon Emblem',
    category: 'Streetwear',
    image_url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=400&q=80',
    price: 99.00,
    display_order: 5
  },
  {
    name: 'Urban Typography Logo',
    category: 'Typography',
    image_url: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&w=400&q=80',
    price: 0.00,
    display_order: 6
  }
];

db.query('SELECT COUNT(*) as count FROM customize_designs', (err, rows) => {
  if (err) {
    console.error('Error checking customize_designs:', err);
    process.exit(1);
  }

  if (rows[0].count === 0) {
    console.log('Seeding sample preset designs...');
    const values = sampleDesigns.map(d => [
      d.name,
      d.category,
      d.image_url,
      d.price,
      d.display_order,
      1
    ]);

    db.query(
      'INSERT INTO customize_designs (name, category, image_url, price, display_order, is_active) VALUES ?',
      [values],
      (insertErr) => {
        if (insertErr) {
          console.error('Insert error:', insertErr);
          process.exit(1);
        }
        console.log(`Successfully seeded ${sampleDesigns.length} preset designs!`);
        process.exit(0);
      }
    );
  } else {
    console.log('customize_designs already has', rows[0].count, 'designs.');
    process.exit(0);
  }
});
