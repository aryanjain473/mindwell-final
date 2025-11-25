import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import contactRoutes from './routes/contact.js';
import otpRoutes from './routes/otp.js';
import dashboardRoutes from './routes/dashboard.js';
import chatbotRoutes from './routes/chatbot.js';
import therapistRoutes from './routes/therapist.js';
import appointmentRoutes from './routes/appointment.js';
import sessionRoutes from './routes/session.js';
import nearbyTherapistsRoutes from './routes/nearbyTherapists.js';
import journalRoutes from './routes/journal.js';
import adminRoutes from './routes/admin.js';
import wellnessGamesRoutes from './routes/wellnessGames.js';
import emotionRoutes from './routes/emotion.js';
import stressRoutes from './routes/stress.js';
// import habitsRoutes from './routes/habits.js'; // File doesn't exist yet

// Load environment variables
console.log('🔧 Loading environment variables...');
console.log('🔧 Current working directory:', process.cwd());
import fs from 'fs';
console.log('🔧 .env file exists:', fs.existsSync('.env'));
console.log('🔧 .env file in server dir exists:', fs.existsSync('./server/.env'));
dotenv.config({ path: './server/.env' });
console.log('🔧 After dotenv.config():');
console.log('🔧 GOOGLE_PLACES_API_KEY:', process.env.GOOGLE_PLACES_API_KEY ? 'Set' : 'Not set');

// Create Express app
const app = express();
const PORT = process.env.PORT || 8000;

// Debug: Log environment variables
console.log('🔍 Environment Variables:');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
console.log('GOOGLE_PLACES_API_KEY:', process.env.GOOGLE_PLACES_API_KEY ? 'Set' : 'Not set');
console.log('GOOGLE_MAPS_API_KEY:', process.env.GOOGLE_MAPS_API_KEY ? 'Set' : 'Not set');

// Connect to MongoDB
connectDB();

// Middleware
// CORS configuration - handle trailing slashes
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.CLIENT_URL?.replace(/\/$/, ''), // Remove trailing slash
  process.env.CLIENT_URL?.replace(/\/$/, '') + '/', // Add trailing slash
  'http://localhost:5173'
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list (with or without trailing slash)
    const normalizedOrigin = origin.replace(/\/$/, '');
    const normalizedAllowed = allowedOrigins.map(o => o?.replace(/\/$/, ''));
    
    if (normalizedAllowed.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/therapist', therapistRoutes);
app.use('/api/appointment', appointmentRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/therapists', nearbyTherapistsRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/wellness-games', wellnessGamesRoutes);
app.use('/api/emotion', emotionRoutes);
app.use('/api/stress', stressRoutes);
// app.use('/api/habits', habitsRoutes); // File doesn't exist yet

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    message: 'MindWell API is running!', 
    timestamp: new Date().toISOString() 
  });
});

// Debug endpoint to check environment variables
app.get('/api/debug/env', (req, res) => {
  res.json({
    GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY ? 'Set' : 'Not set',
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY ? 'Set' : 'Not set',
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌟 Environment: ${process.env.NODE_ENV || 'development'}`);
});