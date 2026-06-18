export interface IReview {
  id?: string;
  booking_id: string;
  consultant_id: string;
  client_id: string;
  rating: number; // 1-5
  title?: string;
  comment: string;
  helpful?: number; // count of helpful votes
  created_at?: Date;
  updated_at?: Date;
}

// SQL table structure (for reference)
export const REVIEWS_TABLE = 'reviews';

export const reviewsTableSchema = `
  CREATE TABLE IF NOT EXISTS ${REVIEWS_TABLE} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id),
    consultant_id UUID NOT NULL REFERENCES users(id),
    client_id UUID NOT NULL REFERENCES users(id),
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(200),
    comment TEXT NOT NULL CHECK (LENGTH(comment) <= 2000),
    helpful INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_booking_id (booking_id),
    INDEX idx_consultant_id (consultant_id),
    INDEX idx_client_id (client_id)
  )
`;
