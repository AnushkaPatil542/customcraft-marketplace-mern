const express = require("express");
const router = express.Router();
const User = require("../models/User");

const Order = require("../models/Order");
const Notification = require("../models/Notification");
const { protect,creatorOnly} = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

/* ================= TEST AUTH ================= */

router.get("/test-auth", protect, (req, res) => {
  res.json({
    id: req.user._id,
    email: req.user.email,
    role: req.user.role,
  });
});

/* ================= CREATE ORDER (CUSTOMER) ================= */
router.post("/", protect, async (req, res) => {
  try {
    const { title, description, price } = req.body; // ✅ added price

    // ✅ Commission Logic (10%)
    const commissionRate = 0.10;

    const totalAmount = price; // ✅ dynamic instead of 1000

    const platformFee = totalAmount * commissionRate;
    const creatorEarning = totalAmount - platformFee;

    const order = await Order.create({
      title,
      description,
      price: totalAmount, 
      customer: req.user._id,

      // ✅ Added Payment Fields
      paymentMethod: "COD",
      paymentStatus: "pending",
      isPaid: false,

      // ✅ Earnings Fields
      platformFee,
      creatorEarning,
    });

    res.status(201).json(order);
  } catch {
    res.status(500).json({ message: "Order creation failed" });
  }
});
/* ================= CUSTOMER → MY ORDERS ================= */
router.get("/my", protect, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate("appliedCreators", "name email") // ✅ FIX HERE
      .populate("assignedCreator", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});
/* ================= CREATOR → ALL AVAILABLE ORDERS ================= */
router.get("/all", protect, async (req, res) => {
  try {
    if (req.user.role !== "creator") {
      return res.status(403).json({ message: "Only creators allowed" });
    }

    const orders = await Order.find({
      status: "PENDING",
      assignedCreator: null,
      appliedCreators: { $ne: req.user._id }, // hide already applied
    })
      .populate("customer", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch {
    res.status(500).json({ message: "Failed to load orders" });
  }
});

/* ================= CREATOR → APPLY ORDER ================= */
router.post("/:id/apply", protect, async (req, res) => {
  try {
    if (req.user.role !== "creator") {
      return res.status(403).json({ message: "Only creators allowed" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.appliedCreators.includes(req.user._id)) {
      return res.status(400).json({ message: "Already applied" });
    }

    order.appliedCreators.push(req.user._id);
    await order.save();

    res.json({ message: "Applied successfully" });
  } catch {
    res.status(500).json({ message: "Apply failed" });
  }
});

/* ================= CUSTOMER → SELECT CREATOR ================= */
router.put("/:id/select-creator", protect, async (req, res) => {
  try {
    const { creatorId } = req.body;

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin allowed" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.assignedCreator = creatorId;
    order.status = "ASSIGNED";
    await order.save();

    const notification = await Notification.create({
      user: creatorId,
      message: `Admin assigned you to order: ${order.title}`,
    });

    // 🔥 REAL-TIME EMIT
    global.io.to(creatorId.toString()).emit("notification", notification);

    res.json({ message: "Creator assigned by admin" });

  } catch (error) {
    res.status(500).json({ message: "Assignment failed" });
  }
});

/* ================= CREATOR → ASSIGNED ORDERS ================= */
router.get("/assigned", protect, async (req, res) => {
  try {
    if (req.user.role !== "creator") {
      return res.status(403).json({ message: "Only creators allowed" });
    }

    const orders = await Order.find({
      assignedCreator: req.user._id,
    })
      .populate("customer", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch {
    res.status(500).json({ message: "Failed to fetch assigned orders" });
  }
});

/* ================= CREATOR → UPDATE STATUS ================= */
router.put("/:id/status", protect, async (req, res) => {
  try {
    if (req.user.role !== "creator") {
      return res.status(403).json({ message: "Only creators allowed" });
    }

    const { status } = req.body;

    if (!["IN_PROGRESS", "COMPLETED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.assignedCreator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    order.status = status;
    await order.save();

    const notification = await Notification.create({
  user: order.customer,
  message: `Your order "${order.title}" is now ${status}`,
});

// ✅ REAL-TIME EMIT
global.io.to(order.customer.toString()).emit("notification", notification);

    res.json(order);
  } catch {
    res.status(500).json({ message: "Failed to update status" });
  }
});

/* ================= CREATOR → APPLIED ORDERS ================= */
router.get("/applied", protect, async (req, res) => {
  try {
    if (req.user.role !== "creator") {
      return res.status(403).json({ message: "Only creators allowed" });
    }

    const orders = await Order.find({
      appliedCreators: req.user._id,
      assignedCreator: null,
      status: "PENDING",
    })
      .populate("customer", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch {
    res.status(500).json({ message: "Failed to fetch applied orders" });
  }
});
/* ================= CREATOR → COMPLETED ORDER HISTORY ================= */
router.get("/creator/history", protect, async (req, res) => {
  try {
    if (req.user.role !== "creator") {
      return res.status(403).json({ message: "Only creators allowed" });
    }

    const orders = await Order.find({
      assignedCreator: req.user._id,
      status: "COMPLETED",
    })
      .populate("customer", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch {
    res.status(500).json({ message: "Failed to fetch creator history" });
  }
});

/* ================= CUSTOMER → COMPLETED ORDER HISTORY ================= */
router.get("/customer/history", protect, async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({ message: "Only customers allowed" });
    }

    const orders = await Order.find({
      customer: req.user._id,
      status: "COMPLETED",
    })
      .populate("assignedCreator", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch {
    res.status(500).json({ message: "Failed to fetch customer history" });
  }
});

/* ================= CREATOR EARNINGS ================= */
router.get("/creator/earnings", protect, creatorOnly, async (req, res) => {
  try {
    const creatorId = req.user._id;

   const completedOrders = await Order.find({
  assignedCreator: creatorId,
  paymentStatus: "completed",
  status: "COMPLETED",
});


    const totalEarnings = completedOrders.reduce(
      (sum, order) => sum + order.creatorEarning,
      0
    );

    res.status(200).json({
      success: true,
      totalCompletedOrders: completedOrders.length,
      totalEarnings,
    });
  } catch (error) {
    console.error("Creator Earnings Error:", error);
    res.status(500).json({
      message: error.message,
    });
  }
});
/* ================= COMPLETE ORDER (CREATOR) ================= */
router.put("/complete/:id", protect, creatorOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!order.assignedCreator) {
      return res.status(400).json({
        message: "Order is not assigned to any creator",
      });
    }

    if (order.assignedCreator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not assigned to this order",
      });
    }

    // ✅ Prevent double completion
    if (order.status === "COMPLETED") {
      return res.status(400).json({
        message: "Order already completed",
      });
    }

    const { price } = req.body;

    if (!price || price <= 0) {
      return res.status(400).json({
        message: "Valid price is required",
      });
    }

    // ✅ Commission Logic
    const commissionRate = 0.10;
    const platformFee = price * commissionRate;
    const creatorEarning = price - platformFee;

    // ✅ Update order
    order.status = "COMPLETED";
    order.price = price;
    order.platformFee = platformFee;
    order.creatorEarning = creatorEarning;
    order.paymentStatus = "completed";
    order.isPaid = true;

    await order.save();

    const notification = await Notification.create({
  user: order.customer,
  message: `Your order "${order.title}" has been completed`,
});

// 🔥 REAL-TIME
global.io.to(order.customer.toString()).emit("notification", notification);

    // ✅ Update creator earnings safely (NO hooks triggered)
    await User.findByIdAndUpdate(
      order.assignedCreator,
      {
        $inc: { earnings: creatorEarning },
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Order completed & earnings added",
      order,
    });

  } catch (error) {
    console.error("🔥 COMPLETE ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
});

router.post(
  "/upload/customer/:id",
  protect,
  upload.array("files"),
  async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);

      const filePaths = req.files.map(file => file.path);

      order.customerFiles.push(...filePaths);
      await order.save();

      res.json({ message: "Files uploaded", files: filePaths });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.post(
  "/upload/creator/:id",
  protect,
  creatorOnly,
  upload.array("files"),
  async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);

      const filePaths = req.files.map(file => file.path);

      order.creatorFiles.push(...filePaths);
      await order.save();

      res.json({ message: "Work uploaded", files: filePaths });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);



module.exports = router;
