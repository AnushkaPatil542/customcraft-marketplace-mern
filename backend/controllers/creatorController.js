const Order = require("../models/Order");

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

module.exports = { getCreatorEarnings };