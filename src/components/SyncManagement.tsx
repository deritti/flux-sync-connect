import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Users, Ticket, Play, Pause, RotateCcw, Calendar, ArrowLeftRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabaseApiService } from '@/services/supabaseApiService';

const SyncManagement = () => {
  const [syncStatus, setSyncStatus] = useState({
    companies: { enabled: true, running: false, lastSync: '2 horas atrás', progress: 0 },
    users: { enabled: true, running: false, lastSync: '1 hora atrás', progress: 0 },
    tickets: { enabled: true, running: false, lastSync: '30 min atrás', progress: 0 }
  });

  const { toast } = useToast();

  const handleSyncToggle = (type: string, enabled: boolean) => {
    setSyncStatus(prev => ({
      ...prev,
      [type]: { ...prev[type as keyof typeof prev], enabled }
    }));
    
    toast({
      title: `Sincronização ${enabled ? 'ativada' : 'desativada'}`,
      description: `Sincronização de ${type} foi ${enabled ? 'ativada' : 'desativada'} com sucesso.`,
    });
  };

  const handleManualSync = async (type: string) => {
    setSyncStatus(prev => ({
      ...prev,
      [type]: { ...prev[type as keyof typeof prev], running: true, progress: 0 }
    }));

    try {
      console.log(`Iniciando sincronização manual de ${type}...`);
      
      // Simular progresso
      const progressInterval = setInterval(() => {
        setSyncStatus(prev => {
          const currentProgress = prev[type as keyof typeof prev].progress;
          if (currentProgress >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return {
            ...prev,
            [type]: { ...prev[type as keyof typeof prev], progress: currentProgress + 10 }
          };
        });
      }, 300);

      // Executar sincronização real baseada no tipo
      let syncPromise;
      switch (type) {
        case 'companies':
          syncPromise = supabaseApiService.syncCustomersFromZcolab();
          break;
        case 'users':
          syncPromise = Promise.resolve(); // TODO: implementar sincronização de contatos
          break;
        case 'tickets':
          syncPromise = Promise.resolve(); // TODO: implementar sincronização de tickets
          break;
        default:
          throw new Error(`Tipo de sincronização desconhecido: ${type}`);
      }

      await syncPromise;

      // Finalizar progresso
      clearInterval(progressInterval);
      setSyncStatus(prev => ({
        ...prev,
        [type]: { 
          ...prev[type as keyof typeof prev], 
          running: false, 
          progress: 100, 
          lastSync: 'Agora' 
        }
      }));

      setTimeout(() => {
        setSyncStatus(prev => ({
          ...prev,
          [type]: { ...prev[type as keyof typeof prev], progress: 0 }
        }));
      }, 2000);

      toast({
        title: "Sincronização concluída",
        description: `Sincronização de ${type} foi concluída com sucesso.`,
      });

    } catch (error) {
      console.error(`Erro na sincronização de ${type}:`, error);
      
      setSyncStatus(prev => ({
        ...prev,
        [type]: { ...prev[type as keyof typeof prev], running: false, progress: 0 }
      }));

      toast({
        title: "Erro na sincronização",
        description: error instanceof Error ? error.message : `Falha na sincronização de ${type}`,
        variant: "destructive"
      });
    }
  };

  const syncConfigs = [
    {
      id: 'companies',
      title: 'Empresas/Entidades',
      description: 'Sincronização de clientes do Zcolab com entidades do GLPI',
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      direction: 'Zcolab → GLPI',
      fields: ['Nome', 'CNPJ', 'E-mail', 'Telefone', 'Endereço', 'Observações']
    },
    {
      id: 'users',
      title: 'Usuários/Contatos',
      description: 'Sincronização de contatos vinculados a clientes com usuários do GLPI',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      direction: 'Bidirecional ⇄',
      fields: ['Nome', 'E-mail', 'Telefone', 'Cargo', 'Grupo', 'Empresa']
    },
    {
      id: 'tickets',
      title: 'Tickets/Chamados',
      description: 'Sincronização de tickets/tarefas do Zcolab com tickets do GLPI',
      icon: Ticket,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      direction: 'Zcolab → GLPI',
      fields: ['Título', 'Descrição', 'Status', 'Prioridade', 'Categoria', 'Responsável']
    }
  ];

  return (
    <div className="space-y-6">
      {syncConfigs.map((config) => (
        <Card key={config.id} className="shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${config.bgColor}`}>
                  <config.icon className={`h-5 w-5 ${config.color}`} />
                </div>
                <div>
                  <CardTitle className="text-lg">{config.title}</CardTitle>
                  <CardDescription>{config.description}</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="flex items-center gap-1">
                  <ArrowLeftRight size={12} />
                  {config.direction}
                </Badge>
                <Switch
                  checked={syncStatus[config.id as keyof typeof syncStatus].enabled}
                  onCheckedChange={(checked) => handleSyncToggle(config.id, checked)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status and Progress */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <Badge variant={
                    syncStatus[config.id as keyof typeof syncStatus].running ? "default" : 
                    syncStatus[config.id as keyof typeof syncStatus].enabled ? "secondary" : "outline"
                  }>
                    {syncStatus[config.id as keyof typeof syncStatus].running ? 'Sincronizando' : 
                     syncStatus[config.id as keyof typeof syncStatus].enabled ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                {syncStatus[config.id as keyof typeof syncStatus].running && (
                  <Progress value={syncStatus[config.id as keyof typeof syncStatus].progress} className="w-full" />
                )}
              </div>
              
              <div className="space-y-2">
                <span className="text-sm font-medium">Última Sincronização</span>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Calendar size={12} />
                  {syncStatus[config.id as keyof typeof syncStatus].lastSync}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleManualSync(config.id)}
                  disabled={!syncStatus[config.id as keyof typeof syncStatus].enabled || 
                           syncStatus[config.id as keyof typeof syncStatus].running}
                  className="flex items-center gap-1"
                >
                  {syncStatus[config.id as keyof typeof syncStatus].running ? (
                    <Pause size={14} />
                  ) : (
                    <Play size={14} />
                  )}
                  {syncStatus[config.id as keyof typeof syncStatus].running ? 'Pausar' : 'Sincronizar'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  <RotateCcw size={14} />
                  Histórico
                </Button>
              </div>
            </div>

            {/* Field Mapping */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold mb-2">Campos Sincronizados</h4>
              <div className="flex flex-wrap gap-2">
                {config.fields.map((field, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {field}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Sync Schedule */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="text-orange-600" size={20} />
            Agendamento de Sincronização
          </CardTitle>
          <CardDescription>
            Configure os intervalos automáticos de sincronização
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="automatic" className="space-y-4">
            <TabsList>
              <TabsTrigger value="automatic">Automático</TabsTrigger>
              <TabsTrigger value="manual">Manual</TabsTrigger>
            </TabsList>
            
            <TabsContent value="automatic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Empresas</label>
                  <select className="w-full p-2 border rounded-md">
                    <option>A cada 4 horas</option>
                    <option>A cada 6 horas</option>
                    <option>A cada 12 horas</option>
                    <option>Diariamente</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Usuários</label>
                  <select className="w-full p-2 border rounded-md">
                    <option>A cada 2 horas</option>
                    <option>A cada 4 horas</option>
                    <option>A cada 6 horas</option>
                    <option>A cada 12 horas</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tickets</label>
                  <select className="w-full p-2 border rounded-md">
                    <option>A cada 15 minutos</option>
                    <option>A cada 30 minutos</option>
                    <option>A cada hora</option>
                    <option>A cada 2 horas</option>
                  </select>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="manual">
              <p className="text-sm text-gray-600 mb-4">
                As sincronizações serão executadas apenas manualmente ou via API
              </p>
              <Button variant="outline">
                Configurar API de trigger manual
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SyncManagement;
