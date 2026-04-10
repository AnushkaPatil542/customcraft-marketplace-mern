const Portfolio = require("../models/Portfolio");

/* ================= CREATE PORTFOLIO ================= */
const createPortfolio = async (req, res) => {
  try {
    const { title, description } = req.body;

    const imagePaths = req.files.map((file) => file.path);

    const portfolio = await Portfolio.create({
      creator: req.user._id,
      title,
      description,
      images: imagePaths,
    });

    res.status(201).json(portfolio);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create portfolio" });
  }
};

/* ================= GET CREATOR PORTFOLIO ================= */
const getMyPortfolio = async (req, res) => {
  try {
    const portfolios = await Portfolio.find({
      creator: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(portfolios);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch portfolio" });
  }
};

/* ================= GET PORTFOLIO BY CREATOR ID ================= */
const getPortfolioByCreator = async (req, res) => {
  try {
    const portfolios = await Portfolio.find({
      creator: req.params.creatorId,
    }).sort({ createdAt: -1 });

    res.json(portfolios);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch portfolio" });
  }
};

module.exports = {
  createPortfolio,
  getMyPortfolio,
  getPortfolioByCreator,
};