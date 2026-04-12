const express = require("express");
const router = express.Router();

const {
  login,
  register,
  createAdmin,
} = require("../controllers/authController");

// ✅ REGISTER USER
router.post("/register", register);

// ✅ LOGIN USER
router.post("/login", login);

// ⚠️ TEMP ADMIN CREATION (use once only)
router.post("/create-admin", createAdmin);

module.exports = router;