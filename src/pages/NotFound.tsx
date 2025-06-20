
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-300">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mt-4">Página não encontrada</h2>
        <p className="text-gray-600 mt-2 mb-8">
          A página que você está procurando não existe.
        </p>
        <Button onClick={() => navigate('/')} className="inline-flex items-center">
          <Home className="h-4 w-4 mr-2" />
          Voltar ao Início
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
