export interface IAvailabilitySlot {
  day_of_week: number; // 0-6 (Sunday-Saturday)
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  is_available: boolean;
}

export interface IAvailability {
  id?: string;
  consultant_id: string;
  slots: IAvailabilitySlot[];
  timezone: string;
  break_times?: Array<{
    start_time: string;
    end_time: string;
  }>;
  blocked_dates?: Date[];
  max_consultations_per_day?: number;
  created_at?: Date;
  updated_at?: Date;
}

// SQL table structure (for reference)
export const AVAILABILITY_TABLE = 'availability';
export const AVAILABILITY_SLOTS_TABLE = 'availability_slots';

export const availabilityTableSchema = `
  CREATE TABLE IF NOT EXISTS ${AVAILABILITY_TABLE} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultant_id UUID NOT NULL UNIQUE REFERENCES users(id),
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    break_times JSONB,
    blocked_dates DATE[],
    max_consultations_per_day INTEGER DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_consultant_id (consultant_id)
  )
`;

export const availabilitySlotsTableSchema = `
  CREATE TABLE IF NOT EXISTS ${AVAILABILITY_SLOTS_TABLE} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    availability_id UUID NOT NULL REFERENCES ${AVAILABILITY_TABLE}(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    INDEX idx_availability_id (availability_id)
  )
`;
