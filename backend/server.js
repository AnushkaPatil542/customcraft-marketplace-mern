const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");

// Routes
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const testRoutes = require("./routes/testRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const creatorRoutes = require("./routes/creatorRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");
const messageRoutes = require("./routes/messageRoutes");

dotenv.config();
connectDB();

const app = express();

// 🔥 Create HTTP server
const server = http.createServer(app);

// 🔥 Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",   // TEMP allow all (for testing)
    methods: ["GET", "POST"],
  },
});

// 🔥 Make io global (used in notifications also)
global.io = io;

/* ================= SOCKET.IO ================= */
io.on("connection", (socket) => {
  console.log("🔥 User connected:", socket.id);

  // ✅ Join room based on orderId
  socket.on("joinRoom", (orderId) => {
    socket.join(orderId);
    console.log("📦 Joined room:", orderId);
  });

  // 💬 REAL-TIME CHAT (ORDER BASED)
  socket.on("sendMessage", ({ orderId, message }) => {
    console.log("📩 Message:", message);

    // send message to others in same order room
    socket.to(orderId).emit("receiveMessage", message);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

/* ================= MIDDLEWARE ================= */
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================= ROUTES ================= */
app.use("/api/test", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/creator", creatorRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/messages", messageRoutes);
app.use("/uploads", express.static("uploads"));

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});