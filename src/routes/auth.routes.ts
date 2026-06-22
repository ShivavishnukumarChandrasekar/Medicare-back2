import { Router } from 'express';
import { login, sendOTPForReset, verifyOTPCode, resetPassword, getCurrentUser } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/login', login);
router.post('/send-otp', sendOTPForReset);
router.post('/verify-otp', verifyOTPCode);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', authenticate, getCurrentUser);

export default router;
