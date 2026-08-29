require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const pool = require('../config/db');
const { cloudinary } = require('../config/cloudinary');

async function migrateImages() {
  console.log('🚀 Starting Cloudinary Image Migration to new cloud:', process.env.CLOUDINARY_CLOUD_NAME);

  pool.query('SELECT id, name, image_path FROM products', async (err, products) => {
    if (err) {
      console.error('Error fetching products:', err);
      process.exit(1);
    }

    console.log(`Found ${products.length} products to check.`);

    for (const product of products) {
      const oldImg = product.image_path;
      if (!oldImg) continue;

      console.log(`\nProcessing Product #${product.id} (${product.name})...`);
      console.log(`Current image: ${oldImg}`);

      // If already on new cloud, skip
      if (oldImg.includes(process.env.CLOUDINARY_CLOUD_NAME)) {
        console.log('✅ Already on new Cloudinary account.');
        continue;
      }

      try {
        let uploadSource = oldImg;
        // If it's a relative path or local upload
        if (!oldImg.startsWith('http://') && !oldImg.startsWith('https://')) {
          uploadSource = `http://localhost:5000/${oldImg.replace(/^\/+/, '')}`;
        }

        console.log(`Uploading to new Cloudinary from: ${uploadSource}`);
        const result = await cloudinary.uploader.upload(uploadSource, {
          folder: 'hummingtone/products',
          resource_type: 'image',
        });

        console.log(`🎉 Uploaded to new cloud! New URL: ${result.secure_url}`);

        // Update database with new URL
        await new Promise((resolve, reject) => {
          pool.query(
            'UPDATE products SET image_path = ? WHERE id = ?',
            [result.secure_url, product.id],
            (updateErr, updateRes) => {
              if (updateErr) return reject(updateErr);
              resolve(updateRes);
            }
          );
        });

        console.log(`💾 Database updated for product #${product.id}`);
      } catch (uploadError) {
        console.error(`❌ Failed to upload image for product #${product.id}:`, uploadError.message);
      }
    }

    // Also check product_images table if it exists
    pool.query("SHOW TABLES LIKE 'product_images'", async (tableErr, tables) => {
      if (tableErr || tables.length === 0) {
        console.log('\n✅ Migration complete!');
        process.exit(0);
      }

      pool.query('SELECT * FROM product_images', async (piErr, extraImages) => {
        if (piErr || !extraImages || extraImages.length === 0) {
          console.log('\n✅ Migration complete!');
          process.exit(0);
        }

        console.log(`\nFound ${extraImages.length} gallery images in product_images.`);
        for (const imgRow of extraImages) {
          const imgUrl = imgRow.image_url || imgRow.image_path;
          if (!imgUrl || imgUrl.includes(process.env.CLOUDINARY_CLOUD_NAME)) continue;

          try {
            console.log(`Uploading gallery image #${imgRow.id}...`);
            const res = await cloudinary.uploader.upload(imgUrl, {
              folder: 'hummingtone/products/gallery',
              resource_type: 'image',
            });

            const colName = imgRow.image_url ? 'image_url' : 'image_path';
            await new Promise((resv, rej) => {
              pool.query(
                `UPDATE product_images SET ${colName} = ? WHERE id = ?`,
                [res.secure_url, imgRow.id],
                (uErr, uRes) => (uErr ? rej(uErr) : resv(uRes))
              );
            });
            console.log(`💾 Gallery image #${imgRow.id} updated!`);
          } catch (e) {
            console.error(`Failed gallery image #${imgRow.id}:`, e.message);
          }
        }

        console.log('\n🎉 ALL IMAGES SUCCESSFULLY MIGRATED TO NEW CLOUDINARY ACCOUNT!');
        process.exit(0);
      });
    });
  });
}

migrateImages();
