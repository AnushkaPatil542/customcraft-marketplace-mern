const express = require("express");
const { getCreatorEarnings } = require("../controllers/creatorController");
const { protect, creatorOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/earnings", protect, creatorOnly, getCreatorEarnings);

module.exports = router;