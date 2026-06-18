import { Pool, QueryResult } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL must be defined in environment variables');
  process.exit(1);
}

/**
 * PostgreSQL connection pool.
 */
export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // Required for Supabase SSL connection
  },
});

/**
 * Helper query function to execute queries on the pool.
 */
export const query = (text: string, params?: any[]): Promise<QueryResult> => {
  return pool.query(text, params);
};

/**
 * Verifies database connectivity on startup.
 */
export const verifyConnection = async (): Promise<void> => {
  try {
    const res = await query('SELECT 1');
    if (!res || res.rows.length === 0) {
      throw new Error('No response from database');
    }
    console.log('✅ PostgreSQL database connected successfully');

    // Create event_reviews table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS public.event_reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
        comment TEXT NOT NULL CHECK (LENGTH(comment) <= 2000),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE (event_id, user_id)
      )
    `);

    // Create indices if they don't exist
    await query(`CREATE INDEX IF NOT EXISTS idx_event_reviews_event_id ON public.event_reviews(event_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_event_reviews_user_id ON public.event_reviews(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_event_reviews_rating ON public.event_reviews(rating)`);
    console.log('✅ Event reviews database table and indices verified');
  } catch (error) {
    const err = error as Error;
    console.error(`❌ PostgreSQL connection check failed: ${err.message}`);
    process.exit(1);
  }
};

export default {
  pool,
  query,
  verifyConnection,
};
