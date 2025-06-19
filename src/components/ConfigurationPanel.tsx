
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Server, Database, Webhook, Shield, Eye, EyeOff, TestTube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ConfigurationPanel = () => {
  const [showPasswords, setShowPasswords] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const { toast } = useToast();

  const [glpiConfig, setGlpiConfig] = useState({
    url: 'https://glpi.exemplo.com/api',
    token: '',
    enabled: true
  });

  const [perfexConfig, setPerfexConfig] = useState({
    url: 'https://perfex.exemplo.com/api',
    token: '',
    enabled: true
  });

  const handleTestConnection = async (system: 'glpi' | 'perfex') => {
    setIsTestingConnection(true);
    console.log(`Testing connection to ${system}...`);
    
    // Simulate API test
    setTimeout(() => {
      toast({
        title: "Conexão testada com sucesso",
        description: `Conexão com ${system.toUpperCase()} estabelecida corretamente.`,
      });
      setIsTestingConnection(false);
    }, 2000);
  };

  const handleSaveConfig = () => {
    toast({
      title: "Configurações salvas",
      description: "As configurações foram salvas com sucesso.",
    });
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="glpi-url">URL da API</Label>
                  <Input
                    id="glpi-url"
                    placeholder="https://glpi.exemplo.com/api"
                    value={glpiConfig.url}
                    onChange={(e) => setGlpiConfig(prev => ({ ...prev, url: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="glpi-token">Token de Aplicação</Label>
                  <div className="relative">
                    <Input
                      id="glpi-token"
                      type={showPasswords ? "text" : "password"}
                      placeholder="Token de acesso..."
                      value={glpiConfig.token}
                      onChange={(e) => setGlpiConfig(prev => ({ ...prev, token: e.target.value }))}
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
                onClick={() => handleTestConnection('glpi')}
                disabled={isTestingConnection}
                className="flex items-center gap-2"
              >
                <TestTube size={16} />
                {isTestingConnection ? 'Testando...' : 'Testar Conexão'}
              </Button>
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="perfex-url">URL da API</Label>
                  <Input
                    id="perfex-url"
                    placeholder="https://perfex.exemplo.com/api"
                    value={perfexConfig.url}
                    onChange={(e) => setPerfexConfig(prev => ({ ...prev, url: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="perfex-token">API Key</Label>
                  <div className="relative">
                    <Input
                      id="perfex-token"
                      type={showPasswords ? "text" : "password"}
                      placeholder="API Key..."
                      value={perfexConfig.token}
                      onChange={(e) => setPerfexConfig(prev => ({ ...prev, token: e.target.value }))}
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
                disabled={isTestingConnection}
                className="flex items-center gap-2"
              >
                <TestTube size={16} />
                {isTestingConnection ? 'Testando...' : 'Testar Conexão'}
              </Button>
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
