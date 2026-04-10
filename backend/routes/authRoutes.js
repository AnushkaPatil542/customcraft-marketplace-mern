const express = require("express");
const router = express.Router();

const { login, createAdmin } = require("../controllers/authController");

// login route
router.post("/login", login);

// temporary route to create admin (use once)
router.post("/create-admin", createAdmin);

module.exports = router;
