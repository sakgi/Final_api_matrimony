// middleware/multerConfig.js
const multer = require('multer');
const path = require("path");

// Use memory storage to store files in memory as Buffer
const storage = multer.memoryStorage();

// File validation (only image files allowed)
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and JPG are allowed!'), false);
  }
};

// Initialize multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB limit per file
  fileFilter: fileFilter,
});

// Export the upload middleware
module.exports = upload;