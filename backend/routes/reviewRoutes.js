const express = require("express");
const Review = require("../models/Review");
const Order = require("../models/Order");

const router = express.Router();

const { getCreatorReviews } = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");


// Create Review
router.post("/:orderId", protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "COMPLETED") {
      return res.status(400).json({ message: "Order not completed" });
    }

    const existingReview = await Review.findOne({ order: order._id });

    if (existingReview) {
      return res.status(400).json({ message: "Review already submitted" });
    }

    const review = await Review.create({
      order: order._id,
      customer: req.user._id,
      creator: order.assignedCreator,
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ✅ Get reviews for specific creator (unchanged)
router.get("/creator/:creatorId", async (req, res) => {
  try {
    const reviews = await Review.find({
      creator: req.params.creatorId,
    })
      .populate("customer", "name")
      .populate("order", "title")   // ✅ minor improvement: specify title only
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ✅ FIXED: Logged-in creator reviews (THIS was missing populate)
router.get("/creator", protect, async (req, res) => {
  try {
    const reviews = await Review.find({ creator: req.user._id })
      .populate("order", "title")     // ✅ REQUIRED FIX
      .populate("customer", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;