
-- Primeiro, vamos fazer backup dos dados existentes se houver
INSERT INTO api_configurations_backup (
  id, created_at, updated_at, 
  service_name, base_url, auth_token, app_token, user_token, 
  enabled, last_test_at, last_test_status, last_test_message
)
SELECT 
  id, created_at, updated_at,
  'perfex' as service_name,
  perfex_api_url as base_url,
  perfex_api_token as auth_token,
  NULL as app_token,
  NULL as user_token,
  true as enabled,
  NULL as last_test_at,
  NULL as last_test_status,
  NULL as last_test_message
FROM api_configurations 
WHERE perfex_api_url IS NOT NULL OR perfex_api_token IS NOT NULL;

-- Adicionar registros do Evolution API se existirem
INSERT INTO api_configurations_backup (
  id, created_at, updated_at,
  service_name, base_url, auth_token, app_token, user_token,
  enabled, last_test_at, last_test_status, last_test_message
)
SELECT 
  gen_random_uuid() as id, created_at, updated_at,
  'glpi' as service_name,
  evolution_api_url as base_url,
  evolution_api_token as auth_token,
  NULL as app_token,
  NULL as user_token,
  true as enabled,
  NULL as last_test_at,
  NULL as last_test_status,
  NULL as last_test_message
FROM api_configurations 
WHERE evolution_api_url IS NOT NULL OR evolution_api_token IS NOT NULL;

-- Recriar a tabela api_configurations com a estrutura correta
DROP TABLE IF EXISTS api_configurations;

CREATE TABLE api_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  service_name TEXT NOT NULL CHECK (service_name IN ('perfex', 'glpi')),
  base_url TEXT NOT NULL,
  auth_token TEXT,
  app_token TEXT,
  user_token TEXT,
  enabled BOOLEAN DEFAULT true,
  last_test_at TIMESTAMP WITH TIME ZONE,
  last_test_status TEXT,
  last_test_message TEXT,
  UNIQUE(user_id, service_name)
);

-- Habilitar RLS
ALTER TABLE api_configurations ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Users can view their own configurations" ON api_configurations 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own configurations" ON api_configurations 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own configurations" ON api_configurations 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own configurations" ON api_configurations 
  FOR DELETE USING (auth.uid() = user_id);

-- Criar índices para performance
CREATE INDEX idx_api_configurations_user_service ON api_configurations(user_id, service_name);
