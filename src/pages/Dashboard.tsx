
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Users, Building2, Ticket, Settings, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import ConfigurationPanel from '@/components/ConfigurationPanel';
import SyncManagement from '@/components/SyncManagement';
import LogsViewer from '@/components/LogsViewer';
import StatsCards from '@/components/StatsCards';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Sistema de Integração GLPI ⇄ Perfex CRM
          </h1>
          <p className="text-lg text-gray-600">
            Sincronização inteligente e bidirecional entre sistemas
          </p>
        </div>

        {/* Status Cards */}
        <StatsCards />

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity size={16} />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings size={16} />
              Configuração
            </TabsTrigger>
            <TabsTrigger value="sync" className="flex items-center gap-2">
              <Users size={16} />
              Sincronização
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <AlertTriangle size={16} />
              Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Integration Status */}
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="text-blue-600" size={20} />
                    Status das Integrações
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>GLPI API</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle size={12} className="mr-1" />
                      Conectado
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Perfex CRM API</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle size={12} className="mr-1" />
                      Conectado
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Webhooks</span>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <Clock size={12} className="mr-1" />
                      Configurando
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Sync Activity */}
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="text-purple-600" size={20} />
                    Atividade Recente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                      <CheckCircle size={16} className="text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Cliente sincronizado</p>
                        <p className="text-xs text-gray-500">Empresa ABC → GLPI</p>
                      </div>
                      <span className="text-xs text-gray-400">2 min</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                      <Ticket size={16} className="text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Ticket criado</p>
                        <p className="text-xs text-gray-500">#12345 → Perfex CRM</p>
                      </div>
                      <span className="text-xs text-gray-400">5 min</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-orange-50 rounded-lg">
                      <Users size={16} className="text-orange-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Usuário atualizado</p>
                        <p className="text-xs text-gray-500">João Silva → GLPI</p>
                      </div>
                      <span className="text-xs text-gray-400">8 min</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>
                  Execute operações de sincronização manualmente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
                    <Building2 size={24} className="text-blue-600" />
                    <span className="text-sm">Sincronizar Empresas</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
                    <Users size={24} className="text-green-600" />
                    <span className="text-sm">Sincronizar Usuários</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
                    <Ticket size={24} className="text-purple-600" />
                    <span className="text-sm">Sincronizar Tickets</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
                    <Activity size={24} className="text-orange-600" />
                    <span className="text-sm">Teste Conexão</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="config">
            <ConfigurationPanel />
          </TabsContent>

          <TabsContent value="sync">
            <SyncManagement />
          </TabsContent>

          <TabsContent value="logs">
            <LogsViewer />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
