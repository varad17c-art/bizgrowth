import { Request, Response } from 'express';
import { ReviewsService } from './reviews.service';

const reviewsService = new ReviewsService();

// Helper to safely get a string param
const qs = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] : v ?? '');

export class ReviewsController {
  /**
   * POST /api/reviews
   */
  async createReview(req: Request, res: Response): Promise<void> {
    try {
      const { bookingId, consultantId, clientId, rating, title, comment } = req.body;

      if (!bookingId || !consultantId || !clientId || !rating || !comment) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      if (rating < 1 || rating > 5) {
        res.status(400).json({ error: 'Rating must be between 1 and 5' });
        return;
      }

      const exists = await reviewsService.reviewExistsForBooking(bookingId);
      if (exists) {
        res.status(409).json({ error: 'Review already exists for this booking' });
        return;
      }

      const review = await reviewsService.createReview({
        booking_id: bookingId,
        consultant_id: consultantId,
        client_id: clientId,
        rating,
        title,
        comment,
      });

      res.status(201).json(review);
    } catch (error) {
      res.status(500).json({ error: `Failed to create review: ${error}` });
    }
  }

  /**
   * GET /api/reviews/:reviewId
   */
  async getReview(req: Request, res: Response): Promise<void> {
    try {
      const reviewId = qs(req.params['reviewId']);
      const review = await reviewsService.getReviewById(reviewId);

      if (!review) {
        res.status(404).json({ error: 'Review not found' });
        return;
      }

      res.json(review);
    } catch (error) {
      res.status(500).json({ error: `Failed to fetch review: ${error}` });
    }
  }

  /**
   * GET /api/reviews/consultant/:consultantId
   */
  async getConsultantReviews(req: Request, res: Response): Promise<void> {
    try {
      const consultantId = qs(req.params['consultantId']);
      const limit = parseInt(qs(req.query['limit'] as string | string[])) || 10;
      const skip = parseInt(qs(req.query['skip'] as string | string[])) || 0;

      const { reviews, total } = await reviewsService.getConsultantReviews(consultantId, limit, skip);

      res.json({ reviews, pagination: { limit, skip, total } });
    } catch (error) {
      res.status(500).json({ error: `Failed to fetch reviews: ${error}` });
    }
  }

  /**
   * GET /api/reviews/client/:clientId
   */
  async getClientReviews(req: Request, res: Response): Promise<void> {
    try {
      const clientId = qs(req.params['clientId']);
      const limit = parseInt(qs(req.query['limit'] as string | string[])) || 10;
      const skip = parseInt(qs(req.query['skip'] as string | string[])) || 0;

      const { reviews, total } = await reviewsService.getClientReviews(clientId, limit, skip);

      res.json({ reviews, pagination: { limit, skip, total } });
    } catch (error) {
      res.status(500).json({ error: `Failed to fetch reviews: ${error}` });
    }
  }

  /**
   * GET /api/reviews/consultant/:consultantId/stats
   */
  async getConsultantStats(req: Request, res: Response): Promise<void> {
    try {
      const consultantId = qs(req.params['consultantId']);

      const averageRating = await reviewsService.getConsultantAverageRating(consultantId);
      const distribution = await reviewsService.getRatingDistribution(consultantId);
      const { total } = await reviewsService.getConsultantReviews(consultantId, 1, 0);

      res.json({ averageRating, totalReviews: total, distribution });
    } catch (error) {
      res.status(500).json({ error: `Failed to fetch stats: ${error}` });
    }
  }

  /**
   * PATCH /api/reviews/:reviewId
   */
  async updateReview(req: Request, res: Response): Promise<void> {
    try {
      const reviewId = qs(req.params['reviewId']);
      const updateData = req.body;

      const review = await reviewsService.updateReview(reviewId, updateData);

      if (!review) {
        res.status(404).json({ error: 'Review not found' });
        return;
      }

      res.json(review);
    } catch (error) {
      res.status(500).json({ error: `Failed to update review: ${error}` });
    }
  }

  /**
   * DELETE /api/reviews/:reviewId
   */
  async deleteReview(req: Request, res: Response): Promise<void> {
    try {
      const reviewId = qs(req.params['reviewId']);
      const deleted = await reviewsService.deleteReview(reviewId);

      if (!deleted) {
        res.status(404).json({ error: 'Review not found' });
        return;
      }

      res.json({ message: 'Review deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: `Failed to delete review: ${error}` });
    }
  }

  /**
   * POST /api/reviews/:reviewId/helpful
   */
  async markHelpful(req: Request, res: Response): Promise<void> {
    try {
      const reviewId = qs(req.params['reviewId']);
      const review = await reviewsService.markHelpful(reviewId);

      if (!review) {
        res.status(404).json({ error: 'Review not found' });
        return;
      }

      res.json(review);
    } catch (error) {
      res.status(500).json({ error: `Failed to mark review as helpful: ${error}` });
    }
  }
}