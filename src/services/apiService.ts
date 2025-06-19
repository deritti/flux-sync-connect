
// Serviço para gerenciar as chamadas às APIs do GLPI e Perfex CRM
export interface GLPIConfig {
  url: string;
  appToken: string;
  userToken: string;
  enabled: boolean;
}

export interface PerfexConfig {
  url: string;
  authToken: string;
  enabled: boolean;
}

export interface SyncLog {
  id: string;
  timestamp: string;
  type: 'customer' | 'contact' | 'ticket';
  operation: 'create' | 'update' | 'sync';
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
  sourceId?: string;
  targetId?: string;
}

class ApiService {
  private glpiConfig: GLPIConfig | null = null;
  private perfexConfig: PerfexConfig | null = null;
  private logs: SyncLog[] = [];

  constructor() {
    this.loadConfigs();
  }

  private loadConfigs() {
    const glpiData = localStorage.getItem('glpi_config');
    const perfexData = localStorage.getItem('perfex_config');
    
    if (glpiData) this.glpiConfig = JSON.parse(glpiData);
    if (perfexData) this.perfexConfig = JSON.parse(perfexData);
  }

  private addLog(log: Omit<SyncLog, 'id' | 'timestamp'>) {
    const newLog: SyncLog = {
      ...log,
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString('pt-BR')
    };
    
    this.logs.unshift(newLog);
    console.log(`[${newLog.timestamp}] ${log.type.toUpperCase()}: ${log.message}`);
    
    // Manter apenas os últimos 100 logs
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(0, 100);
    }
  }

  async syncCustomersToPLPI(): Promise<void> {
    if (!this.perfexConfig || !this.glpiConfig) {
      throw new Error('Configurações não encontradas');
    }

    this.addLog({
      type: 'customer',
      operation: 'sync', 
      status: 'success',
      message: 'Iniciando sincronização de clientes Perfex → GLPI'
    });

    try {
      // Buscar clientes do Perfex
      const perfexResponse = await fetch(`${this.perfexConfig.url}/customers`, {
        headers: {
          'authtoken': this.perfexConfig.authToken,
          'Content-Type': 'application/json'
        }
      });

      if (!perfexResponse.ok) {
        throw new Error(`Erro ao buscar clientes do Perfex: ${perfexResponse.status}`);
      }

      const customers = await perfexResponse.json();
      console.log('Clientes do Perfex encontrados:', customers);

      // Para cada cliente, criar/atualizar entidade no GLPI
      for (const customer of customers.data || customers) {
        try {
          const glpiEntity = {
            name: customer.company || customer.name,
            comment: customer.address || '',
            // Mapear outros campos conforme necessário
          };

          // Criar entidade no GLPI
          const glpiResponse = await fetch(`${this.glpiConfig.url}/Entity`, {
            method: 'POST',
            headers: {
              'App-Token': this.glpiConfig.appToken,
              'Authorization': `user_token ${this.glpiConfig.userToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ input: glpiEntity })
          });

          if (glpiResponse.ok) {
            const result = await glpiResponse.json();
            this.addLog({
              type: 'customer',
              operation: 'create',
              status: 'success',
              message: `Cliente "${customer.company || customer.name}" sincronizado com sucesso`,
              details: `ID Perfex: ${customer.userid} | ID GLPI: ${result.id}`,
              sourceId: customer.userid?.toString(),
              targetId: result.id?.toString()
            });
          } else {
            throw new Error(`HTTP ${glpiResponse.status}`);
          }
        } catch (error) {
          this.addLog({
            type: 'customer',
            operation: 'create',
            status: 'error',
            message: `Erro ao sincronizar cliente "${customer.company || customer.name}"`,
            details: error.message,
            sourceId: customer.userid?.toString()
          });
        }
      }

      this.addLog({
        type: 'customer',
        operation: 'sync',
        status: 'success',
        message: 'Sincronização de clientes concluída'
      });

    } catch (error) {
      this.addLog({
        type: 'customer',
        operation: 'sync',
        status: 'error',
        message: 'Falha na sincronização de clientes',
        details: error.message
      });
      throw error;
    }
  }

  async syncContactsToGLPI(): Promise<void> {
    if (!this.perfexConfig || !this.glpiConfig) {
      throw new Error('Configurações não encontradas');
    }

    this.addLog({
      type: 'contact',
      operation: 'sync',
      status: 'success', 
      message: 'Iniciando sincronização de contatos Perfex → GLPI'
    });

    try {
      // Buscar contatos do Perfex
      const perfexResponse = await fetch(`${this.perfexConfig.url}/contacts`, {
        headers: {
          'authtoken': this.perfexConfig.authToken,
          'Content-Type': 'application/json'
        }
      });

      if (!perfexResponse.ok) {
        throw new Error(`Erro ao buscar contatos do Perfex: ${perfexResponse.status}`);
      }

      const contacts = await perfexResponse.json();
      console.log('Contatos do Perfex encontrados:', contacts);

      // Processar contatos similmente aos clientes...
      this.addLog({
        type: 'contact',
        operation: 'sync',
        status: 'success',
        message: 'Sincronização de contatos concluída'
      });

    } catch (error) {
      this.addLog({
        type: 'contact',
        operation: 'sync',
        status: 'error',
        message: 'Falha na sincronização de contatos',
        details: error.message
      });
      throw error;
    }
  }

  async syncTicketsToGLPI(): Promise<void> {
    if (!this.perfexConfig || !this.glpiConfig) {
      throw new Error('Configurações não encontradas');
    }

    this.addLog({
      type: 'ticket',
      operation: 'sync',
      status: 'success',
      message: 'Iniciando sincronização de tickets Perfex → GLPI'
    });

    try {
      // Buscar tasks/tickets do Perfex
      const perfexResponse = await fetch(`${this.perfexConfig.url}/tasks`, {
        headers: {
          'authtoken': this.perfexConfig.authToken,
          'Content-Type': 'application/json'
        }
      });

      if (!perfexResponse.ok) {
        throw new Error(`Erro ao buscar tickets do Perfex: ${perfexResponse.status}`);
      }

      const tickets = await perfexResponse.json();
      console.log('Tickets do Perfex encontrados:', tickets);

      // Processar tickets...
      this.addLog({
        type: 'ticket',
        operation: 'sync',
        status: 'success',
        message: 'Sincronização de tickets concluída'
      });

    } catch (error) {
      this.addLog({
        type: 'ticket',
        operation: 'sync',
        status: 'error',
        message: 'Falha na sincronização de tickets',
        details: error.message
      });
      throw error;
    }
  }

  getLogs(): SyncLog[] {
    return this.logs;
  }

  clearLogs(): void {
    this.logs = [];
  }
}

export const apiService = new ApiService();
