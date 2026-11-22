const multer = require('multer');

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// memoryStorage keeps the file in RAM (req.file.buffer) so we can stream it
// straight to Cloudinary without writing temp files to disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) return cb(null, true);

    const error = new Error('Only JPG, PNG or WEBP images are allowed');
    error.statusCode = 400;
    cb(error);
  },
});

module.exports = upload;
