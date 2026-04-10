/* eslint-env node */

const express = require("express");
const router = express.Router();

const Notification = require("../models/Notification");
const { protect } = require("../middleware/authMiddleware");

/**
 * 🔔 GET MY NOTIFICATIONS
 */
router.get("/", protect, async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});

/**
 * ✅ MARK SINGLE AS READ
 */
router.put("/:id/read", protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification)
      return res.status(404).json({ message: "Notification not found" });

    if (notification.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    notification.isRead = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    console.error("MARK READ ERROR:", error);
    res.status(500).json({ message: "Failed to mark as read" });
  }
});

/**
 * ✅ MARK ALL AS READ
 */
router.put("/mark-read", protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("MARK ALL READ ERROR:", error);
    res.status(500).json({ message: "Failed to update notifications" });
  }
});

/**
 * ❌ DELETE NOTIFICATION
 */
router.delete("/:id", protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification)
      return res.status(404).json({ message: "Notification not found" });

    if (notification.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    await notification.deleteOne();

    res.json({ message: "Notification deleted" });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({ message: "Failed to delete notification" });
  }
});

module.exports = router;