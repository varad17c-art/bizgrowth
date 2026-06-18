import { supabase } from '../../config/supabase';
import { IReview } from './reviews.model';

const REVIEWS_TABLE = 'reviews';

export class ReviewsService {
  /**
   * Create a new review
   */
  async createReview(reviewData: Partial<IReview>): Promise<IReview> {
    try {
      const { data, error } = await supabase
        .from(REVIEWS_TABLE)
        .insert([reviewData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to create review: ${error}`);
    }
  }

  /**
   * Get review by ID
   */
  async getReviewById(reviewId: string): Promise<IReview | null> {
    try {
      const { data, error } = await supabase
        .from(REVIEWS_TABLE)
        .select('*')
        .eq('id', reviewId)
        .single();

      if (error) return null;
      return data;
    } catch (error) {
      console.error(`Failed to fetch review: ${error}`);
      return null;
    }
  }

  /**
   * Get all reviews for a consultant
   */
  async getConsultantReviews(
    consultantId: string,
    limit: number = 10,
    skip: number = 0
  ): Promise<{ reviews: IReview[]; total: number }> {
    try {
      // Get total count
      const { count: total } = await supabase
        .from(REVIEWS_TABLE)
        .select('*', { count: 'exact', head: true })
        .eq('consultant_id', consultantId);

      // Get paginated data
      const { data, error } = await supabase
        .from(REVIEWS_TABLE)
        .select('*')
        .eq('consultant_id', consultantId)
        .order('created_at', { ascending: false })
        .range(skip, skip + limit - 1);

      if (error) throw error;
      return { reviews: data || [], total: total || 0 };
    } catch (error) {
      console.error(`Failed to fetch reviews: ${error}`);
      return { reviews: [], total: 0 };
    }
  }

  /**
   * Get all reviews by a client
   */
  async getClientReviews(
    clientId: string,
    limit: number = 10,
    skip: number = 0
  ): Promise<{ reviews: IReview[]; total: number }> {
    try {
      // Get total count
      const { count: total } = await supabase
        .from(REVIEWS_TABLE)
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientId);

      // Get paginated data
      const { data, error } = await supabase
        .from(REVIEWS_TABLE)
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .range(skip, skip + limit - 1);

      if (error) throw error;
      return { reviews: data || [], total: total || 0 };
    } catch (error) {
      console.error(`Failed to fetch reviews: ${error}`);
      return { reviews: [], total: 0 };
    }
  }

  /**
   * Get average rating for a consultant
   */
  async getConsultantAverageRating(consultantId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .rpc('get_consultant_average_rating', { consultant_id: consultantId });

      if (error) {
        // Fallback if RPC not available - fetch all and calculate
        const { data: reviews } = await supabase
          .from(REVIEWS_TABLE)
          .select('rating')
          .eq('consultant_id', consultantId);

        if (!reviews || reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
        return Math.round((sum / reviews.length) * 10) / 10;
      }

      return data?.[0]?.average_rating || 0;
    } catch (error) {
      console.error(`Failed to fetch average rating: ${error}`);
      return 0;
    }
  }

  /**
   * Get rating distribution for a consultant
   */
  async getRatingDistribution(
    consultantId: string
  ): Promise<{ [key: number]: number }> {
    try {
      const { data, error } = await supabase
        .from(REVIEWS_TABLE)
        .select('rating')
        .eq('consultant_id', consultantId);

      if (error) throw error;

      const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

      data?.forEach((review) => {
        if (review.rating >= 1 && review.rating <= 5) {
          distribution[review.rating]++;
        }
      });

      return distribution;
    } catch (error) {
      console.error(`Failed to fetch rating distribution: ${error}`);
      return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    }
  }

  /**
   * Update review
   */
  async updateReview(
    reviewId: string,
    updateData: Partial<IReview>
  ): Promise<IReview | null> {
    try {
      const { data, error } = await supabase
        .from(REVIEWS_TABLE)
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', reviewId)
        .select()
        .single();

      if (error) return null;
      return data;
    } catch (error) {
      console.error(`Failed to update review: ${error}`);
      return null;
    }
  }

  /**
   * Delete review
   */
  async deleteReview(reviewId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(REVIEWS_TABLE)
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Failed to delete review: ${error}`);
      return false;
    }
  }

  /**
   * Mark review as helpful
   */
  async markHelpful(reviewId: string): Promise<IReview | null> {
    try {
      // Get current helpful count
      const current = await this.getReviewById(reviewId);
      if (!current) return null;

      const newHelpful = (current.helpful || 0) + 1;

      const { data, error } = await supabase
        .from(REVIEWS_TABLE)
        .update({ helpful: newHelpful, updated_at: new Date().toISOString() })
        .eq('id', reviewId)
        .select()
        .single();

      if (error) return null;
      return data;
    } catch (error) {
      console.error(`Failed to mark review as helpful: ${error}`);
      return null;
    }
  }

  /**
   * Check if review exists for booking
   */
  async reviewExistsForBooking(bookingId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from(REVIEWS_TABLE)
        .select('id')
        .eq('booking_id', bookingId)
        .single();

      return !error && !!data;
    } catch (error) {
      return false;
    }
  }
}
