const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },   // Changed from ObjectId to String
  receiver: { type: String, required: true }, // Changed from ObjectId to String
  content: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);