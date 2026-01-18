require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app); // Create HTTP server

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
    origin: "*", // Allow connections from anywhere (for simplicity)
    methods: ["GET", "POST"]
  }
});

// --- REAL-TIME CHAT LOGIC ---
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Event: Join a specific "room" (Using userId as room name for simplicity)
  socket.on('join_room', (userId) => {
    socket.join(userId);
    console.log(`User with ID: ${userId} joined room: ${userId}`);
  });

  // Event: Send Message
  socket.on('send_message', async (data) => {
    // data should look like: { senderId, receiverId, content }
    try {
      // 1. Save message to Database
      const newMessage = new Message({
        sender: data.senderId,
        receiver: data.receiverId,
        content: data.content
      });
      await newMessage.save();

      // 2. Emit message to the Receiver (Real-time!)
      // We send it to the room matching the receiver's ID
      io.to(data.receiverId).emit("receive_message", newMessage);
      

    } catch (err) {
      console.log("Error saving message:", err);
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
    
    // Find messages where (sender is Me AND receiver is You) OR (sender is You AND receiver is Me)
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    }).sort({ createdAt: 1 }); // Sort by oldest to newest

    res.json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
