require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const pool = require('../config/db');
const { cloudinary } = require('../config/cloudinary');

const ASSETS_DIR = path.join(__dirname, '../../Humming_Tone/src/assets');

async function uploadAssetsToCloudinary() {
  console.log('🚀 Initializing Asset Upload & TiDB Table Creation...');
  console.log('☁️ Target Cloudinary:', process.env.CLOUDINARY_CLOUD_NAME);

  // 1. Create table in TiDB
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS site_assets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      asset_key VARCHAR(100) NOT NULL UNIQUE,
      category VARCHAR(100) DEFAULT 'general',
      file_name VARCHAR(255) NOT NULL,
      file_type VARCHAR(50) DEFAULT 'image',
      local_path VARCHAR(500),
      cloudinary_url VARCHAR(500) NOT NULL,
      public_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  await new Promise((resolve, reject) => {
    pool.query(createTableQuery, (err, res) => {
      if (err) {
        console.error('❌ Failed to create site_assets table:', err);
        return reject(err);
      }
      console.log('✅ [TiDB] `site_assets` table verified / created successfully.');
      resolve(res);
    });
  });

  // 2. Read local assets
  if (!fs.existsSync(ASSETS_DIR)) {
    console.error('Assets directory not found:', ASSETS_DIR);
    process.exit(1);
  }

  const files = fs.readdirSync(ASSETS_DIR);
  console.log(`📁 Found ${files.length} asset files in ${ASSETS_DIR}`);

  const results = [];

  for (const file of files) {
    const filePath = path.join(ASSETS_DIR, file);
    const ext = path.extname(file).toLowerCase();
    const baseName = path.basename(file, ext);
    const isVideo = ext === '.mp4' || ext === '.mov' || ext === '.webm';
    const isImage = ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.svg' || ext === '.webp';

    if (!isImage && !isVideo) continue;

    const assetKey = baseName.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    const resourceType = isVideo ? 'video' : 'image';

    let category = 'general';
    if (file.includes('logo')) category = 'branding';
    else if (file.includes('about')) category = 'about_page';
    else if (file.includes('home')) category = 'home_page';
    else if (file.includes('craftsmanship')) category = 'story';

    console.log(`\n⏳ Uploading ${file} (${resourceType}) to Cloudinary...`);

    try {
      const uploadRes = await cloudinary.uploader.upload(filePath, {
        folder: 'hummingtone/site-assets',
        resource_type: resourceType,
        public_id: `${assetKey}_${Date.now()}`,
      });

      console.log(`🎉 Uploaded: ${uploadRes.secure_url}`);

      // Insert or Update in TiDB
      const insertQuery = `
        INSERT INTO site_assets (asset_key, category, file_name, file_type, local_path, cloudinary_url, public_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          category = VALUES(category),
          file_name = VALUES(file_name),
          file_type = VALUES(file_type),
          local_path = VALUES(local_path),
          cloudinary_url = VALUES(cloudinary_url),
          public_id = VALUES(public_id);
      `;

      await new Promise((resolve, reject) => {
        pool.query(
          insertQuery,
          [
            assetKey,
            category,
            file,
            resourceType,
            `src/assets/${file}`,
            uploadRes.secure_url,
            uploadRes.public_id,
          ],
          (insertErr, insertRes) => {
            if (insertErr) return reject(insertErr);
            resolve(insertRes);
          }
        );
      });

      console.log(`💾 Saved to TiDB 'site_assets' with key: "${assetKey}"`);
      results.push({
        key: assetKey,
        file: file,
        url: uploadRes.secure_url,
      });
    } catch (uploadErr) {
      console.error(`❌ Failed to upload ${file}:`, uploadErr.message);
    }
  }

  console.log('\n======================================================');
  console.log('✨ ALL ASSETS UPLOADED AND RECORDED IN TiDB DATABASE');
  console.log('======================================================');
  console.table(results);

  process.exit(0);
}

uploadAssetsToCloudinary();