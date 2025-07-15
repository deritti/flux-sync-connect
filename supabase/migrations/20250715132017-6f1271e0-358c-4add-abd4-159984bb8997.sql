-- Habilitar extensões necessárias para cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Agendar sincronização de ativos a cada 4 horas
SELECT cron.schedule(
  'sync-assets-from-glpi',
  '0 */4 * * *', -- A cada 4 horas
  $$
  SELECT
    net.http_post(
        url:='https://hprhgienavyayohzyysk.supabase.co/functions/v1/sync-assets',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwcmhnaWVuYXZ5YXlvaHp5eXNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMjYzODYsImV4cCI6MjA2NTkwMjM4Nn0.DaQVZACNKO78tTRnlqPzv1NQhRXmfNW0TdHReUnwkqI"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);