const multer = require("multer");

// Use MemoryStorage so uploaded files are kept in RAM as buffers
// and directly streamed to Cloudinary without writing to ephemeral disk.
const storage = multer.memoryStorage();

// file filter (only images)
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/avif"
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (JPEG, PNG, WEBP, AVIF) are allowed"), false);
  }
};

// multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB per file
  }
});

module.exports = upload;