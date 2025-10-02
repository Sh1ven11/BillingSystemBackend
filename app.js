import express from 'express';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import billRoutes from './routes/billRoutes.js';
import tempRoutes from './routes/tempRoutes.js';

dotenv.config();
const app = express();

// 1. CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://billingsystemfrontend-1.onrender.com',
    'https://bills.mytechbuddy.in'
  ],
  credentials: true
}));

// 2. Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Session middleware
app.use(session({
  name: 'billing.sid',
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',  // ❌ only force HTTPS in prod
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
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
