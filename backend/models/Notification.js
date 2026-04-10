const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, 
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    // 🔥 OPTIONAL BUT VERY USEFUL
    type: {
      type: String,
      enum: ["ORDER_ASSIGNED", "ORDER_UPDATE", "PAYMENT", "GENERAL"],
      default: "GENERAL",
    },

    // 🔗 Optional reference (helps navigation later)
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);