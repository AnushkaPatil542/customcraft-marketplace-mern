const Order = require("../models/Order");
const User = require("../models/User");
const Notification = require("../models/Notification");

/* ================= GET ALL ORDERS ================= */
const getAllOrders = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = req.query.status;

    const skip = (page - 1) * limit;

    let filter = {};
    if (status) {
      filter.status = status;
    }

    const totalOrders = await Order.countDocuments(filter);

    const orders = await Order.find(filter)
      .populate("customer", "name email")
      .populate("assignedCreator", "name email")
      .populate("appliedCreators", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      page,
      pages: Math.ceil(totalOrders / limit),
      totalOrders,
      orders,
    });

  } catch (error) {
    console.error("Get Orders Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ================= ASSIGN CREATOR + NOTIFY ================= */
const assignCreator = async (req, res) => {
  try {
    const { id } = req.params;
    const { creatorId } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // ✅ Assign creator
    order.assignedCreator = creatorId;
    order.status = "ASSIGNED";

    await order.save();

    // 🔔 CREATE NOTIFICATION
    const notification = await Notification.create({
      user: creatorId,
      message: `You have been assigned a new order: ${order.title}`,
    });

    // 🔥 REAL-TIME SOCKET EMIT
    if (global.io) {
      global.io.to(creatorId.toString()).emit("notification", notification);
    }

    res.status(200).json({
      success: true,
      message: "Creator assigned & notified",
      order,
    });

  } catch (error) {
    console.error("Assign Creator Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET ALL CREATORS ================= */
const getCreators = async (req, res) => {
  try {
    const creators = await User.find({ role: "creator" }).select("-password");

    res.status(200).json({
      success: true,
      creators,
    });

  } catch (error) {
    console.error("Get Creators Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ================= ADMIN STATS ================= */
const getAdminStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: "PENDING" });
    const assignedOrders = await Order.countDocuments({ status: "ASSIGNED" });
    const inProgressOrders = await Order.countDocuments({ status: "IN_PROGRESS" });
    const completedOrders = await Order.countDocuments({ status: "COMPLETED" });

    const totalCreators = await User.countDocuments({ role: "creator" });
    const totalCustomers = await User.countDocuments({ role: "customer" });

    res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        assignedOrders,
        inProgressOrders,
        completedOrders,
        totalCreators,
        totalCustomers,
      },
    });

  } catch (error) {
    console.error("Admin Stats Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ================= MARK ORDER AS PAID ================= */
const markOrderAsPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.paymentStatus === "completed") {
      return res.status(400).json({
        message: "Order already marked as paid",
      });
    }

    order.isPaid = true;
    order.paymentStatus = "completed";
    order.paidAt = Date.now();

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order marked as paid successfully",
      order,
    });

  } catch (error) {
    console.error("Mark Order Paid Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ================= ADMIN EARNINGS ================= */
const getAdminEarnings = async (req, res) => {
  try {
    const orders = await Order.find({ status: "COMPLETED" });

    let totalEarnings = 0;

    orders.forEach((order) => {
      totalEarnings += order.platformFee || 0;
    });

    res.status(200).json({
      success: true,
      totalEarnings,
      totalOrders: orders.length,
      orders,
    });

  } catch (error) {
    console.error("Admin Earnings Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ================= MONTHLY EARNINGS ================= */
const getMonthlyEarnings = async (req, res) => {
  try {
    const orders = await Order.find({ status: "COMPLETED" });

    const monthlyData = {};

    orders.forEach((order) => {
      const month = new Date(order.createdAt).toLocaleString("default", {
        month: "short",
      });

      if (!monthlyData[month]) {
        monthlyData[month] = 0;
      }

      monthlyData[month] += order.platformFee || 0;
    });

    const result = Object.keys(monthlyData).map((month) => ({
      month,
      earnings: monthlyData[month],
    }));

    res.json(result);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= TOP CREATORS ================= */
const getTopCreators = async (req, res) => {
  try {
    const creators = await User.find({ role: "creator" })
      .sort({ earnings: -1 })
      .limit(5)
      .select("name earnings");

    res.json(creators);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllOrders,
  assignCreator,
  getCreators,
  getAdminStats,
  markOrderAsPaid,
  getAdminEarnings,
  getMonthlyEarnings,
  getTopCreators,
};