const express = require("express");
const router = express.Router();

const {
  createPortfolio,
  getMyPortfolio,
  getPortfolioByCreator,
} = require("../controllers/portfolioController");

const { protect, creatorOnly } = require("../middleware/authMiddleware");

/* ✅ USE SAME CLOUDINARY UPLOAD (IMPORTANT) */
const upload = require("../middleware/upload");

/* ================= CREATE PORTFOLIO ================= */
router.post(
  "/create",
  protect,
  creatorOnly,
  upload.array("files"), // ✅ Cloudinary
  createPortfolio
);

/* ================= GET MY PORTFOLIO ================= */
router.get("/my", protect, creatorOnly, getMyPortfolio);

/* ================= GET BY CREATOR ================= */
router.get("/:creatorId", getPortfolioByCreator);

module.exports = router;