import { Router } from 'express';
import { ReviewsController } from './reviews.controller';

const router = Router();
const controller = new ReviewsController();

// Reviews routes
router.post('/', (req, res) => controller.createReview(req, res));
router.get('/:reviewId', (req, res) => controller.getReview(req, res));
router.get('/consultant/:consultantId/stats', (req, res) => controller.getConsultantStats(req, res));
router.get('/consultant/:consultantId', (req, res) => controller.getConsultantReviews(req, res));
router.get('/client/:clientId', (req, res) => controller.getClientReviews(req, res));
router.patch('/:reviewId', (req, res) => controller.updateReview(req, res));
router.delete('/:reviewId', (req, res) => controller.deleteReview(req, res));
router.post('/:reviewId/helpful', (req, res) => controller.markHelpful(req, res));

export default router;