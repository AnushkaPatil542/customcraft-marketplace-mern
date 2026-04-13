const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "customcraft_uploads",

    // 🔥 IMPORTANT FIX FOR IMAGES + PDF
    resource_type: "auto",

    allowed_formats: ["jpg", "jpeg", "png", "pdf"],
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB safety
  },
});

module.exports = upload;