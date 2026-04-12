const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["customer", "creator", "admin"],
      default: "customer",
    },

    portfolio: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Portfolio",
      },
    ],

    earnings: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

/* 🔐 HASH PASSWORD BEFORE SAVE */
const bcrypt = require("bcryptjs");

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});
/* ❌ REMOVE matchPassword (NOT NEEDED ANYMORE) */

module.exports = mongoose.model("User", userSchema);