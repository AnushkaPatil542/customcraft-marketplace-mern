const jwt = require("jsonwebtoken");
const User = require("../models/User");

// 🔐 PROTECT ROUTES (SAFE VERSION)
const protect = async (req, res, next) => {
  try {
    let token;

    const authHeader = req.headers.authorization;

    // check header exists
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    // verify token safely
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        message: "Invalid token payload",
      });
    }

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    req.user = user;
    next();

  } catch (error) {
    console.error("🔥 AUTH ERROR:", error.message);

    return res.status(401).json({
      message: "Authentication failed",
    });
  }
};

// 👑 ADMIN ONLY
const adminOnly = (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admins only.",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: "Role check failed" });
  }
};

// 🎨 CREATOR ONLY
const creatorOnly = (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "creator") {
      return res.status(403).json({
        message: "Access denied. Creators only.",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: "Role check failed" });
  }
};

// 🔐 ROLE BASED AUTH
const authorize = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({
          message: "Access denied",
        });
      }
      next();
    } catch (error) {
      return res.status(500).json({ message: "Authorization failed" });
    }
  };
};

module.exports = {
  protect,
  authorize,
  adminOnly,
  creatorOnly,
};