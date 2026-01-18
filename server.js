require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoute = require('./routes/auth');
app.use('/api/auth', authRoute);

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// WebSocket Setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// --- REAL-TIME CHAT LOGIC ---
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Event: Join a Room
  socket.on('join_room', (roomName) => {
    socket.join(roomName);
    console.log(`User ${socket.id} joined room: ${roomName}`);
  });

  // Event: Send Message (The ONLY one we need)
  socket.on('send_message', async (data) => {
    try {
      // debug log
      console.log("📨 Received:", data);

      // Handle both "Group Chat" (targetRoom) and "Private" (receiverId)
      // If targetRoom is missing, check receiverId. If both missing, default to "General"
      const receiver = data.targetRoom || data.receiverId || "General";

      // 1. Save to Database
      const newMessage = new Message({
        sender: data.senderId,
        receiver: receiver, 
        content: data.content
      });
      await newMessage.save();
      console.log("✅ Saved to DB");

      // 2. Broadcast to that Room/User
      socket.to(receiver).emit("receive_message", newMessage);
      
    } catch (err) {
      console.log("❌ Error saving message:", err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected', socket.id);
  });
});

// --- CHAT HISTORY API ---
app.get('/api/messages/:userId/:otherUserId', async (req, res) => {
  try {
    const { userId, otherUserId } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));