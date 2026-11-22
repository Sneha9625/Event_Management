const cloudinary = require('../config/cloudinary');

// Multer gives us a Buffer; Cloudinary's upload_stream accepts a stream,
// so we wrap it in a Promise to use it with async/await.
const uploadToCloudinary = (buffer) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    const error = new Error('Image upload is not configured (missing Cloudinary keys in .env)');
    error.statusCode = 500;
    return Promise.reject(error);
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'eventhub/banners', resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

module.exports = uploadToCloudinary;
