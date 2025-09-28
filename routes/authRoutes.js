import express from 'express';
import { authController } from '../controllers/authController.js';

const router = express.Router();

router.post('/sign-in', authController.signIn);
router.post('/sign-out', authController.signOut);
router.get('/check', authController.checkAuth);

export default router;
