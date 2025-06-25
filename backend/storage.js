// backend/config/storage.js
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'meditrack-reports', // Cloudinary folder name
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

module.exports = storage;
