import express from 'express';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import billRoutes from './routes/billRoutes.js';
import tempRoutes from './routes/tempRoutes.js';

dotenv.config();
const app = express();

// Use an environment variable, but also assume production if PORT is not 3000
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production' || PORT !== 3000;


// Define the correct list of allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  'https://bills.mytechbuddy.in',
  'https://www.bills.mytechbuddy.in' // add this if you use the www version

  // IMPORTANT: Ensure your Vercel app's domain is here
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
app.set('trust proxy', 1); // required if deployed behind proxy (Render, Vercel, etc.)

app.use(session({
  name: 'billing.sid',
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    httpOnly: true,
    secure: true,          // ALWAYS true if your site uses https://
    sameSite: 'none',      // REQUIRED for iPhone cross-site cookies
    maxAge: 24 * 60 * 60 * 1000 // 1 day
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

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', port: PORT });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
