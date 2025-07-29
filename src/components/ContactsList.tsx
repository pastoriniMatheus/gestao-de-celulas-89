
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Edit, Trash2, Plus, Phone, Calendar, MapPin, MessageSquare } from 'lucide-react';
import { useContacts } from '@/hooks/useContacts';
import { useCells } from '@/hooks/useCells';
import { useMinistries } from '@/hooks/useMinistries';
import { usePipelineStages } from '@/hooks/usePipelineStages';
import { useLeaderPermissions } from '@/hooks/useLeaderPermissions';
import { EditContactDialog } from './EditContactDialog';
import { ContactNotesDialog } from './ContactNotesDialog';
import { useToast } from '@/hooks/use-toast';

export const ContactsList = () => {
  const { contacts, loading, deleteContact } = useContacts();
  const { cells } = useCells();
  const { ministries } = useMinistries();
  const { stages } = usePipelineStages();
  const { filterContactsForLeader, canDeleteContacts, isAdmin } = useLeaderPermissions();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cellFilter, setCellFilter] = useState('all');
  const [deletingContactId, setDeletingContactId] = useState<string | null>(null);
  
  // Estados para os diálogos
  const [editingContact, setEditingContact] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [notesContact, setNotesContact] = useState<any>(null);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);

  // Filtrar contatos baseado nas permissões
  const filteredContacts = filterContactsForLeader(contacts)
    .filter(contact => {
      const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           contact.whatsapp?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           contact.neighborhood.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;
      const matchesCell = cellFilter === 'all' || contact.cell_id === cellFilter;
      
      return matchesSearch && matchesStatus && matchesCell;
    });

  const handleDeleteContact = async (contactId: string, contactName: string) => {
    if (!canDeleteContacts) {
      toast({
        title: "Erro",
        description: "Você não tem permissão para deletar contatos",
        variant: "destructive"
      });
      return;
    }

    if (!confirm(`Tem certeza que deseja excluir o contato "${contactName}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    setDeletingContactId(contactId);
    try {
      await deleteContact(contactId);
      toast({
        title: "Sucesso",
        description: "Contato deletado com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao deletar contato:', error);
      toast({
        title: "Erro",
        description: "Não foi possível deletar o contato",
        variant: "destructive"
      });
    } finally {
      setDeletingContactId(null);
    }
  };

  const handleEditContact = (contact: any) => {
    setEditingContact(contact);
    setEditDialogOpen(true);
  };

  const handleShowNotes = (contact: any) => {
    setNotesContact(contact);
    setNotesDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      member: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800'
    };
    
    const labels = {
      pending: 'Pendente',
      member: 'Membro',
      inactive: 'Inativo'
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || variants.pending}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getCellName = (cellId: string | null) => {
    if (!cellId) return 'Sem célula';
    const cell = cells.find(c => c.id === cellId);
    return cell?.name || 'Célula não encontrada';
  };

  const getMinistryName = (ministryId: string | null) => {
    if (!ministryId) return 'Sem ministério';
    const ministry = ministries.find(m => m.id === ministryId);
    return ministry?.name || 'Ministério não encontrado';
  };

  const getStageName = (stageId: string | null) => {
    if (!stageId) return 'Sem etapa';
    const stage = stages.find(s => s.id === stageId);
    return stage?.name || 'Etapa não encontrada';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não informado';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando contatos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-blue-600" />
            Lista de Discípulos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome, WhatsApp ou bairro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="member">Membro</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
            <Select value={cellFilter} onValueChange={setCellFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por célula" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as células</SelectItem>
                {cells.map(cell => (
                  <SelectItem key={cell.id} value={cell.id}>
                    {cell.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Bairro</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Célula</TableHead>
                  <TableHead>Pipeline</TableHead>
                  <TableHead>Idade</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {contact.founder && (
                          <Badge className="bg-purple-100 text-purple-800 text-xs">
                            Fundador
                          </Badge>
                        )}
                        {contact.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {contact.whatsapp && (
                        <a 
                          href={`https://wa.me/55${contact.whatsapp.replace(/\D/g, '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-800"
                        >
                          {contact.whatsapp}
                        </a>
                      )}
                    </TableCell>
                    <TableCell>{contact.neighborhood}</TableCell>
                    <TableCell>{getStatusBadge(contact.status)}</TableCell>
                    <TableCell>{getCellName(contact.cell_id)}</TableCell>
                    <TableCell>{getStageName(contact.pipeline_stage_id)}</TableCell>
                    <TableCell>
                      {contact.birth_date ? calculateAge(contact.birth_date) : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleShowNotes(contact)}
                          title="Ver anotações"
                        >
                          <MessageSquare className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditContact(contact)}
                          title="Editar contato"
                        >
                          <Edit className="h-4 w-4 text-orange-600" />
                        </Button>
                        {canDeleteContacts && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteContact(contact.id, contact.name)}
                            disabled={deletingContactId === contact.id}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Deletar contato"
                          >
                            {deletingContactId === contact.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredContacts.length === 0 && (
            <div className="text-center py-8">
              <Phone className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum contato encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' || cellFilter !== 'all' 
                  ? 'Tente ajustar os filtros para encontrar contatos.'
                  : 'Comece adicionando um novo contato.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogos */}
      {editingContact && (
        <EditContactDialog
          contact={editingContact}
          isOpen={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            setEditingContact(null);
          }}
        />
      )}

      {notesContact && (
        <ContactNotesDialog
          isOpen={notesDialogOpen}
          onOpenChange={setNotesDialogOpen}
          contactId={notesContact.id}
          contactName={notesContact.name}
          cellId={notesContact.cell_id || ''}
        />
      )}
    </div>
  );
};
