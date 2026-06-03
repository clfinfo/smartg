const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a local file path to Cloudinary.
 * Returns the secure HTTPS URL, or null if Cloudinary is not configured.
 */
const uploadImage = async (filePath) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) return null;
  const result = await cloudinary.uploader.upload(filePath, {
    folder: 'ecosmart-city',
    resource_type: 'image',
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  });
  return result.secure_url;
};

module.exports = { uploadImage };
