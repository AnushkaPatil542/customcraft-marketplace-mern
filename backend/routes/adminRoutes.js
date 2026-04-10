const express = require("express");
const router = express.Router();

const {
  getAllOrders,
  assignCreator,
  getCreators,
  getAdminStats,
  markOrderAsPaid, 
  getAdminEarnings,
  getMonthlyEarnings, 
  getTopCreators,
} = require("../controllers/adminController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// 📦 Get all orders (Admin only)
router.get("/earnings", protect, adminOnly, getAdminEarnings);
router.get("/orders", protect, adminOnly, getAllOrders);

// 👩‍🎨 Assign creator to order (Admin only)
router.put(
  "/orders/:id/assign",
  protect,
  adminOnly,
  assignCreator
);

// 👩‍🎨 Get all creators (Admin only)
router.get("/creators", protect, adminOnly, getCreators);
router.get("/monthly-earnings", protect, adminOnly, getMonthlyEarnings);
router.get("/top-creators", protect, adminOnly, getTopCreators);

// 📊 Admin stats (Admin only)
router.get("/stats", protect, adminOnly, getAdminStats);
// 💰 Mark order as paid (Admin only)
router.put(
  "/orders/:id/pay",
  protect,
  adminOnly,
  markOrderAsPaid
);




module.exports = router;
