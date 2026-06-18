import db from '../../config/db';

export interface IEventReview {
  id?: string;
  eventId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt?: Date;
  updatedAt?: Date;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  email?: string;
}

export interface IEventReviewStats {
  averageRating: number;
  totalCount: number;
  ratingDistribution: {
    [key: number]: number;
  };
}

class EventReviewsModel {
  /**
   * Create an event review
   */
  async createReview(eventId: string, userId: string, rating: number, comment: string): Promise<IEventReview> {
    try {
      const { rows } = await db.query(
        `INSERT INTO public.event_reviews (event_id, user_id, rating, comment)
         VALUES ($1, $2, $3, $4)
         RETURNING id, event_id as "eventId", user_id as "userId", rating, comment, created_at as "createdAt", updated_at as "updatedAt"`,
        [eventId, userId, rating, comment]
      );
      return rows[0] as IEventReview;
    } catch (error) {
      throw new Error(`Database error creating review: ${(error as Error).message}`);
    }
  }

  /**
   * Check if a user has already reviewed an event
   */
  async findUserReview(eventId: string, userId: string): Promise<IEventReview | null> {
    try {
      const { rows } = await db.query(
        `SELECT id, event_id as "eventId", user_id as "userId", rating, comment, created_at as "createdAt", updated_at as "updatedAt"
         FROM public.event_reviews
         WHERE event_id = $1 AND user_id = $2
         LIMIT 1`,
        [eventId, userId]
      );
      if (rows.length === 0) return null;
      return rows[0] as IEventReview;
    } catch (error) {
      throw new Error(`Database error finding review: ${(error as Error).message}`);
    }
  }

  /**
   * Check if a user is registered for an event
   */
  async checkRegistration(eventId: string, userId: string): Promise<boolean> {
    try {
      const { rows } = await db.query(
        `SELECT id FROM public.event_registrations
         WHERE event_id = $1 AND user_id = $2 AND status = 'confirmed'
         LIMIT 1`,
        [eventId, userId]
      );
      return rows.length > 0;
    } catch (error) {
      throw new Error(`Database error checking registration: ${(error as Error).message}`);
    }
  }

  /**
   * Fetch reviews for a specific event
   */
  async findByEventId(eventId: string): Promise<IEventReview[]> {
    try {
      const { rows } = await db.query(
        `SELECT er.id, er.event_id as "eventId", er.user_id as "userId", er.rating, er.comment, er.created_at as "createdAt", er.updated_at as "updatedAt",
                p.first_name as "firstName", p.last_name as "lastName", p.avatar_url as "avatarUrl", u.email
         FROM public.event_reviews er
         JOIN public.users u ON er.user_id = u.id
         JOIN public.profiles p ON u.profile_id = p.id
         WHERE er.event_id = $1
         ORDER BY er.created_at DESC`,
        [eventId]
      );
      return rows as IEventReview[];
    } catch (error) {
      throw new Error(`Database error fetching reviews: ${(error as Error).message}`);
    }
  }

  /**
   * Get review summary stats for an event
   */
  async getStats(eventId: string): Promise<IEventReviewStats> {
    try {
      const { rows } = await db.query(
        `SELECT
           COALESCE(AVG(rating), 0) as average_rating,
           COUNT(*) as total_count,
           COUNT(CASE WHEN rating = 5 THEN 1 END) as r5,
           COUNT(CASE WHEN rating = 4 THEN 1 END) as r4,
           COUNT(CASE WHEN rating = 3 THEN 1 END) as r3,
           COUNT(CASE WHEN rating = 2 THEN 1 END) as r2,
           COUNT(CASE WHEN rating = 1 THEN 1 END) as r1
         FROM public.event_reviews
         WHERE event_id = $1`,
        [eventId]
      );

      const row = rows[0];
      return {
        averageRating: parseFloat(parseFloat(row.average_rating || '0').toFixed(1)),
        totalCount: parseInt(row.total_count || '0', 10),
        ratingDistribution: {
          5: parseInt(row.r5 || '0', 10),
          4: parseInt(row.r4 || '0', 10),
          3: parseInt(row.r3 || '0', 10),
          2: parseInt(row.r2 || '0', 10),
          1: parseInt(row.r1 || '0', 10)
        }
      };
    } catch (error) {
      throw new Error(`Database error fetching stats: ${(error as Error).message}`);
    }
  }
}

export default new EventReviewsModel();
