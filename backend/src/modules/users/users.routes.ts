import { Router } from 'express';
import usersController from './users.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

// ============================================================
// Users Routes — /api/users
// ============================================================

// ---- Self Profile (authenticated user) ----

/**
 * @route   GET /api/users/me
 * @desc    Get own profile
 * @access  Private
 */
router.get('/me', authenticate, usersController.getOwnProfile);

/**
 * @route   PATCH /api/users/me
 * @desc    Update own profile
 * @access  Private
 */
router.patch('/me', authenticate, usersController.updateOwnProfile);

// Aliases for backward compatibility
router.get('/profile', authenticate, usersController.getOwnProfile);
router.put('/profile', authenticate, usersController.updateOwnProfile);

// ---- Admin Routes ----

/**
 * @route   GET /api/users
 * @desc    List all users (paginated, filterable)
 * @access  Admin only
 */
router.get('/', authenticate, authorize('admin'), usersController.listUsers);

/**
 * @route   PATCH /api/users/:id
 * @desc    Admin update a user (role, status, profile)
 * @access  Admin only
 */
router.patch('/:id', authenticate, authorize('admin'), usersController.adminUpdateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Admin delete a user
 * @access  Admin only
 */
router.delete('/:id', authenticate, authorize('admin'), usersController.deleteUser);

// ---- Public Profile ----

/**
 * @route   GET /api/users/:id
 * @desc    Get a user's public profile
 * @access  Private (any authenticated user)
 */
router.get('/:id', authenticate, usersController.getUserById);

export default router;
