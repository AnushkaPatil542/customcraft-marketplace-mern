const Order = require("../models/Order");

/* ================= EARNINGS ================= */
const getCreatorEarnings = async (req, res) => {
  try {
    const creatorId = req.user._id;

    const orders = await Order.find({
      assignedCreator: creatorId,
      status: "COMPLETED"
    });

    let totalEarnings = 0;

    orders.forEach(order => {
      totalEarnings += order.price;
    });

    res.json({
      totalEarnings,
      totalOrders: orders.length,
      orders
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= UPLOAD WORK ================= */
const uploadWork = async (req, res) => {
  try {
    console.log("FILE:", req.file); // 🔥 debug

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // you can also save this in DB later
    res.status(200).json({
      message: "File uploaded successfully",
      file: req.file.filename
    });

  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    res.status(500).json({ message: "File upload failed" });
  }
};

module.exports = { getCreatorEarnings, uploadWork };