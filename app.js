import express from 'express';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import billRoutes from './routes/billRoutes.js';
import tempRoutes from './routes/tempRoutes.js';

dotenv.config();
const app = express();

// Determine if we are in a production environment
const isProduction = process.env.NODE_ENV === 'production';

// Define the correct list of allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  'https://bills.mytechbuddy.in',
  // IMPORTANT: Add your Vercel default domain here if it's different.
  // Example: 'https://[your-app-name].vercel.app'
  // Or, if using an environment variable: process.env.VERCEL_FRONTEND_URL 
];


// 1. CORS configuration
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// 2. Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Session middleware
app.use(session({
  name: 'billing.sid',
  secret: process.env.SESSION_SECRET || 'your-secret-key', // Use a strong secret in production
  resave: false,
  saveUninitialized: false,
  cookie: { 
    httpOnly: true,
    // FIX 1: Set secure to true only in production (HTTPS)
    secure: isProduction,
    // FIX 2: Set sameSite to 'none' in production for cross-site cookie transmission
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));


// 4. Routes
app.use('/api/auth', authRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/templates', tempRoutes);

// Debug route
app.get('/api/debug-session', (req, res) => {
  res.json({
    session: req.session,
    isAuthenticated: req.session.isAuthenticated,
    userId: req.session.userId,
    cookies: req.headers.cookie
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working on port 3000!' });
});

const PORT = process.env.PORT || 3000;

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', port: PORT });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
