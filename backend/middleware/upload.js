const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "customcraft_uploads",
    resource_type: "image",

    // IMPORTANT: force correct format
    format: async (req, file) => {
      const ext = file.mimetype.split("/")[1];
      return ext;
    },

    public_id: (req, file) => {
      return Date.now() + "-" + file.originalname;
    },
  },
});

const upload = multer({ storage });

module.exports = upload;