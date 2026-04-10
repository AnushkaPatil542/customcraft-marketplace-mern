const Review = require("../models/Review");

// Get reviews for logged-in creator
exports.getCreatorReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ creator: req.user._id })
      .populate("order", "orderName") // adjust field name if different
      .populate("customer", "name");

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};