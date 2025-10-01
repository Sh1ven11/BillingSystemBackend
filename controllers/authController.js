import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const mockUser = {
  email: "arvind@kalitransport.in",
  hashedPassword: process.env.USER_PASSWORD
};

export const authController = {
  signIn: async (req, res) => {
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

    res.status(200).json({ message: 'Sign-in successful', user: { email } });
  },

  signOut: (req, res) => {
    req.session.destroy(err => {
      if (err) return res.status(500).json({ error: 'Could not sign out' });
      res.clearCookie('sid');
      res.json({ message: 'Signed out successfully' });
    });
  },

  checkAuth: (req, res) => {
    if (req.session.isAuthenticated) {
      return res.json({ authenticated: true, user: { email: req.session.userEmail } });
    }
    console.log("ello mate fromauthi");
    return res.status(401).json({ authenticated: false, message: 'Not authenticated baby' });
  }
};
