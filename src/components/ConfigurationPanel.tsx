
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Server, Database, Shield, Eye, EyeOff, TestTube, CheckCircle, XCircle, Clock, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabaseApiService, ApiConfiguration } from '@/services/supabaseApiService';
import WebhookConfig from './WebhookConfig';

const ConfigurationPanel = () => {
  const [showPasswords, setShowPasswords] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState({ glpi: false, perfex: false });
  const [connectionStatus, setConnectionStatus] = useState<{ [key: string]: any }>({ glpi: null, perfex: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const [glpiConfig, setGlpiConfig] = useState<ApiConfiguration>({
    service_name: 'glpi',
    base_url: '',
    app_token: '',
    user_token: '',
    enabled: true
  });

  const [perfexConfig, setPerfexConfig] = useState<ApiConfiguration>({
    service_name: 'perfex',
    base_url: '',
    auth_token: '',
    enabled: true
  });

  useEffect(() => {
    if (user) {
      loadConfigurations();
    }
  }, [user]);

  const loadConfigurations = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        console.log('Usuário não autenticado');
        return;
      }

      // Inicializar configurações padrão se não existirem
      await supabaseApiService.initializeDefaultConfigurations();
      
      const [perfexData, glpiData] = await Promise.all([
        supabaseApiService.getApiConfiguration('perfex'),
        supabaseApiService.getApiConfiguration('glpi')
      ]);

      if (perfexData) {
        setPerfexConfig(perfexData);
      }

      if (glpiData) {
        setGlpiConfig(glpiData);
      }

    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: "Erro",
        description: `Erro ao carregar configurações: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const validateConfiguration = (config: ApiConfiguration): string[] => {
    const errors: string[] = [];

    if (!config.base_url.trim()) {
      errors.push('URL base é obrigatória');
    } else if (!config.base_url.startsWith('http')) {
      errors.push('URL base deve começar com http:// ou https://');
    }

    if (config.service_name === 'perfex') {
      if (!config.auth_token?.trim()) {
        errors.push('Token de autenticação é obrigatório para Perfex');
      }
    } else if (config.service_name === 'glpi') {
      if (!config.app_token?.trim()) {
        errors.push('App Token é obrigatório para GLPI');
      }
      if (!config.user_token?.trim()) {
        errors.push('User Token é obrigatório para GLPI');
      }
    }

    return errors;
  };

  const handleTestConnection = async (system: 'glpi' | 'perfex') => {
    const config = system === 'glpi' ? glpiConfig : perfexConfig;
    const validationErrors = validateConfiguration(config);

    if (validationErrors.length > 0) {
      toast({
        title: "Configuração inválida",
        description: validationErrors.join(', '),
        variant: "destructive"
      });
      return;
    }

    setIsTestingConnection(prev => ({ ...prev, [system]: true }));
    setConnectionStatus(prev => ({ ...prev, [system]: null }));
    
    try {
      // Salvar configuração antes de testar
      await supabaseApiService.saveApiConfiguration(config);
      
      const result = await supabaseApiService.testApiConnection(system);
      
      setConnectionStatus(prev => ({ 
        ...prev, 
        [system]: result
      }));
      
      toast({
        title: result.success ? "Conexão testada com sucesso" : "Erro na conexão",
        description: `${system.toUpperCase()}: ${result.message} (${result.responseTime}ms)`,
        variant: result.success ? "default" : "destructive"
      });

    } catch (error) {
      console.error(`Erro ao testar ${system}:`, error);
      
      const errorResult = {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        status: 'Erro'
      };
      
      setConnectionStatus(prev => ({ 
        ...prev, 
        [system]: errorResult
      }));
      
      toast({
        title: "Erro na conexão",
        description: `${system.toUpperCase()}: ${errorResult.message}`,
        variant: "destructive"
      });
    } finally {
      setIsTestingConnection(prev => ({ ...prev, [system]: false }));
    }
  };

  const handleSaveConfig = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    const glpiErrors = validateConfiguration(glpiConfig);
    const perfexErrors = validateConfiguration(perfexConfig);

    if (glpiErrors.length > 0 || perfexErrors.length > 0) {
      toast({
        title: "Configurações inválidas",
        description: [...glpiErrors, ...perfexErrors].join(', '),
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      
      await Promise.all([
        supabaseApiService.saveApiConfiguration(glpiConfig),
        supabaseApiService.saveApiConfiguration(perfexConfig)
      ]);
      
      toast({
        title: "Configurações salvas",
        description: "As configurações foram salvas com sucesso no Supabase.",
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: `Erro ao salvar configurações: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const renderConnectionStatus = (system: string) => {
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

  if (!user) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Você precisa estar logado para acessar as configurações.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando configurações...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="apis" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="apis">Configuração de APIs</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="apis">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="text-blue-600" size={20} />
                Configuração de APIs - Supabase
              </CardTitle>
              <CardDescription>
                Configure as credenciais de acesso aos sistemas GLPI e Perfex CRM (armazenadas com segurança)
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
                        placeholder="https://seu-glpi.com/apirest.php"
                        value={glpiConfig.base_url}
                        onChange={(e) => setGlpiConfig(prev => ({ ...prev, base_url: e.target.value }))}
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
                            value={glpiConfig.app_token || ''}
                            onChange={(e) => setGlpiConfig(prev => ({ ...prev, app_token: e.target.value }))}
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
                            value={glpiConfig.user_token || ''}
                            onChange={(e) => setGlpiConfig(prev => ({ ...prev, user_token: e.target.value }))}
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
                      <Label htmlFor="perfex-url">URL Base da API</Label>
                      <Input
                        id="perfex-url"
                        placeholder="https://seu-perfex.com"
                        value={perfexConfig.base_url}
                        onChange={(e) => setPerfexConfig(prev => ({ ...prev, base_url: e.target.value }))}
                      />
                      <p className="text-xs text-gray-500">
                        URL base do Perfex (sem /api no final)
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="perfex-token">Auth Token</Label>
                      <div className="relative">
                        <Input
                          id="perfex-token"
                          type={showPasswords ? "text" : "password"}
                          placeholder="Auth Token do Perfex..."
                          value={perfexConfig.auth_token || ''}
                          onChange={(e) => setPerfexConfig(prev => ({ ...prev, auth_token: e.target.value }))}
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
                <Button 
                  onClick={handleSaveConfig} 
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  {saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Shield size={16} />
                  )}
                  {saving ? 'Salvando...' : 'Salvar no Supabase'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks">
          <WebhookConfig />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConfigurationPanel;
