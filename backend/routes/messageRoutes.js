const express = require("express");
const router = express.Router();

const Message = require("../models/Message");
const Order = require("../models/Order");
const Notification = require("../models/Notification");
const { protect } = require("../middleware/authMiddleware");

/* ================= SEND MESSAGE ================= */
router.post("/", protect, async (req, res) => {
  try {
    const { orderId, text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Message is required" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 🔒 Only customer or assigned creator can chat
    if (
      order.customer.toString() !== req.user._id.toString() &&
      order.assignedCreator?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not allowed to chat" });
    }

    // ✅ Create message
    const message = await Message.create({
      order: orderId,
      sender: req.user._id,
      text,
    });

    // 🔥 Populate sender for frontend use
    const populatedMessage = await message.populate("sender", "name role");

    /* ================= 🔔 CHAT NOTIFICATION ================= */

    let receiverId;

    // decide receiver (who should get notification)
    if (order.customer.toString() === req.user._id.toString()) {
      receiverId = order.assignedCreator;
    } else {
      receiverId = order.customer;
    }

    // avoid error if creator not assigned yet
    if (receiverId) {
      const notification = await Notification.create({
        user: receiverId,
        message: `New message in order "${order.title}"`,
        link: `/chat/${orderId}`,
      });

      // ⚡ real-time notification
      global.io.to(receiverId.toString()).emit("notification", notification);
    }

    /* ======================================================= */

    res.status(201).json(populatedMessage);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});


/* ================= GET MESSAGES ================= */
router.get("/:orderId", protect, async (req, res) => {
  try {
    const orderId = req.params.orderId;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 🔒 security check
    if (
      order.customer.toString() !== req.user._id.toString() &&
      order.assignedCreator?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const messages = await Message.find({ order: orderId })
      .populate("sender", "name role")
      .sort({ createdAt: 1 });

    res.json(messages);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;