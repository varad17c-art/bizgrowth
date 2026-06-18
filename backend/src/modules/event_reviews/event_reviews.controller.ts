import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import eventReviewsModel from './event_reviews.model';
import db from '../../config/db';

class EventReviewsController {
  /**
   * POST /api/event-reviews
   * Write a review for a past event
   */
  async createReview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { eventId, rating, comment } = req.body;
      const userId = req.user!.userId;

      if (!eventId || !rating || !comment) {
        res.status(400).json({ success: false, message: 'Missing eventId, rating, or comment' });
        return;
      }

      const numRating = parseInt(rating, 10);
      if (isNaN(numRating) || numRating < 1 || numRating > 5) {
        res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5' });
        return;
      }

      if (comment.trim().length === 0 || comment.trim().length > 2000) {
        res.status(400).json({ success: false, message: 'Comment must be between 1 and 2000 characters' });
        return;
      }

      // 1. Check if event exists and is in the past
      const eventRes = await db.query('SELECT event_date FROM public.events WHERE id = $1 LIMIT 1', [eventId]);
      if (eventRes.rows.length === 0) {
        res.status(404).json({ success: false, message: 'Event not found' });
        return;
      }

      const eventDate = new Date(eventRes.rows[0].event_date);
      if (eventDate > new Date()) {
        res.status(400).json({ success: false, message: 'Cannot review an upcoming or current event' });
        return;
      }

      // 2. Verify registration
      const isRegistered = await eventReviewsModel.checkRegistration(eventId, userId);
      if (!isRegistered) {
        res.status(403).json({ success: false, message: 'Only registered attendees can review this event' });
        return;
      }

      // 3. Check if user already reviewed
      const existingReview = await eventReviewsModel.findUserReview(eventId, userId);
      if (existingReview) {
        res.status(400).json({ success: false, message: 'You have already reviewed this event' });
        return;
      }

      // 4. Create review
      const review = await eventReviewsModel.createReview(eventId, userId, numRating, comment.trim());

      res.status(201).json({
        success: true,
        data: review,
        message: 'Event review submitted successfully'
      });
    } catch (error) {
      console.error('Error creating event review:', error);
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }

  /**
   * GET /api/event-reviews/event/:eventId
   * Get all reviews for a specific event
   */
  async getEventReviews(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      if (!eventId) {
        res.status(400).json({ success: false, message: 'Event ID is required' });
        return;
      }

      const reviews = await eventReviewsModel.findByEventId(eventId);
      res.status(200).json({ success: true, data: reviews });
    } catch (error) {
      console.error('Error fetching event reviews:', error);
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }

  /**
   * GET /api/event-reviews/event/:eventId/stats
   * Get statistics summary for reviews of an event
   */
  async getEventStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      if (!eventId) {
        res.status(400).json({ success: false, message: 'Event ID is required' });
        return;
      }

      const stats = await eventReviewsModel.getStats(eventId);
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      console.error('Error fetching event review stats:', error);
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }
}

export default new EventReviewsController();
