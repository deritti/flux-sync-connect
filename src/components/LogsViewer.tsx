
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, CheckCircle, XCircle, Clock, Search, Download, RefreshCw, Filter, Database } from 'lucide-react';
import { supabaseApiService, SyncLog } from '@/services/supabase ApiService';

const LogsViewer = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
    
    // Atualizar logs a cada 5 segundos para mostrar em tempo real
    const interval = setInterval(() => {
      loadLogs();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const loadLogs = async () => {
    try {
      const logsData = await supabaseApiService.getSyncLogs();
      setLogs(logsData);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    } finally {
      setLoading(false);
    }
  };

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
                         (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLevel = selectedLevel === 'all' || log.status === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const logStats = {
    total: logs.length,
    success: logs.filter(l => l.status === 'success').length,
    error: logs.filter(l => l.status === 'error').length,
    warning: logs.filter(l => l.status === 'warning').length,
    info: logs.filter(l => l.status === 'success').length
  };

  const handleRefresh = () => {
    loadLogs();
  };

  const handleClearLogs = async () => {
    try {
      await supabaseApiService.clearSyncLogs();
      setLogs([]);
    } catch (error) {
      console.error('Erro ao limpar logs:', error);
    }
  };

  const handleExportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `sync-logs-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR');
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
                <Database className="text-orange-600" size={20} />
                Logs do Sistema - Supabase
              </CardTitle>
              <CardDescription>
                Monitore todas as atividades de sincronização armazenadas no banco de dados
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh} className="flex items-center gap-1">
                <RefreshCw size={14} />
                Atualizar
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportLogs} className="flex items-center gap-1">
                <Download size={14} />
                Exportar
              </Button>
              <Button variant="outline" size="sm" onClick={handleClearLogs} className="flex items-center gap-1">
                Limpar Logs
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
              </SelectContent>
            </Select>
          </div>

          {/* Real-time Logs List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">
                <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p>Carregando logs...</p>
              </div>
            ) : filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getLevelIcon(log.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={getLevelBadgeVariant(log.status)} className="text-xs">
                            {log.status.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {log.sync_type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {log.operation}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {log.created_at ? formatTimestamp(log.created_at) : 'N/A'}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">{log.message}</p>
                        {log.details && (
                          <p className="text-xs text-gray-600">{log.details}</p>
                        )}
                        {(log.source_id || log.target_id) && (
                          <div className="text-xs text-gray-500 mt-1">
                            {log.source_id && `ID Origem: ${log.source_id}`}
                            {log.source_id && log.target_id && ' | '}
                            {log.target_id && `ID Destino: ${log.target_id}`}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle size={48} className="mx-auto mb-2 text-gray-300" />
                <p>Nenhum log encontrado</p>
                <p className="text-sm">Execute uma sincronização para ver os logs</p>
              </div>
            )}
          </div>
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
                URL: gestaodeti.zuve.com.br | Configurado
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
                URL: central.zuve.com.br | Configurado
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Sincronização</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Ativo
                </Badge>
              </div>
              <div className="text-xs text-gray-600">
                Direção: Perfex → GLPI | Logs em tempo real
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogsViewer;
