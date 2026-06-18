import express from 'express';
import {getAnalyticsSummary} from '../services/analyticsService';

const router = express.Router();

// GET /api/analytics
router.get('/', async (req, res) => {
  try {
    const data = await getAnalyticsSummary();
    res.json({ok: true, data});
  } catch (err) {
    console.error('analytics route error', err);
    res.status(500).json({ok: false, error: 'internal_error'});
  }
});

export default router;
