
import { MinistriesManager } from '@/components/MinistriesManager';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export default function MinistriesPage() {
  const { canAccessMinistries, loading } = useUserPermissions();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!canAccessMinistries) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Acesso Negado
            </CardTitle>
            <CardDescription>
              Você não tem permissão para acessar a seção de ministérios.
              Entre em contato com o administrador para solicitar acesso.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <MinistriesManager />
    </div>
  );
}
