
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, XCircle, Clock, Search, Download, RefreshCw, Filter } from 'lucide-react';

const LogsViewer = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');

  const logs = [
    {
      id: 1,
      timestamp: '2024-06-19 14:35:22',
      level: 'success',
      category: 'sync_companies',
      message: 'Empresa "TechCorp Ltda" sincronizada com sucesso',
      details: 'CNPJ: 12.345.678/0001-90 | ID GLPI: 247 | ID Perfex: 89',
      duration: '1.2s'
    },
    {
      id: 2,
      timestamp: '2024-06-19 14:33:15',
      level: 'error',
      category: 'sync_tickets',
      message: 'Falha ao sincronizar ticket #12345',
      details: 'Código: API_TIMEOUT | Endpoint: /glpi/tickets | Tentativa: 3/3',
      duration: '30s'
    },
    {
      id: 3,
      timestamp: '2024-06-19 14:31:08',
      level: 'warning',
      category: 'sync_users',
      message: 'Usuário duplicado encontrado',
      details: 'Email: joao@empresa.com já existe no GLPI | Ação: Atualizado',
      duration: '0.8s'
    },
    {
      id: 4,
      timestamp: '2024-06-19 14:29:45',
      level: 'info',
      category: 'webhook',
      message: 'Webhook recebido do Perfex CRM',
      details: 'Evento: customer.updated | ID: 156 | Processado: Sim',
      duration: '0.3s'
    },
    {
      id: 5,
      timestamp: '2024-06-19 14:28:12',
      level: 'success',
      category: 'api_test',
      message: 'Teste de conexão com GLPI bem-sucedido',
      details: 'Latência: 45ms | Versão API: 10.0.3 | Status: OK',
      duration: '0.1s'
    }
  ];

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'success':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'error':
        return <XCircle size={16} className="text-red-600" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-yellow-600" />;
      default:
        return <Clock size={16} className="text-blue-600" />;
    }
  };

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || log.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const logStats = {
    total: logs.length,
    success: logs.filter(l => l.level === 'success').length,
    error: logs.filter(l => l.level === 'error').length,
    warning: logs.filter(l => l.level === 'warning').length,
    info: logs.filter(l => l.level === 'info').length
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">{logStats.total}</div>
            <p className="text-sm text-gray-600">Total de Logs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{logStats.success}</div>
            <p className="text-sm text-gray-600">Sucessos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{logStats.error}</div>
            <p className="text-sm text-gray-600">Erros</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{logStats.warning}</div>
            <p className="text-sm text-gray-600">Avisos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{logStats.info}</div>
            <p className="text-sm text-gray-600">Info</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="text-orange-600" size={20} />
                Logs do Sistema
              </CardTitle>
              <CardDescription>
                Monitore todas as atividades de sincronização e eventos do sistema
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <RefreshCw size={14} />
                Atualizar
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Download size={14} />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar nos logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-[200px]">
                <Filter size={16} className="mr-2" />
                <SelectValue placeholder="Filtrar por nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os níveis</SelectItem>
                <SelectItem value="success">Sucessos</SelectItem>
                <SelectItem value="error">Erros</SelectItem>
                <SelectItem value="warning">Avisos</SelectItem>
                <SelectItem value="info">Informações</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Logs List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredLogs.map((log) => (
              <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getLevelIcon(log.level)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getLevelBadgeVariant(log.level)} className="text-xs">
                          {log.level.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {log.category}
                        </Badge>
                        <span className="text-xs text-gray-500">{log.timestamp}</span>
                        <span className="text-xs text-gray-400">({log.duration})</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">{log.message}</p>
                      <p className="text-xs text-gray-600">{log.details}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle size={48} className="mx-auto mb-2 text-gray-300" />
              <p>Nenhum log encontrado com os filtros aplicados</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Health */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="text-green-600" size={20} />
            Saúde do Sistema
          </CardTitle>
          <CardDescription>
            Monitoramento de performance e disponibilidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API GLPI</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Online
                </Badge>
              </div>
              <div className="text-xs text-gray-600">
                Latência média: 45ms | Uptime: 99.9%
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API Perfex CRM</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Online
                </Badge>
              </div>
              <div className="text-xs text-gray-600">
                Latência média: 78ms | Uptime: 99.8%
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Webhooks</span>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Parcial
                </Badge>
              </div>
              <div className="text-xs text-gray-600">
                2/3 ativos | Últimos eventos: 5 min atrás
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogsViewer;
