import { supabase } from '@/integrations/supabase/client';

export interface ApiConfiguration {
  id?: string;
  service_name: 'zcolab' | 'glpi';
  base_url: string;
  auth_token?: string;
  app_token?: string;
  user_token?: string;
  enabled: boolean;
  last_test_at?: string;
  last_test_status?: string;
  last_test_message?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SyncLog {
  id?: string;
  created_at?: string;
  sync_type: 'customer' | 'contact' | 'ticket';
  operation: 'create' | 'update' | 'sync';
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
  source_id?: string;
  target_id?: string;
  processing_time?: number;
  metadata?: any;
}

class SupabaseApiService {
  private async getCurrentUserId(): Promise<string | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Erro ao obter usuário:', error);
        return null;
      }
      return user?.id || null;
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      return null;
    }
  }

  async initializeDefaultConfigurations(): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        console.log('Usuário não autenticado - pulando inicialização');
        return;
      }

      const existingConfigs = await this.getAllApiConfigurations();
      
      if (existingConfigs.length === 0) {
        console.log('Inicializando configurações padrão para o usuário...');
        
        const defaultConfigs: ApiConfiguration[] = [
          {
            service_name: 'zcolab',
            base_url: '',
            auth_token: '',
            enabled: false,
            user_id: userId
          },
          {
            service_name: 'glpi',
            base_url: '',
            app_token: '',
            user_token: '',
            enabled: false,
            user_id: userId
          }
        ];

        for (const config of defaultConfigs) {
          await this.saveApiConfiguration(config);
        }
      }
    } catch (error) {
      console.error('Erro ao inicializar configurações padrão:', error);
      throw new Error(`Erro ao inicializar configurações: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async saveApiConfiguration(config: ApiConfiguration): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }

      const configData = {
        ...config,
        user_id: userId,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('api_configurations')
        .upsert(configData, {
          onConflict: 'user_id,service_name'
        });

      if (error) {
        console.error('Erro ao salvar configuração:', error);
        throw new Error(`Erro ao salvar configuração: ${error.message}`);
      }

      console.log(`Configuração ${config.service_name} salva com sucesso`);
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      throw error;
    }
  }

  async getApiConfiguration(serviceName: 'zcolab' | 'glpi'): Promise<ApiConfiguration | null> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('api_configurations')
        .select('*')
        .eq('service_name', serviceName)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar configuração:', error);
        throw new Error(`Erro ao buscar configuração: ${error.message}`);
      }

      return data as ApiConfiguration | null;
    } catch (error) {
      console.error('Erro ao buscar configuração:', error);
      return null;
    }
  }

  async getAllApiConfigurations(): Promise<ApiConfiguration[]> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return [];
      }

      const { data, error } = await supabase
        .from('api_configurations')
        .select('*')
        .eq('user_id', userId)
        .order('service_name');

      if (error) {
        console.error('Erro ao buscar configurações:', error);
        throw new Error(`Erro ao buscar configurações: ${error.message}`);
      }

      return (data as ApiConfiguration[]) || [];
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      return [];
    }
  }

  async testApiConnection(serviceName: 'zcolab' | 'glpi'): Promise<{
    success: boolean;
    status: number | string;
    responseTime: number;
    message: string;
  }> {
    const config = await this.getApiConfiguration(serviceName);
    if (!config) {
      throw new Error(`Configuração para ${serviceName} não encontrada`);
    }

    if (!config.base_url) {
      throw new Error(`URL base não configurada para ${serviceName}`);
    }

    const startTime = Date.now();
    let response: Response;
    
    try {
      if (serviceName === 'zcolab') {
        if (!config.auth_token) {
          throw new Error('Token de autenticação não configurado para Zcolab');
        }

        console.log(`Testando Zcolab - URL: ${config.base_url}/clients`);
        
        response = await fetch(`${config.base_url}/clients`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'authtoken': config.auth_token
          }
        });
      } else {
        if (!config.app_token || !config.user_token) {
          throw new Error('App Token ou User Token não configurados para GLPI');
        }

        console.log(`Testando GLPI - URL: ${config.base_url}/initSession`);
        
        response = await fetch(`${config.base_url}/initSession`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'App-Token': config.app_token,
            'Authorization': `user_token ${config.user_token}`
          }
        });
      }

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      console.log(`${serviceName.toUpperCase()} Response Status: ${response.status}`);
      
      let responseText = '';
      try {
        responseText = await response.text();
        console.log(`${serviceName.toUpperCase()} Response:`, responseText.substring(0, 200));
      } catch (e) {
        console.log('Erro ao ler resposta:', e);
      }

      const result = {
        success: response.ok,
        status: response.status,
        responseTime,
        message: response.ok ? 'Conexão estabelecida com sucesso' : `HTTP ${response.status}: ${response.statusText}`
      };

      // Salvar resultado do teste na configuração
      const userId = await this.getCurrentUserId();
      if (userId) {
        await supabase
          .from('api_configurations')
          .update({
            last_test_at: new Date().toISOString(),
            last_test_status: result.success ? 'success' : 'error',
            last_test_message: result.message
          })
          .eq('service_name', serviceName)
          .eq('user_id', userId);
      }

      return result;

    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      console.error(`Erro ao testar ${serviceName}:`, error);
      
      const result = {
        success: false,
        status: 'Erro',
        responseTime,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      };

      // Salvar resultado do erro
      const userId = await this.getCurrentUserId();
      if (userId) {
        await supabase
          .from('api_configurations')
          .update({
            last_test_at: new Date().toISOString(),
            last_test_status: 'error',
            last_test_message: result.message
          })
          .eq('service_name', serviceName)
          .eq('user_id', userId);
      }

      return result;
    }
  }

  async addSyncLog(log: SyncLog): Promise<void> {
    try {
      const { error } = await supabase
        .from('sync_logs')
        .insert({
          ...log,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Erro ao salvar log:', error);
        throw new Error(`Erro ao salvar log: ${error.message}`);
      }

      // Log também no console para debug
      const timestamp = new Date().toLocaleString('pt-BR');
      console.log(`[${timestamp}] ${log.sync_type.toUpperCase()}: ${log.message}`);
    } catch (error) {
      console.error('Erro ao salvar log:', error);
    }
  }

  async getSyncLogs(limit: number = 100): Promise<SyncLog[]> {
    try {
      const { data, error } = await supabase
        .from('sync_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erro ao buscar logs:', error);
        return [];
      }

      return (data as SyncLog[]) || [];
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
      return [];
    }
  }

  async clearSyncLogs(): Promise<void> {
    try {
      const { error } = await supabase
        .from('sync_logs')
        .delete()
        .neq('id', '');

      if (error) {
        console.error('Erro ao limpar logs:', error);
        throw new Error(`Erro ao limpar logs: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro ao limpar logs:', error);
      throw error;
    }
  }

  async syncCustomersFromZcolab(): Promise<void> {
    try {
      const zcolabConfig = await this.getApiConfiguration('zcolab');
      const glpiConfig = await this.getApiConfiguration('glpi');

      if (!zcolabConfig || !glpiConfig) {
        throw new Error('Configurações do Zcolab ou GLPI não encontradas');
      }

      if (!zcolabConfig.enabled || !glpiConfig.enabled) {
        throw new Error('Zcolab ou GLPI não estão habilitados');
      }

      await this.addSyncLog({
        sync_type: 'customer',
        operation: 'sync',
        status: 'success',
        message: 'Iniciando sincronização de clientes Zcolab → GLPI'
      });

      console.log('Buscando clientes do Zcolab...');
      
      const zcolabResponse = await fetch(`${zcolabConfig.base_url}/clients`, {
        headers: {
          'authtoken': zcolabConfig.auth_token || '',
          'Content-Type': 'application/json'
        }
      });

      if (!zcolabResponse.ok) {
        throw new Error(`Erro ao buscar clientes do Zcolab: ${zcolabResponse.status}`);
      }

      const customers = await zcolabResponse.json();
      
      console.log('Clientes encontrados:', customers.length);

      // Inicializar sessão no GLPI
      const glpiSessionResponse = await fetch(`${glpiConfig.base_url}/initSession`, {
        method: 'GET',
        headers: {
          'App-Token': glpiConfig.app_token || '',
          'Authorization': `user_token ${glpiConfig.user_token || ''}`,
          'Content-Type': 'application/json'
        }
      });

      if (!glpiSessionResponse.ok) {
        throw new Error(`Erro ao inicializar sessão GLPI: ${glpiSessionResponse.status}`);
      }

      const sessionData = await glpiSessionResponse.json();
      const sessionToken = sessionData.session_token;

      let successCount = 0;
      let errorCount = 0;

      for (const customer of customers) {
        try {
          const glpiEntity = {
            name: customer.company || customer.name || 'Cliente sem nome',
            comment: customer.address || customer.billing_street || '',
            phonenumber: customer.phonenumber || '',
            email: customer.email || ''
          };

          console.log('Criando entidade no GLPI:', glpiEntity);

          const glpiResponse = await fetch(`${glpiConfig.base_url}/Entity`, {
            method: 'POST',
            headers: {
              'App-Token': glpiConfig.app_token || '',
              'Session-Token': sessionToken,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ input: glpiEntity })
          });

          if (glpiResponse.ok) {
            const result = await glpiResponse.json();
            successCount++;
            
            await this.addSyncLog({
              sync_type: 'customer',
              operation: 'create',
              status: 'success',
              message: `Cliente "${customer.company || customer.name}" sincronizado com sucesso`,
              details: `ID Zcolab: ${customer.userid} | ID GLPI: ${result.id}`,
              source_id: customer.userid?.toString(),
              target_id: result.id?.toString()
            });
          } else {
            throw new Error(`HTTP ${glpiResponse.status}: ${await glpiResponse.text()}`);
          }
          
        } catch (error) {
          errorCount++;
          await this.addSyncLog({
            sync_type: 'customer',
            operation: 'create',
            status: 'error',
            message: `Erro ao sincronizar cliente "${customer.company || customer.name}"`,
            details: error instanceof Error ? error.message : 'Erro desconhecido',
            source_id: customer.userid?.toString()
          });
        }
      }

      // Finalizar sessão GLPI
      await fetch(`${glpiConfig.base_url}/killSession`, {
        method: 'GET',
        headers: {
          'App-Token': glpiConfig.app_token || '',
          'Session-Token': sessionToken,
          'Content-Type': 'application/json'
        }
      });

      await this.addSyncLog({
        sync_type: 'customer',
        operation: 'sync',
        status: 'success',
        message: `Sincronização concluída: ${successCount} sucessos, ${errorCount} erros`
      });

    } catch (error) {
      await this.addSyncLog({
        sync_type: 'customer',
        operation: 'sync',
        status: 'error',
        message: 'Falha na sincronização de clientes',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      throw error;
    }
  }
}

export const supabaseApiService = new SupabaseApiService();
