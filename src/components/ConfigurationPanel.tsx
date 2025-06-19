
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Server, Database, Webhook, Shield, Eye, EyeOff, TestTube, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ConfigurationPanel = () => {
  const [showPasswords, setShowPasswords] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState({ glpi: false, perfex: false });
  const [connectionStatus, setConnectionStatus] = useState({ glpi: null, perfex: null });
  const { toast } = useToast();

  const [glpiConfig, setGlpiConfig] = useState({
    url: 'https://gestaodeti.zuve.com.br/apirest.php',
    appToken: 'mgEtK9pOwoYRqmMHbmMzjz0FcAMOJo9VwtMyDy6P',
    userToken: '0GCLWm05oh1u86qWgFXZmYOWnvqBdTQmm4FkRHwD',
    enabled: true
  });

  const [perfexConfig, setPerfexConfig] = useState({
    url: 'https://central.zuve.com.br/api',
    authToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoibWFyY28iLCJuYW1lIjoibWFyY28iLCJBUElfVElNRSI6MTc1MDMzMjYzNH0.nsayzEA0J5oP0bN7HVabrvjGmjuVTo1xlhS8DsO9V_g',
    enabled: true
  });

  const handleTestConnection = async (system) => {
    setIsTestingConnection(prev => ({ ...prev, [system]: true }));
    setConnectionStatus(prev => ({ ...prev, [system]: null }));
    
    console.log(`Testando conexão com ${system.toUpperCase()}...`);
    
    try {
      const startTime = Date.now();
      let response;
      
      if (system === 'glpi') {
        console.log(`GLPI Test - URL: ${glpiConfig.url}`);
        console.log(`GLPI Test - App-Token: ${glpiConfig.appToken}`);
        console.log(`GLPI Test - User-Token: ${glpiConfig.userToken}`);
        
        response = await fetch(`${glpiConfig.url}/initSession`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'App-Token': glpiConfig.appToken,
            'Authorization': `user_token ${glpiConfig.userToken}`
          }
        });
      } else {
        console.log(`Perfex Test - URL: ${perfexConfig.url}`);
        console.log(`Perfex Test - Auth Token: ${perfexConfig.authToken}`);
        
        response = await fetch(`${perfexConfig.url}/customers`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'authtoken': perfexConfig.authToken
          }
        });
      }
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      console.log(`${system.toUpperCase()} Response Status: ${response.status}`);
      console.log(`${system.toUpperCase()} Response Time: ${responseTime}ms`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`${system.toUpperCase()} Response Data:`, data);
        
        setConnectionStatus(prev => ({ 
          ...prev, 
          [system]: { 
            success: true, 
            status: response.status, 
            responseTime, 
            message: 'Conexão estabelecida com sucesso' 
          } 
        }));
        
        toast({
          title: "Conexão testada com sucesso",
          description: `${system.toUpperCase()}: ${response.status} OK (${responseTime}ms)`,
        });
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Erro ao testar ${system}:`, error);
      
      setConnectionStatus(prev => ({ 
        ...prev, 
        [system]: { 
          success: false, 
          message: error.message,
          status: 'Erro'
        } 
      }));
      
      toast({
        title: "Erro na conexão",
        description: `${system.toUpperCase()}: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsTestingConnection(prev => ({ ...prev, [system]: false }));
    }
  };

  const handleSaveConfig = () => {
    console.log('Salvando configurações...');
    console.log('GLPI Config:', glpiConfig);
    console.log('Perfex Config:', perfexConfig);
    
    // TODO: Integrar com Supabase para salvar configurações seguras
    localStorage.setItem('glpi_config', JSON.stringify(glpiConfig));
    localStorage.setItem('perfex_config', JSON.stringify(perfexConfig));
    
    toast({
      title: "Configurações salvas",
      description: "As configurações foram salvas com sucesso.",
    });
  };

  const renderConnectionStatus = (system) => {
    const status = connectionStatus[system];
    if (!status) return null;
    
    return (
      <Alert className={`mt-2 ${status.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
        <div className="flex items-center gap-2">
          {status.success ? (
            <CheckCircle size={16} className="text-green-600" />
          ) : (
            <XCircle size={16} className="text-red-600" />
          )}
          <AlertDescription className="text-sm">
            <strong>{status.success ? 'Sucesso' : 'Erro'}:</strong> {status.message}
            {status.responseTime && ` (${status.responseTime}ms)`}
            {status.status && ` - Status: ${status.status}`}
          </AlertDescription>
        </div>
      </Alert>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="text-blue-600" size={20} />
            Configuração de APIs
          </CardTitle>
          <CardDescription>
            Configure as credenciais de acesso aos sistemas GLPI e Perfex CRM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="glpi" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="glpi">GLPI</TabsTrigger>
              <TabsTrigger value="perfex">Perfex CRM</TabsTrigger>
            </TabsList>

            <TabsContent value="glpi" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Configuração GLPI</h3>
                  <Badge variant={glpiConfig.enabled ? "default" : "secondary"}>
                    {glpiConfig.enabled ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <Switch
                  checked={glpiConfig.enabled}
                  onCheckedChange={(checked) => 
                    setGlpiConfig(prev => ({ ...prev, enabled: checked }))
                  }
                />
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="glpi-url">URL da API</Label>
                  <Input
                    id="glpi-url"
                    placeholder="https://gestaodeti.zuve.com.br/apirest.php"
                    value={glpiConfig.url}
                    onChange={(e) => setGlpiConfig(prev => ({ ...prev, url: e.target.value }))}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="glpi-app-token">App Token</Label>
                    <div className="relative">
                      <Input
                        id="glpi-app-token"
                        type={showPasswords ? "text" : "password"}
                        placeholder="App Token do GLPI..."
                        value={glpiConfig.appToken}
                        onChange={(e) => setGlpiConfig(prev => ({ ...prev, appToken: e.target.value }))}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPasswords(!showPasswords)}
                      >
                        {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="glpi-user-token">User Token</Label>
                    <div className="relative">
                      <Input
                        id="glpi-user-token"
                        type={showPasswords ? "text" : "password"}
                        placeholder="User Token do GLPI..."
                        value={glpiConfig.userToken}
                        onChange={(e) => setGlpiConfig(prev => ({ ...prev, userToken: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={() => handleTestConnection('glpi')}
                disabled={isTestingConnection.glpi}
                className="flex items-center gap-2"
              >
                {isTestingConnection.glpi ? (
                  <Clock size={16} className="animate-spin" />
                ) : (
                  <TestTube size={16} />
                )}
                {isTestingConnection.glpi ? 'Testando...' : 'Testar Conexão'}
              </Button>
              
              {renderConnectionStatus('glpi')}
            </TabsContent>

            <TabsContent value="perfex" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Configuração Perfex CRM</h3>
                  <Badge variant={perfexConfig.enabled ? "default" : "secondary"}>
                    {perfexConfig.enabled ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <Switch
                  checked={perfexConfig.enabled}
                  onCheckedChange={(checked) => 
                    setPerfexConfig(prev => ({ ...prev, enabled: checked }))
                  }
                />
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="perfex-url">URL da API</Label>
                  <Input
                    id="perfex-url"
                    placeholder="https://central.zuve.com.br/api"
                    value={perfexConfig.url}
                    onChange={(e) => setPerfexConfig(prev => ({ ...prev, url: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="perfex-token">Auth Token</Label>
                  <div className="relative">
                    <Input
                      id="perfex-token"
                      type={showPasswords ? "text" : "password"}
                      placeholder="Auth Token do Perfex..."
                      value={perfexConfig.authToken}
                      onChange={(e) => setPerfexConfig(prev => ({ ...prev, authToken: e.target.value }))}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPasswords(!showPasswords)}
                    >
                      {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={() => handleTestConnection('perfex')}
                disabled={isTestingConnection.perfex}
                className="flex items-center gap-2"
              >
                {isTestingConnection.perfex ? (
                  <Clock size={16} className="animate-spin" />
                ) : (
                  <TestTube size={16} />
                )}
                {isTestingConnection.perfex ? 'Testando...' : 'Testar Conexão'}
              </Button>
              
              {renderConnectionStatus('perfex')}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end pt-6 border-t">
            <Button onClick={handleSaveConfig} className="flex items-center gap-2">
              <Shield size={16} />
              Salvar Configurações
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Webhook Configuration */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="text-purple-600" size={20} />
            Configuração de Webhooks
          </CardTitle>
          <CardDescription>
            Configure os endpoints para receber notificações em tempo real
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">GLPI Webhooks</h4>
              <div className="space-y-2">
                <Label>URL do Webhook</Label>
                <Input 
                  placeholder="https://seu-sistema.com/webhook/glpi"
                  defaultValue="https://integrador.exemplo.com/webhook/glpi"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="glpi-webhook" defaultChecked />
                <Label htmlFor="glpi-webhook">Ativar webhooks do GLPI</Label>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Perfex CRM Webhooks</h4>
              <div className="space-y-2">
                <Label>URL do Webhook</Label>
                <Input 
                  placeholder="https://seu-sistema.com/webhook/perfex"
                  defaultValue="https://integrador.exemplo.com/webhook/perfex"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="perfex-webhook" defaultChecked />
                <Label htmlFor="perfex-webhook">Ativar webhooks do Perfex</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfigurationPanel;
