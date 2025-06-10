import { Router } from 'express';
import {
  signup,
  login,
  refresh,
  logout,
  logoutAll,
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

// HTTP METHOD: POST
// HTTP ENDPOINT /login ==> localhost:3000/api/login
router.post('/login', login);

router.post('/refresh', authenticateRefreshToken, refresh);

// Protected routes
router.post('/logout', authenticateAnyToken, logout);
router.post('/logout-all', authenticateAnyToken, logoutAll);

// Auth middleware
// Group routes
router.get('/me', authenticateAccessToken, getProfile);

export default router; 