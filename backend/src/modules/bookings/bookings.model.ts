export interface IBooking {
  id?: string;
  consultant_id: string;
  client_id: string;
  scheduled_at: Date;
  duration_minutes: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  meeting_link?: string;
  created_at?: Date;
  updated_at?: Date;
}

// SQL table structure (for reference)
export const BOOKINGS_TABLE = 'bookings';

export const bookingsTableSchema = `
  CREATE TABLE IF NOT EXISTS ${BOOKINGS_TABLE} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultant_id UUID NOT NULL REFERENCES users(id),
    client_id UUID NOT NULL REFERENCES users(id),
    scheduled_at TIMESTAMP NOT NULL,
    duration_minutes INTEGER DEFAULT 60 CHECK (duration_minutes BETWEEN 15 AND 480),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    notes TEXT,
    meeting_link VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_consultant_id (consultant_id),
    INDEX idx_client_id (client_id),
    INDEX idx_status (status)
  )
`;
