const multer = require("multer");

// Use MemoryStorage so uploaded files are kept in RAM as buffers
// and directly streamed to Cloudinary without writing to ephemeral disk.
const storage = multer.memoryStorage();

// file filter (only images with safe extensions)
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/avif"
  ];

  const allowedExts = /\.(jpe?g|png|webp|avif)$/i;
  const isMimeOk = allowedTypes.includes(file.mimetype);
  const isExtOk = allowedExts.test(file.originalname || '');

  if (isMimeOk && isExtOk) {
    cb(null, true);
  } else {
    cb(new Error("Only valid image files (JPEG, PNG, WEBP, AVIF) under 5MB are allowed"), false);
  }
};

// multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB per file max
  }
});

module.exports = upload;