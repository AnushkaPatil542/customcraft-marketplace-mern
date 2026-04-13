const express = require("express");
const { getCreatorEarnings, uploadWork } = require("../controllers/creatorController");
const { protect, creatorOnly } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const router = express.Router();

// ✅ Earnings
router.get("/earnings", protect, creatorOnly, getCreatorEarnings);

// ✅ Upload work (IMPORTANT)
router.post("/upload", protect, creatorOnly, upload.single("file"), uploadWork);

module.exports = router;