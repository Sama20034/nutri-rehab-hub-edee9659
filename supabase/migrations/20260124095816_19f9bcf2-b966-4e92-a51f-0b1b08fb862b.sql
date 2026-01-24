-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create cron job to keep Supabase alive every 4 days
SELECT cron.schedule(
  'keep-supabase-alive',
  '0 12 */4 * *', -- At 12:00 PM every 4 days
  $$
  SELECT
    net.http_post(
      url := 'https://evfoljpyhcfwjgwljhyg.supabase.co/functions/v1/keep-alive',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2Zm9sanB5aGNmd2pnd2xqaHlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2MjA4NDEsImV4cCI6MjA4NDE5Njg0MX0.YPflfLSaKfyP6SUonURUkz9a8inHVYnGfOw4GNk6cBg"}'::jsonb,
      body := concat('{"time": "', now(), '"}')::jsonb
    ) AS request_id;
  $$
);