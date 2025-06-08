import { Router } from 'express';
import {
  signup,
  login,
  refresh,
  logout,
  getProfile
} from '../controllers/auth.controller';
import {
  authenticateAccessToken,
  authenticateRefreshToken,
  authenticateAnyToken
} from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh', authenticateRefreshToken, refresh);

// Protected routes
router.post('/logout', authenticateAnyToken, logout);
router.get('/me', authenticateAccessToken, getProfile);

export default router; 