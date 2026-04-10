const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ SIMPLE TEST (NO AUTH)
router.get("/test-auth", (req, res) => {
  res.json({ message: "Test route working" });
});

// Only logged-in users
router.get("/profile", protect, (req, res) => {
  res.json({
    message: "User profile data",
    user: req.user
  });
});

// Only admin
router.get("/admin", protect, authorize("admin"), (req, res) => {
  res.json({
    message: "Welcome Admin"
  });
});

module.exports = router;
