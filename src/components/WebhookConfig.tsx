
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Webhook, Copy, CheckCircle, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const WebhookConfig = () => {
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);

  // URLs dos webhooks baseadas no projeto Supabase
  const webhookUrls = {
    perfex: `${window.location.origin}/api/webhook/perfex`,
    glpi: `${window.location.origin}/api/webhook/glpi`
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
      
      toast({
        title: "URL copiada!",
        description: `URL do webhook ${type.toUpperCase()} copiada para a área de transferência.`,
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar a URL",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="text-purple-600" size={20} />
            Configuração de Webhooks
          </CardTitle>
          <CardDescription>
            Configure webhooks para receber notificações em tempo real dos sistemas externos.
            Copie as URLs abaixo e configure nos respectivos sistemas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Webhook do Perfex */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Perfex CRM Webhook</h3>
              <Badge variant="outline">Entrada</Badge>
            </div>
            
            <Alert>
              <Settings className="h-4 w-4" />
              <AlertDescription>
                <strong>Como configurar no Perfex CRM:</strong>
                <ol className="mt-2 ml-4 list-decimal space-y-1">
                  <li>Acesse Admin → Settings → Webhooks</li>
                  <li>Clique em "New Webhook"</li>
                  <li>Cole a URL abaixo no campo "Webhook URL"</li>
                  <li>Selecione os eventos: Customer Created, Customer Updated</li>
                  <li>Defina o método como POST</li>
                </ol>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>URL do Webhook</Label>
              <div className="flex gap-2">
                <Input 
                  value={webhookUrls.perfex} 
                  readOnly 
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(webhookUrls.perfex, 'perfex')}
                >
                  {copied === 'perfex' ? <CheckCircle size={16} /> : <Copy size={16} />}
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="perfex-webhook-enabled" defaultChecked />
              <Label htmlFor="perfex-webhook-enabled">Webhook ativo</Label>
            </div>
          </div>

          {/* Webhook do GLPI */}
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">GLPI Webhook</h3>
              <Badge variant="outline">Entrada</Badge>
            </div>

            <Alert>
              <Settings className="h-4 w-4" />
              <AlertDescription>
                <strong>Como configurar no GLPI:</strong>
                <ol className="mt-2 ml-4 list-decimal space-y-1">
                  <li>Acesse Configurar → Notificações → Webhooks</li>
                  <li>Clique em "Adicionar webhook"</li>
                  <li>Cole a URL abaixo no campo "URL"</li>
                  <li>Selecione os eventos: Ticket Created, Ticket Updated</li>
                  <li>Defina o método como POST e formato JSON</li>
                </ol>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>URL do Webhook</Label>
              <div className="flex gap-2">
                <Input 
                  value={webhookUrls.glpi} 
                  readOnly 
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(webhookUrls.glpi, 'glpi')}
                >
                  {copied === 'glpi' ? <CheckCircle size={16} /> : <Copy size={16} />}
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="glpi-webhook-enabled" defaultChecked />
              <Label htmlFor="glpi-webhook-enabled">Webhook ativo</Label>
            </div>
          </div>

          {/* Configurações de Segurança */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-semibold">Configurações de Segurança</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Token de Segurança Perfex</Label>
                <Input 
                  type="password"
                  placeholder="Token para validar webhooks do Perfex"
                  className="font-mono"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Token de Segurança GLPI</Label>
                <Input 
                  type="password"
                  placeholder="Token para validar webhooks do GLPI"
                  className="font-mono"
                />
              </div>
            </div>

            <Alert>
              <AlertDescription>
                <strong>Importante:</strong> Configure tokens de segurança únicos para validar 
                a autenticidade dos webhooks recebidos. Isso previne requisições maliciosas.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Status dos Webhooks */}
      <Card>
        <CardHeader>
          <CardTitle>Status dos Webhooks</CardTitle>
          <CardDescription>
            Monitoramento em tempo real dos webhooks recebidos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Perfex CRM</h4>
              <div className="text-sm text-gray-600">
                <p>Último webhook: Nunca</p>
                <p>Total recebidos: 0</p>
                <Badge variant="secondary">Aguardando</Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">GLPI</h4>
              <div className="text-sm text-gray-600">
                <p>Último webhook: Nunca</p>
                <p>Total recebidos: 0</p>
                <Badge variant="secondary">Aguardando</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WebhookConfig;
