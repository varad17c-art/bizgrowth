-- Migration: create analytics helper functions
-- Date: 2026-06-18

-- Example PL/pgSQL function that aggregates events by hour (placeholder)
CREATE FUNCTION analytics.events_per_hour(days integer DEFAULT 7)
RETURNS TABLE(hour timestamptz, cnt bigint)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT date_trunc('hour', created_at) as hour, count(*) as cnt
  FROM events
  WHERE created_at >= now() - ($1 || ' days')::interval
  GROUP BY 1
  ORDER BY 1;
END;
$$;
