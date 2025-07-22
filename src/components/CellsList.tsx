import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Home, MapPin, Clock, Trash2, Users, Edit, UserCheck } from 'lucide-react';
import { useLeaderCells } from '@/hooks/useLeaderCells';
import { useCells } from '@/hooks/useCells';
import { EditCellDialog } from './EditCellDialog';
import { CellModal } from './CellModal';
import { CellsFilter, CellFilters } from './CellsFilter';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLeaderPermissions } from '@/hooks/useLeaderPermissions';

export const CellsList = () => {
  const { canManageAllCells } = useLeaderPermissions();
  
  // Sempre chamar ambos os hooks - nunca condicionalmente
  const { 
    cells: allCells, 
    loading: allLoading, 
    deleteCell, 
    fetchCells,
    applyFilters 
  } = useCells();
  
  const { 
    cells: leaderCells, 
    loading: leaderLoading 
  } = useLeaderCells();
  
  // Usar as células apropriadas baseado nas permissões
  const cells = canManageAllCells ? allCells : leaderCells;
  const loading = canManageAllCells ? allLoading : leaderLoading;
  
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<any>(null);
  const [cellModalOpen, setCellModalOpen] = useState(false);
  const { toast } = useToast();

  console.log('CellsList: Estado atual:', { 
    cellsCount: cells.length, 
    loading, 
    cells: cells.slice(0, 3),
    canManageAllCells
  });

  const handleFilterChange = (filters: CellFilters) => {
    if (canManageAllCells && applyFilters) {
      applyFilters(filters);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!canManageAllCells || !deleteCell) {
      toast({
        title: "Erro",
        description: "Você não tem permissão para excluir células",
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`Tem certeza que deseja excluir a célula "${name}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteCell(id);
      toast({
        title: "Sucesso",
        description: "Célula excluída com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao excluir célula:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir célula. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleCellClick = (cell: any) => {
    setSelectedCell(cell);
    setCellModalOpen(true);
  };

  const handleEditCell = (cell: any) => {
    if (!canManageAllCells) {
      toast({
        title: "Informação",
        description: "Você pode visualizar os detalhes clicando na célula",
        variant: "default",
      });
      return;
    }
    setEditingCell(cell);
    setEditDialogOpen(true);
  };

  const handleCellUpdated = () => {
    if (canManageAllCells) {
      fetchCells();
    }
    setEditDialogOpen(false);
    setEditingCell(null);
    setCellModalOpen(false);
  };

  const getWeekDayName = (day: number) => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[day] || 'N/A';
  };

  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      return `${hours}:${minutes}`;
    } catch {
      return time;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="ml-2 text-gray-600">Carregando células...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {canManageAllCells && <CellsFilter onFilterChange={handleFilterChange} />}
      
      <Card>
        <CardHeader>
          <CardTitle>
            {canManageAllCells ? `Lista de Células (${cells.length})` : `Minhas Células (${cells.length})`}
          </CardTitle>
          <CardDescription>
            Clique em uma célula para ver detalhes, estatísticas e controle de presença
          </CardDescription>
        </CardHeader>
        <CardContent>
          {cells.length === 0 ? (
            <div className="p-6 text-center">
              <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {canManageAllCells ? 'Nenhuma célula encontrada' : 'Você não possui células'}
              </h3>
              <p className="text-gray-600 mb-4">
                {canManageAllCells 
                  ? 'Comece criando sua primeira célula ou ajuste os filtros.'
                  : 'Entre em contato com o administrador para ser atribuído a uma célula.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cells.map((cell) => (
                <Card 
                  key={cell.id} 
                  className="border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-blue-300"
                  onClick={() => handleCellClick(cell)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2 mb-2">
                          <Home className="h-5 w-5 text-blue-600" />
                          {cell.name}
                        </CardTitle>
                        <Badge variant={cell.active ? "default" : "secondary"} className="mb-2">
                          {cell.active ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </div>
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        {canManageAllCells && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditCell(cell)}
                              title="Editar célula"
                            >
                              <Edit className="h-4 w-4 text-orange-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(cell.id, cell.name)}
                              disabled={deletingId === cell.id}
                              title="Excluir célula"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-start gap-2 text-gray-600">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{cell.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">
                          {getWeekDayName(cell.meeting_day)} às {formatTime(cell.meeting_time)}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-xs text-blue-600 font-medium">
                          👆 Clique para ver detalhes e controle de presença
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {editingCell && canManageAllCells && (
            <EditCellDialog
              cell={editingCell}
              isOpen={editDialogOpen}
              onClose={() => {
                setEditDialogOpen(false);
                setEditingCell(null);
              }}
              onCellUpdated={handleCellUpdated}
            />
          )}

          <CellModal
            cell={selectedCell}
            isOpen={cellModalOpen}
            onClose={() => {
              setCellModalOpen(false);
              setSelectedCell(null);
            }}
            onCellUpdated={handleCellUpdated}
          />
        </CardContent>
      </Card>
    </div>
  );
};
