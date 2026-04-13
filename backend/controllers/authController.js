const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ================= TOKEN =================
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password, // ✅ FIXED
      role: role || "customer",
    });

    res.status(201).json({
      message: "User registered successfully",
      userId: user._id,
    });

  } catch (error) {
  console.error("REGISTER ERROR:", error); // 🔥 IMPORTANT
  res.status(500).json({ message: error.message });
}
};
// ================= LOGIN (FIXED & SAFE) =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token, // 🔥 IMPORTANT
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};
// ================= ADMIN =================
exports.createAdmin = async (req, res) => {
  try {
    const existingAdmin = await User.findOne({ email: "admin@gmail.com" });

    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    await User.create({
      name: "Admin",
      email: "admin@gmail.com",
      password: hashedPassword,
      role: "ADMIN",
    });

    res.status(201).json({
      message: "Admin created",
      email: "admin@gmail.com",
      password: "admin123",
    });

  } catch (error) {
    res.status(500).json({ message: "Error creating admin" });
  }
};