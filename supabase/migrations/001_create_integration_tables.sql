
-- Tabela para configurações das APIs
CREATE TABLE api_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  service_name TEXT NOT NULL UNIQUE, -- 'perfex' ou 'glpi'
  base_url TEXT NOT NULL,
  auth_token TEXT,
  app_token TEXT,
  user_token TEXT,
  enabled BOOLEAN DEFAULT true,
  last_test_at TIMESTAMP WITH TIME ZONE,
  last_test_status TEXT,
  last_test_message TEXT
);

-- Tabela para logs de sincronização
CREATE TABLE sync_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  sync_type TEXT NOT NULL, -- 'customer', 'contact', 'ticket'
  operation TEXT NOT NULL, -- 'create', 'update', 'sync'
  status TEXT NOT NULL, -- 'success', 'error', 'warning'
  message TEXT NOT NULL,
  details TEXT,
  source_id TEXT,
  target_id TEXT,
  processing_time INTEGER, -- em millisegundos
  metadata JSONB
);

-- Índices para performance
CREATE INDEX idx_sync_logs_created_at ON sync_logs(created_at DESC);
CREATE INDEX idx_sync_logs_type_status ON sync_logs(sync_type, status);
CREATE INDEX idx_api_configurations_service ON api_configurations(service_name);

-- RLS (Row Level Security)
ALTER TABLE api_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (permitir acesso total por enquanto)
CREATE POLICY "Allow all operations on api_configurations" ON api_configurations FOR ALL USING (true);
CREATE POLICY "Allow all operations on sync_logs" ON sync_logs FOR ALL USING (true);
