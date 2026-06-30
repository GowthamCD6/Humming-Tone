const db = require('../config/db');

const queries = [
  "UPDATE genders SET name = 'Children', is_active = 1 WHERE id = 3",
  "INSERT INTO genders (name, is_active, display_order) VALUES ('Baby', 1, 4) ON DUPLICATE KEY UPDATE is_active = 1, display_order = 4",
  "INSERT INTO genders (name, is_active, display_order) VALUES ('Sports', 1, 5) ON DUPLICATE KEY UPDATE is_active = 1, display_order = 5"
];

const catQueries = [
  // Children categories
  "INSERT INTO categories (name, slug, gender_name) VALUES ('T Shirts', 'children_t_shirts', 'Children') ON DUPLICATE KEY UPDATE slug = VALUES(slug)",
  "INSERT INTO categories (name, slug, gender_name) VALUES ('Winter Sets', 'children_winter_sets', 'Children') ON DUPLICATE KEY UPDATE slug = VALUES(slug)",
  "INSERT INTO categories (name, slug, gender_name) VALUES ('Dresses', 'children_dresses', 'Children') ON DUPLICATE KEY UPDATE slug = VALUES(slug)",
  "INSERT INTO categories (name, slug, gender_name) VALUES ('Sleeping Bags', 'children_sleeping_bags', 'Children') ON DUPLICATE KEY UPDATE slug = VALUES(slug)",
  // Baby categories
  "INSERT INTO categories (name, slug, gender_name) VALUES ('Rompers', 'baby_rompers', 'Baby') ON DUPLICATE KEY UPDATE slug = VALUES(slug)",
  "INSERT INTO categories (name, slug, gender_name) VALUES ('Onesies', 'baby_onesies', 'Baby') ON DUPLICATE KEY UPDATE slug = VALUES(slug)",
  "INSERT INTO categories (name, slug, gender_name) VALUES ('Winter Sets', 'baby_winter_sets', 'Baby') ON DUPLICATE KEY UPDATE slug = VALUES(slug)",
  "INSERT INTO categories (name, slug, gender_name) VALUES ('T Shirts', 'baby_t_shirts', 'Baby') ON DUPLICATE KEY UPDATE slug = VALUES(slug)",
  // Sports categories
  "INSERT INTO categories (name, slug, gender_name) VALUES ('Jerseys', 'sports_jerseys', 'Sports') ON DUPLICATE KEY UPDATE slug = VALUES(slug)",
  "INSERT INTO categories (name, slug, gender_name) VALUES ('Track Pants', 'sports_track_pants', 'Sports') ON DUPLICATE KEY UPDATE slug = VALUES(slug)",
  "INSERT INTO categories (name, slug, gender_name) VALUES ('T Shirts', 'sports_t_shirts', 'Sports') ON DUPLICATE KEY UPDATE slug = VALUES(slug)",
  "INSERT INTO categories (name, slug, gender_name) VALUES ('Shorts', 'sports_shorts', 'Sports') ON DUPLICATE KEY UPDATE slug = VALUES(slug)",
  // Also update existing Kids categories to Children
  "UPDATE categories SET gender_name = 'Children' WHERE gender_name = 'Kids'"
];

const allQueries = [...queries, ...catQueries];
let done = 0;

allQueries.forEach((q, i) => {
  db.query(q, (err, res) => {
    if (err) console.log('ERR on query', i, ':', err.message);
    else console.log('OK query', i, ':', res.affectedRows, 'rows affected');
    done++;
    if (done === allQueries.length) {
      db.query('SELECT * FROM genders ORDER BY display_order', (e, r) => {
        console.log('\nFINAL GENDERS:', JSON.stringify(r, null, 2));
        db.query('SELECT * FROM categories ORDER BY gender_name, name', (e2, r2) => {
          console.log('\nFINAL CATEGORIES:', JSON.stringify(r2, null, 2));
          process.exit();
        });
      });
    }
  });
});
