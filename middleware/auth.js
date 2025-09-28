// middleware/sessionAuth.js
export default function sessionAuth(req, res, next) {
  if (req.session && req.session.isAuthenticated) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized' });
}
