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
import cors from 'cors';

const allowedOrigins = [
  'http://localhost:5173',                   // dev
  'https://billingsystemfrontend-1.onrender.com', // Render deployed frontend
  'https://bills.mytechbuddy.in'            // your custom domain
];

app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = 'The CORS policy for this site does not allow access from the specified origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));


// 2. Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));


// 4. Routes
app.use('/api/auth', authRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/templates', tempRoutes);

// 5. Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working on port 3000!' });
});

// 6. Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', port: 3000 });
});

const PORT = process.env.PORT||3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ CORS enabled for: http://localhost:5173`);
});