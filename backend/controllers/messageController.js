const Message = require("../models/Message");

// @desc Send message
// @route POST /api/messages
// @access Private
const sendMessage = async (req, res) => {
  try {
    const { order, text, imageUrl } = req.body;

    const message = await Message.create({
      order,
      sender: req.user._id, // from protect middleware
      text: text || "",
      image: imageUrl
        ? {
            url: imageUrl,
            publicId: null,
          }
        : null,
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({
      message: "Error sending message",
      error: error.message,
    });
  }
};

// @desc Get messages for an order
// @route GET /api/messages/:orderId
// @access Private
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      order: req.params.orderId,
    })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching messages",
      error: error.message,
    });
  }
};

module.exports = {
  sendMessage,
  getMessages,
};