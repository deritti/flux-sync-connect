
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

-- Tabela para perfis de usuários
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  full_name TEXT,
  email TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user'))
);

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Índices para performance
CREATE INDEX idx_sync_logs_created_at ON sync_logs(created_at DESC);
CREATE INDEX idx_sync_logs_type_status ON sync_logs(sync_type, status);
CREATE INDEX idx_api_configurations_service ON api_configurations(service_name);

-- RLS (Row Level Security)
ALTER TABLE api_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para api_configurations
CREATE POLICY "Users can view api configurations" ON api_configurations FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can insert api configurations" ON api_configurations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update api configurations" ON api_configurations FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete api configurations" ON api_configurations FOR DELETE USING (auth.uid() IS NOT NULL);

-- Políticas RLS para sync_logs
CREATE POLICY "Users can view sync logs" ON sync_logs FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can insert sync logs" ON sync_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Políticas RLS para profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
