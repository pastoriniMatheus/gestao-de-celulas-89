
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { User, Phone, MapPin, Search, Filter } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { usePipelineStages } from '@/hooks/usePipelineStages';
import { useLeaderContacts } from '@/hooks/useLeaderContacts';
import { useContacts } from '@/hooks/useContacts';
import { useCells } from '@/hooks/useCells';
import { EditContactDialog } from './EditContactDialog';
import { useLeaderPermissions } from '@/hooks/useLeaderPermissions';

export const KanbanPipeline = () => {
  const { stages, loading: stagesLoading } = usePipelineStages();
  const { isAdmin } = useLeaderPermissions();
  
  // Usar hook apropriado baseado nas permissões
  const { contacts: allContacts, loading: allContactsLoading, updateContact } = isAdmin ? useContacts() : { contacts: [], loading: false, updateContact: () => {} };
  const { contacts: leaderContacts, loading: leaderContactsLoading } = useLeaderContacts();
  
  const contacts = isAdmin ? allContacts : leaderContacts;
  const contactsLoading = isAdmin ? allContactsLoading : leaderContactsLoading;
  
  const { cells } = useCells();
  
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCellFilter, setSelectedCellFilter] = useState<string>('all');

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (contact.whatsapp && contact.whatsapp.includes(searchTerm));
    
    const matchesCell = selectedCellFilter === 'all' || 
                       (selectedCellFilter === 'no-cell' && !contact.cell_id) ||
                       contact.cell_id === selectedCellFilter;
    
    return matchesSearch && matchesCell && contact.pipeline_stage_id;
  });

  const handleDragEnd = async (result: any) => {
    if (!result.destination || !isAdmin) return;

    const { source, destination, draggableId } = result;
    
    // Se não mudou de estágio, não fazer nada
    if (source.droppableId === destination.droppableId) return;

    try {
      await updateContact(draggableId, { pipeline_stage_id: destination.droppableId });
    } catch (error) {
      console.error('Erro ao mover contato:', error);
    }
  };

  const getCellName = (cellId: string) => {
    const cell = cells.find(c => c.id === cellId);
    return cell ? cell.name : 'Sem célula';
  };

  const handleContactDoubleClick = (contact: any) => {
    console.log('Abrindo edição do contato:', contact);
    setSelectedContact(contact);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    console.log('Fechando diálogo de edição');
    setEditDialogOpen(false);
    setSelectedContact(null);
  };

  if (stagesLoading || contactsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando pipeline - Sistema Matheus Pastorini...</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Filtros fixos - compactos */}
      <div className="flex-shrink-0 p-4 border-b bg-gray-50">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-medium">
            {isAdmin ? 'Filtros do Pipeline' : 'Meus Discípulos - Filtros'}
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Buscar discípulo</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
              <Input
                placeholder="Nome ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Filtrar por célula</label>
            <Select value={selectedCellFilter} onValueChange={setSelectedCellFilter}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Todas as células" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as células</SelectItem>
                <SelectItem value="no-cell">Sem célula</SelectItem>
                {cells.filter(cell => cell.active).map((cell) => (
                  <SelectItem key={cell.id} value={cell.id}>
                    {cell.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Pipeline - Scroll horizontal apenas, sem scroll vertical na página */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="h-full overflow-x-auto overflow-y-hidden bg-gray-50">
            <div 
              className="flex gap-4 h-full p-4" 
              style={{ 
                minWidth: `${stages.length * 320}px`,
                maxHeight: '100%'
              }}
            >
              {stages.map((stage) => {
                const stageContacts = filteredContacts.filter(
                  contact => contact.pipeline_stage_id === stage.id
                );

                return (
                  <div key={stage.id} className="w-80 flex-shrink-0 h-full">
                    <Card className="h-full flex flex-col shadow-sm">
                      <CardHeader 
                        className="pb-2 flex-shrink-0 border-b-2"
                        style={{ 
                          backgroundColor: `${stage.color}10`, 
                          borderBottomColor: stage.color 
                        }}
                      >
                        <CardTitle className="flex items-center justify-between text-sm">
                          <span style={{ color: stage.color }} className="font-semibold">
                            {stage.name}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {stageContacts.length}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      
                      <Droppable droppableId={stage.id} isDropDisabled={!isAdmin}>
                        {(provided, snapshot) => (
                          <CardContent 
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={`flex-1 min-h-0 p-2 overflow-y-auto ${
                              snapshot.isDraggingOver ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="space-y-2">
                              {stageContacts.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                  <User className="h-6 w-6 mx-auto mb-2 opacity-50" />
                                  <p className="text-xs">Nenhum discípulo</p>
                                </div>
                              ) : (
                                stageContacts.map((contact, index) => (
                                  <Draggable
                                    key={contact.id}
                                    draggableId={contact.id}
                                    index={index}
                                    isDragDisabled={!isAdmin}
                                  >
                                    {(provided, snapshot) => (
                                      <Card 
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={`border-l-4 transition-all duration-200 ${
                                          snapshot.isDragging ? 'shadow-lg rotate-1 scale-105' : 'hover:shadow-md'
                                        } ${!isAdmin ? 'cursor-pointer' : 'cursor-grab'} active:cursor-grabbing`}
                                        style={{ 
                                          borderLeftColor: stage.color,
                                          ...provided.draggableProps.style
                                        }}
                                        onDoubleClick={() => handleContactDoubleClick(contact)}
                                      >
                                        <CardContent className="p-2">
                                          <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                              <h4 className="font-medium text-xs truncate">
                                                {contact.name}
                                              </h4>
                                              <Badge 
                                                variant={contact.status === 'member' ? 'default' : 
                                                       contact.status === 'visitor' ? 'secondary' : 'outline'}
                                                className="text-[10px] px-1 py-0"
                                              >
                                                {contact.status === 'member' ? 'Membro' :
                                                 contact.status === 'visitor' ? 'Visitante' : 'Pendente'}
                                              </Badge>
                                            </div>
                                            
                                            {contact.whatsapp && (
                                              <div className="flex items-center gap-1 text-[10px] text-gray-600">
                                                <Phone className="h-2 w-2" />
                                                <span className="truncate">{contact.whatsapp}</span>
                                              </div>
                                            )}
                                            
                                            <div className="flex items-center gap-1 text-[10px] text-gray-600">
                                              <MapPin className="h-2 w-2" />
                                              <span className="truncate">{contact.neighborhood}</span>
                                            </div>

                                            {contact.cell_id && (
                                              <div className="text-[10px] text-blue-600 font-medium truncate">
                                                {getCellName(contact.cell_id)}
                                              </div>
                                            )}
                                            
                                            <div className="flex gap-1 mt-1">
                                              {contact.encounter_with_god && (
                                                <Badge variant="outline" className="text-[9px] px-1 py-0">EcD</Badge>
                                              )}
                                              {contact.baptized && (
                                                <Badge variant="outline" className="text-[9px] px-1 py-0">Batizado</Badge>
                                              )}
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    )}
                                  </Draggable>
                                ))
                              )}
                            </div>
                            {provided.placeholder}
                          </CardContent>
                        )}
                      </Droppable>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </DragDropContext>
      </div>

      {/* Dialog de Edição */}
      {selectedContact && (
        <EditContactDialog
          contact={selectedContact}
          isOpen={editDialogOpen}
          onClose={handleCloseEditDialog}
        />
      )}
    </div>
  );
};
