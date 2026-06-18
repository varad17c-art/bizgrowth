import { Router } from 'express';
import authController from './auth.controller';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

// ============================================================
// Auth Routes — /api/auth
// ============================================================

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user & return JWT
 * @access  Public
 */
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user
 * @access  Private
 */
router.get('/me', authenticate, authController.getMe);

export default router;
