import { supabase } from '@/integrations/supabase/client';

export interface ApiConfiguration {
  id?: string;
  service_name: 'perfex' | 'glpi';
  base_url: string;
  auth_token?: string;
  app_token?: string;
  user_token?: string;
  enabled: boolean;
  last_test_at?: string;
  last_test_status?: string;
  last_test_message?: string;
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
  private isSupabaseAvailable(): boolean {
    return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
  }

  async saveApiConfiguration(config: ApiConfiguration): Promise<void> {
    if (!this.isSupabaseAvailable()) {
      console.warn('Supabase não configurado - salvando configuração localmente');
      localStorage.setItem(`api_config_${config.service_name}`, JSON.stringify(config));
      return;
    }

    const { error } = await supabase
      .from('api_configurations')
      .upsert({
        ...config,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'service_name'
      });

    if (error) {
      console.error('Erro ao salvar configuração:', error);
      throw new Error(`Erro ao salvar configuração: ${error.message}`);
    }
  }

  async getApiConfiguration(serviceName: 'perfex' | 'glpi'): Promise<ApiConfiguration | null> {
    if (!this.isSupabaseAvailable()) {
      console.warn('Supabase não configurado - buscando configuração local');
      const stored = localStorage.getItem(`api_config_${serviceName}`);
      return stored ? JSON.parse(stored) : null;
    }

    const { data, error } = await supabase
      .from('api_configurations')
      .select('*')
      .eq('service_name', serviceName)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao buscar configuração:', error);
      throw new Error(`Erro ao buscar configuração: ${error.message}`);
    }

    return data;
  }

  async getAllApiConfigurations(): Promise<ApiConfiguration[]> {
    if (!this.isSupabaseAvailable()) {
      console.warn('Supabase não configurado - buscando configurações locais');
      const perfex = localStorage.getItem('api_config_perfex');
      const glpi = localStorage.getItem('api_config_glpi');
      const configs = [];
      if (perfex) configs.push(JSON.parse(perfex));
      if (glpi) configs.push(JSON.parse(glpi));
      return configs;
    }

    const { data, error } = await supabase
      .from('api_configurations')
      .select('*')
      .order('service_name');

    if (error) {
      console.error('Erro ao buscar configurações:', error);
      throw new Error(`Erro ao buscar configurações: ${error.message}`);
    }

    return data || [];
  }

  async testApiConnection(serviceName: 'perfex' | 'glpi'): Promise<{
    success: boolean;
    status: number | string;
    responseTime: number;
    message: string;
  }> {
    const config = await this.getApiConfiguration(serviceName);
    if (!config) {
      throw new Error(`Configuração para ${serviceName} não encontrada`);
    }

    const startTime = Date.now();
    let response: Response;
    
    try {
      if (serviceName === 'perfex') {
        console.log(`Testando Perfex - URL: ${config.base_url}`);
        console.log(`Testando Perfex - Token: ${config.auth_token?.substring(0, 20)}...`);
        
        response = await fetch(`${config.base_url}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'authtoken': config.auth_token || ''
          }
        });
      } else {
        console.log(`Testando GLPI - URL: ${config.base_url}/initSession`);
        
        response = await fetch(`${config.base_url}/initSession`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'App-Token': config.app_token || '',
            'Authorization': `user_token ${config.user_token || ''}`
          }
        });
      }

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      console.log(`${serviceName.toUpperCase()} Response Status: ${response.status}`);
      
      const result = {
        success: response.ok,
        status: response.status,
        responseTime,
        message: response.ok ? 'Conexão estabelecida com sucesso' : `HTTP ${response.status}: ${response.statusText}`
      };

      // Salvar resultado do teste na configuração apenas se Supabase estiver disponível
      if (this.isSupabaseAvailable()) {
        await supabase
          .from('api_configurations')
          .update({
            last_test_at: new Date().toISOString(),
            last_test_status: result.success ? 'success' : 'error',
            last_test_message: result.message
          })
          .eq('service_name', serviceName);
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

      // Salvar resultado do erro apenas se Supabase estiver disponível
      if (this.isSupabaseAvailable()) {
        await supabase
          .from('api_configurations')
          .update({
            last_test_at: new Date().toISOString(),
            last_test_status: 'error',
            last_test_message: result.message
          })
          .eq('service_name', serviceName);
      }

      return result;
    }
  }

  async addSyncLog(log: SyncLog): Promise<void> {
    if (!this.isSupabaseAvailable()) {
      console.warn('Supabase não configurado - log apenas no console');
      const timestamp = new Date().toLocaleString('pt-BR');
      console.log(`[${timestamp}] ${log.sync_type.toUpperCase()}: ${log.message}`);
      return;
    }

    const { error } = await supabase
      .from('sync_logs')
      .insert({
        ...log,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Erro ao salvar log:', error);
    }

    // Log também no console para debug
    const timestamp = new Date().toLocaleString('pt-BR');
    console.log(`[${timestamp}] ${log.sync_type.toUpperCase()}: ${log.message}`);
  }

  async getSyncLogs(limit: number = 100): Promise<SyncLog[]> {
    if (!this.isSupabaseAvailable()) {
      console.warn('Supabase não configurado - retornando logs vazios');
      return [];
    }

    const { data, error } = await supabase
      .from('sync_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erro ao buscar logs:', error);
      return [];
    }

    return data || [];
  }

  async clearSyncLogs(): Promise<void> {
    if (!this.isSupabaseAvailable()) {
      console.warn('Supabase não configurado - não há logs para limpar');
      return;
    }

    const { error } = await supabase
      .from('sync_logs')
      .delete()
      .neq('id', '');

    if (error) {
      console.error('Erro ao limpar logs:', error);
      throw new Error(`Erro ao limpar logs: ${error.message}`);
    }
  }

  async syncCustomersFromPerfex(): Promise<void> {
    const perfexConfig = await this.getApiConfiguration('perfex');
    const glpiConfig = await this.getApiConfiguration('glpi');

    if (!perfexConfig || !glpiConfig) {
      throw new Error('Configurações do Perfex ou GLPI não encontradas');
    }

    await this.addSyncLog({
      sync_type: 'customer',
      operation: 'sync',
      status: 'success',
      message: 'Iniciando sincronização de clientes Perfex → GLPI'
    });

    try {
      console.log('Buscando clientes do Perfex...');
      
      const perfexResponse = await fetch(perfexConfig.base_url, {
        headers: {
          'authtoken': perfexConfig.auth_token || '',
          'Content-Type': 'application/json'
        }
      });

      if (!perfexResponse.ok) {
        throw new Error(`Erro ao buscar clientes do Perfex: ${perfexResponse.status}`);
      }

      const customersData = await perfexResponse.json();
      const customers = customersData.data || customersData || [];
      
      console.log('Clientes encontrados:', customers.length);

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
              'Authorization': `user_token ${glpiConfig.user_token || ''}`,
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
              details: `ID Perfex: ${customer.userid} | ID GLPI: ${result.id}`,
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

  async initializeDefaultConfigurations(): Promise<void> {
    const perfexExists = await this.getApiConfiguration('perfex');
    const glpiExists = await this.getApiConfiguration('glpi');

    if (!perfexExists) {
      await this.saveApiConfiguration({
        service_name: 'perfex',
        base_url: 'https://central.zuve.com.br/api/customers',
        auth_token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoibWFyY28iLCJuYW1lIjoibWFyY28iLCJBUElfVElNRSI6MTc1MDMzMjYzNH0.nsayzEA0J5oP0bN7HVabrvjGmjuVTo1xlhS8DsO9V_g',
        enabled: true
      });
    }

    if (!glpiExists) {
      await this.saveApiConfiguration({
        service_name: 'glpi',
        base_url: 'https://gestaodeti.zuve.com.br/apirest.php',
        app_token: 'mgEtK9pOwoYRqmMHbmMzjz0FcAMOJo9VwtMyDy6P',
        user_token: '0GCLWm05oh1u86qWgFXZmYOWnvqBdTQmm4FkRHwD',
        enabled: true
      });
    }
  }
}

export const supabaseApiService = new SupabaseApiService();
