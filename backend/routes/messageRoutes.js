const express = require("express");
const router = express.Router();

const Message = require("../models/Message");
const Order = require("../models/Order");
const Notification = require("../models/Notification");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");


/* ================= SEND MESSAGE ================= */
router.post("/", protect, upload.single("image"), async (req, res) => {
  try {
    const { orderId, text } = req.body;

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

    // 🖼️ Cloudinary file (if uploaded)
    let imageData = null;

    if (req.file) {
      imageData = {
        url: req.file.path,
        publicId: req.file.filename,
      };
    }

    // ❗ must have text OR image
    if (!text && !imageData) {
      return res.status(400).json({
        message: "Message or image is required",
      });
    }

    // ✅ Create message
    const message = await Message.create({
      order: orderId,
      sender: req.user._id,
      text: text || "",
      image: imageData,
    });

    const populatedMessage = await message.populate(
      "sender",
      "name role"
    );

    /* ================= 🔔 NOTIFICATION ================= */

    let receiverId;

    if (order.customer.toString() === req.user._id.toString()) {
      receiverId = order.assignedCreator;
    } else {
      receiverId = order.customer;
    }

    if (receiverId) {
      const notification = await Notification.create({
        user: receiverId,
        message: `New message in order "${order.title}"`,
        link: `/chat/${orderId}`,
      });

      global.io.to(receiverId.toString()).emit(
        "notification",
        notification
      );
    }

    /* ==================================================== */

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
router.delete("/:messageId", protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // only sender can delete
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await message.deleteOne();

    global.io.to(message.order.toString()).emit("messageDeleted", message._id);

    res.json({ message: "Deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.put("/:messageId", protect, async (req, res) => {
  try {
    const { text } = req.body;

    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: "Not found" });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    message.text = text;
    await message.save();

    global.io.to(message.order.toString()).emit("messageUpdated", message);

    res.json(message);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.put("/seen/:orderId", protect, async (req, res) => {
  try {
    await Message.updateMany(
      {
        order: req.params.orderId,
        sender: { $ne: req.user._id },
      },
      {
        $addToSet: { seenBy: req.user._id },
      }
    );

    global.io.to(req.params.orderId).emit("messagesSeen", {
      userId: req.user._id,
    });

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;