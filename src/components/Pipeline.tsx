
import { KanbanPipeline } from './KanbanPipeline';
import { useLeaderPermissions } from '@/hooks/useLeaderPermissions';

export const Pipeline = () => {
  const { isAdmin } = useLeaderPermissions();

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header fixo - Sistema Matheus Pastorini */}
      <div className="flex-shrink-0 p-4 border-b bg-white shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estágio dos Discípulos</h1>
          <p className="text-gray-600 text-sm">
            {isAdmin ? 'Gerencie todos os discípulos pelos estágios do funil' : 'Visualize seus discípulos pelos estágios'} - Sistema Matheus Pastorini
          </p>
        </div>
      </div>

      {/* Conteúdo principal sem scroll - altura fixa controlada */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <KanbanPipeline />
      </div>
    </div>
  );
};
