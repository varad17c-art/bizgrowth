import { Router } from 'express';
import analyticsController from './analytics.controller';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

// ============================================================
// Analytics Routes — /api/analytics
// ============================================================

/** GET /api/analytics/dashboard — Retrieve 7-day trend metrics */
router.get('/dashboard', authenticate, analyticsController.getDashboardAnalytics);

export default router;
