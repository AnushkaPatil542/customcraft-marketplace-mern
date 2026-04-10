const jwt = require("jsonwebtoken");
const User = require("../models/User");

// 🔐 PROTECT ROUTES
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer ")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = user;

      next();
    } catch (error) {
      console.error("Token error:", error.message);
      return res.status(401).json({ message: "Invalid token" });
    }
  } else {
    return res.status(401).json({
      message: "No token provided. Send token as: Bearer <token>",
    });
  }
};

// 👑 ADMIN ONLY
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied. Admins only.",
    });
  }
  next();
};

// 🎨 CREATOR ONLY
const creatorOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "creator") {
    return res.status(403).json({
      message: "Access denied. Creators only.",
    });
  }
  next();
};

// 🔐 ROLE BASED AUTH
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
  adminOnly,
  creatorOnly,
};