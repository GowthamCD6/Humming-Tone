const db = require('../config/db');

// 4 realistic plain t-shirt transparent mockups for default seeding if empty
const defaultTshirts = [
  {
    name: "Classic Crewneck - Pure White",
    color_name: "Pure White",
    color_hex: "#FFFFFF",
    front_image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
    back_image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80",
    base_price: 699.00,
    display_order: 1
  },
  {
    name: "Classic Crewneck - Jet Black",
    color_name: "Jet Black",
    color_hex: "#18181B",
    front_image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
    back_image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
    base_price: 699.00,
    display_order: 2
  },
  {
    name: "Classic Crewneck - Navy Blue",
    color_name: "Navy Blue",
    color_hex: "#1E293B",
    front_image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80",
    back_image: "https://images.unsplash.com/photo-1618354691438-25bc04584c23?auto=format&fit=crop&w=800&q=80",
    base_price: 749.00,
    display_order: 3
  },
  {
    name: "Classic Crewneck - Heather Gray",
    color_name: "Heather Gray",
    color_hex: "#94A3B8",
    front_image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80",
    back_image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=800&q=80",
    base_price: 699.00,
    display_order: 4
  }
];

db.query('SELECT COUNT(*) as cnt FROM customize_tshirts', (err, rows) => {
  if (err) {
    console.error('Check error:', err);
    process.exit(1);
  }
  if (rows[0].cnt === 0) {
    console.log('Seeding initial plain t-shirts...');
    const values = defaultTshirts.map(t => [
      t.name,
      t.color_name,
      t.color_hex,
      t.front_image,
      t.back_image,
      t.base_price,
      t.display_order,
      1
    ]);
    db.query(
      'INSERT INTO customize_tshirts (name, color_name, color_hex, front_image, back_image, base_price, display_order, is_active) VALUES ?',
      [values],
      (insertErr) => {
        if (insertErr) console.error('Insert error:', insertErr);
        else console.log('Seeded 4 default plain t-shirts with front & back images');
        process.exit(0);
      }
    );
  } else {
    console.log('customize_tshirts already has', rows[0].cnt, 'items.');
    process.exit(0);
  }
});
