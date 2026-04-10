const express = require("express");
const router = express.Router();
const Portfolio = require("../models/Portfolio");

const {
  createPortfolio,
  getMyPortfolio,
  getPortfolioByCreator,
} = require("../controllers/portfolioController");

const { protect, creatorOnly } = require("../middleware/authMiddleware");

// ✅ MULTER (reuse same setup as orders)
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/portfolio");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

/* ================= CREATE PORTFOLIO ================= */
router.post(
  "/create",
  protect,
  creatorOnly,
  upload.array("files"),
  createPortfolio
);

/* ================= GET MY PORTFOLIO ================= */
router.get("/my", protect, creatorOnly, getMyPortfolio);

/* ================= GET BY CREATOR ================= */
router.get("/:creatorId", getPortfolioByCreator);

// GET portfolio by creatorId (for customer/admin)
router.get("/:creatorId", async (req, res) => {
  try {
    const portfolios = await Portfolio.find({
      creator: req.params.creatorId,
    }).sort({ createdAt: -1 });

    res.json(portfolios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch portfolio" });
  }
});

module.exports = router;