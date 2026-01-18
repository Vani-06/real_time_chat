# Real-Time Chat API

A simple backend for a real-time chat application using Node.js, Express, Socket.io, and MongoDB.

## Features
- **User Auth:** Register and Login with JWT.
- **Real-Time:** Instant messaging via WebSockets.
- **Group Chat:** Users can join specific rooms (e.g., "General", "Sports") and chat with everyone in that room.
- **Persistence:** All messages are saved to MongoDB.
- **History:** Retrieve chat history via API.

## API Documentation

### 1. WebSocket Events
- **Event: `join_room`** -> Send a Room Name (String) to join a group channel.
- **Event: `send_message`** -> Send `{ senderId, targetRoom, content }`.
- **Event: `receive_message`** -> Listen for this to display incoming group messages.

### 2. REST API
- **POST** `/api/auth/register`
- **POST** `/api/auth/login`
- **GET** `/api/messages/:userId/:roomName` -> Fetches history for that specific room/user interaction.

## Setup Instructions

1. **Clone the repo:**
   ```bash
   git clone <YOUR_REPO_URL>
   cd real-time-chat-api