import { Router } from 'express';
import eventReviewsController from './event_reviews.controller';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

// ============================================================
// Event Reviews Routes — /api/event-reviews
// ============================================================

/** POST /api/event-reviews — Write a review for a past event */
router.post('/', authenticate, eventReviewsController.createReview);

/** GET /api/event-reviews/event/:eventId — Get all reviews for a specific event */
router.get('/event/:eventId', eventReviewsController.getEventReviews);

/** GET /api/event-reviews/event/:eventId/stats — Get review statistics for an event */
router.get('/event/:eventId/stats', eventReviewsController.getEventStats);

export default router;
