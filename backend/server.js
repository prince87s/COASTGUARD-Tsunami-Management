const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.log('MongoDB connection error:', err));
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});
app.set('io', io);
const startAutoMonitor = require('./services/autoMonitor');
startAutoMonitor(io);
const shelterRoutes = require('./routes/shelters');
app.use('/api/shelters', shelterRoutes);


const alertRoutes = require('./routes/alerts');
app.use('/api/alerts', alertRoutes);
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
const helpRequestRoutes = require('./routes/helpRequests');
app.use('/api/help-requests', helpRequestRoutes);

// Basic test route
app.get('/', (req, res) => {
  res.send('Tsunami Alert System Backend is running!');
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});