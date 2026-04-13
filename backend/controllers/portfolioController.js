const Portfolio = require("../models/Portfolio");

/* ================= CREATE PORTFOLIO ================= */
const createPortfolio = async (req, res) => {
  try {
    const { title, description } = req.body;

    // ✅ VALIDATION
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    // ✅ SAFE FILE HANDLING
    let imagePaths = [];

    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map((file) => file.path); // Cloudinary URLs
    }

    const portfolio = await Portfolio.create({
      creator: req.user._id,
      title,
      description,
      images: imagePaths,
    });

    res.status(201).json(portfolio);

  } catch (error) {
    console.error("CREATE PORTFOLIO ERROR:", error);
    res.status(500).json({ message: "Failed to create portfolio" });
  }
};

/* ================= GET MY PORTFOLIO ================= */
const getMyPortfolio = async (req, res) => {
  try {
    const portfolios = await Portfolio.find({
      creator: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(portfolios);

  } catch (error) {
    console.error("GET MY PORTFOLIO ERROR:", error);
    res.status(500).json({ message: "Failed to fetch portfolio" });
  }
};

/* ================= GET PORTFOLIO BY CREATOR ================= */
const getPortfolioByCreator = async (req, res) => {
  try {
    const portfolios = await Portfolio.find({
      creator: req.params.creatorId,
    }).sort({ createdAt: -1 });

    res.json(portfolios);

  } catch (error) {
    console.error("GET CREATOR PORTFOLIO ERROR:", error);
    res.status(500).json({ message: "Failed to fetch portfolio" });
  }
};

module.exports = {
  createPortfolio,
  getMyPortfolio,
  getPortfolioByCreator,
};