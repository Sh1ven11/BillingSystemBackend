import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const mockUser = {
  email: "arvind@kalitransport.in",
  hashedPassword: process.env.USER_PASSWORD // already bcrypt-hashed
};

export const authController = {
  signIn: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!mockUser || email !== mockUser.email) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const match = await bcrypt.compare(password, mockUser.hashedPassword);
      if (!match) return res.status(401).json({ error: 'Invalid password' });

      // Create session
      req.session.isAuthenticated = true;
      req.session.userEmail = email;
      req.session.userId = 'user_' + Date.now();

      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ error: 'Session error' });
        }

        console.log('Session saved:', req.session);
        res.status(200).json({ 
          message: 'Sign-in successful', 
          user: { email },
          sessionId: req.sessionID 
        });
      });
    } catch (error) {
      console.error('Sign-in error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  signOut: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Sign-out error:', err);
        return res.status(500).json({ error: 'Could not sign out' });
      }
      res.clearCookie('billing.sid'); // must match cookie name
      res.json({ message: 'Signed out successfully' });
    });
  },

  checkAuth: (req, res) => {
    console.log('=== CHECK AUTH ===');
    console.log('Session:', req.session);

    if (req.session.isAuthenticated) {
      return res.json({ 
        authenticated: true, 
        user: { email: req.session.userEmail } 
      });
    }

    return res.status(401).json({ 
      authenticated: false, 
      message: 'Not authenticated' 
    });
  }
};
