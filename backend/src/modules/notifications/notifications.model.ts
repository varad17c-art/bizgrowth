export interface INotification {
  id?: string;
  user_id: string;
  type: 'booking' | 'review' | 'payment' | 'reminder' | 'system';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  channels: ('email' | 'sms' | 'push' | 'in-app')[];
  related_id?: string;
  related_model?: string;
  sent_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

// SQL table structure (for reference)
export const NOTIFICATIONS_TABLE = 'notifications';

export const notificationsTableSchema = `
  CREATE TABLE IF NOT EXISTS ${NOTIFICATIONS_TABLE} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(20) NOT NULL CHECK (type IN ('booking', 'review', 'payment', 'reminder', 'system')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    read BOOLEAN DEFAULT FALSE,
    channels TEXT[] DEFAULT ARRAY['in-app']::TEXT[],
    related_id UUID,
    related_model VARCHAR(50) CHECK (related_model IN ('Booking', 'Review', 'Payment')),
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_read (read),
    INDEX idx_related_id (related_id)
  )
`;
