const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Uploads a buffer directly to Cloudinary using a stream.
 * Automatically enables automatic formatting (WebP/AVIF) and quality optimization.
 * 
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {string} folder - Folder name in Cloudinary (e.g. 'hummingtone/products')
 * @returns {Promise<{ secure_url: string, public_id: string }>}
 */
const uploadStreamToCloudinary = (buffer, folder = "hummingtone/products") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [
          { quality: "auto", fetch_format: "auto" }
        ]
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

/**
 * Helper to delete an asset from Cloudinary
 * @param {string} publicId 
 */
const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Failed to delete asset from Cloudinary:", error);
  }
};

module.exports = {
  cloudinary,
  uploadStreamToCloudinary,
  deleteFromCloudinary
};
