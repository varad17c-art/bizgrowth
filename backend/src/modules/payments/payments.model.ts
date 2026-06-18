export interface IPayment {
  id?: string;
  booking_id?: string | null;
  listing_id?: string | null;
  consultant_id: string; // Used as recipient / seller for listing sales
  client_id: string; // Used as buyer for listing sales
  amount: number;
  currency: string;
  razorpay_order_id: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method?: string;
  transaction_id?: string;
  error_message?: string;
  refund_amount?: number;
  refund_reason?: string;
  created_at?: Date;
  updated_at?: Date;
}

// SQL table structure (for reference)
export const PAYMENTS_TABLE = 'payments';

export const paymentsTableSchema = `
  CREATE TABLE IF NOT EXISTS ${PAYMENTS_TABLE} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    consultant_id UUID NOT NULL REFERENCES users(id),
    client_id UUID NOT NULL REFERENCES users(id),
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) DEFAULT 'INR' CHECK (currency IN ('INR', 'USD', 'EUR', 'GBP')),
    razorpay_order_id VARCHAR(100) NOT NULL UNIQUE,
    razorpay_payment_id VARCHAR(100) UNIQUE,
    razorpay_signature VARCHAR(500),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_method VARCHAR(20) CHECK (payment_method IN ('card', 'netbanking', 'upi', 'wallet')),
    transaction_id VARCHAR(100) UNIQUE,
    error_message TEXT,
    refund_amount DECIMAL(10, 2),
    refund_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_booking_id (booking_id),
    INDEX idx_consultant_id (consultant_id),
    INDEX idx_client_id (client_id),
    INDEX idx_status (status),
    INDEX idx_razorpay_order_id (razorpay_order_id)
  )
`;
