import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Load env variables
dotenv.config();

// Log environment variables for debugging (excluding sensitive data)
console.log('Environment:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('EMAIL_USER exists:', !!process.env.EMAIL_USER);
console.log('EMAIL_PASS exists:', !!process.env.EMAIL_PASS);

// Validate essential environment variables
const REQUIRED_ENV_VARS = ['MONGO_URI', 'JWT_SECRET', 'EMAIL_USER', 'EMAIL_PASS'];
const missingVars = REQUIRED_ENV_VARS.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  console.error('Please ensure all required environment variables are set in your deployment environment.');
  process.exit(1);
}

// Define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize app and server
const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? [process.env.FRONTEND_URL]
      : 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL]
    : true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve React build files in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React app
  app.use(express.static(path.join(__dirname, '../client/build')));

  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);

// 404 Route - Move this after the production static file serving
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Socket.io logic
let activeUsers = 0;

io.on('connection', (socket) => {
  activeUsers++;
  console.log('🔌 New client connected:', socket.id);
  io.emit('activeUsers', activeUsers);

  socket.on('disconnect', () => {
    activeUsers--;
    console.log('❌ Client disconnected:', socket.id);
    io.emit('activeUsers', activeUsers);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
