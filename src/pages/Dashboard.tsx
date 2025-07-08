
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, User } from 'lucide-react';
import ConfigurationPanel from '@/components/ConfigurationPanel';
import StatsCards from '@/components/StatsCards';
import SyncManagement from '@/components/SyncManagement';
import LogsViewer from '@/components/LogsViewer';

const Dashboard = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">GLPI-Zcolab Integration</h1>
              <p className="text-gray-600">Sistema de Sincronização</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-700">{user?.email}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Bem-vindo ao Sistema de Integração</CardTitle>
            <CardDescription>
              Configure suas APIs, monitore sincronizações e visualize logs em tempo real.
              Para começar, configure suas credenciais de API do Zcolab e GLPI.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <StatsCards />

        {/* Configuration Panel */}
        <div className="mb-8">
          <ConfigurationPanel />
        </div>

        {/* Sync Management */}
        <div className="mb-8">
          <SyncManagement />
        </div>

        {/* Logs Viewer */}
        <LogsViewer />
      </main>
    </div>
  );
};

export default Dashboard;
