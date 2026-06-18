import { Router } from 'express';
import adminController from './admin.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

// ============================================================
// Admin Routes — /api/admin (Admin only)
// ============================================================

// All admin routes require authentication + admin role
router.use(authenticate, authorize('admin'));

/** GET /api/admin/stats — Platform overview stats */
router.get('/stats', adminController.getStats);

/** GET /api/admin/activity — Recent platform activity */
router.get('/activity', adminController.getRecentActivity);

/** GET /api/admin/users/recent — Recent user registrations */
router.get('/users/recent', adminController.getRecentUsers);

/** PATCH /api/admin/users/:id/status — Update user status */
router.patch('/users/:id/status', adminController.updateUserStatus);

/** PATCH /api/admin/users/:id/role — Update user role */
router.patch('/users/:id/role', adminController.updateUserRole);

/** PATCH /api/admin/consultants/:id/verify — Verify a consultant */
router.patch('/consultants/:id/verify', adminController.verifyConsultant);

export default router;
