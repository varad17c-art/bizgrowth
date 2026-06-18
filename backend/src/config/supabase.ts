import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

// Centralized Supabase client configured with WebSocket transport for Node.js compatibility (< v22)
export const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || '',
  {
    realtime: {
      transport: ws as any,
    },
    auth: {
      persistSession: false,
    },
  }
);
