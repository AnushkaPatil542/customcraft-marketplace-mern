const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    appliedCreators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    assignedCreator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: ["PENDING", "ASSIGNED", "IN_PROGRESS", "COMPLETED"],
      default: "PENDING",
    },

    /* ================= PAYMENT ================= */
    paymentMethod: {
      type: String,
      enum: ["COD"],
      default: "COD",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    paidAt: {
      type: Date,
    },

    platformFee: {
      type: Number,
      default: 0,
    },

    creatorEarning: {
      type: Number,
      default: 0,
    },

    price: {
      type: Number,
      default: 0,
    },

    /* ================= FILES ================= */
    customerFiles: {
      type: [String],
      default: [],
    },

    creatorFiles: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);