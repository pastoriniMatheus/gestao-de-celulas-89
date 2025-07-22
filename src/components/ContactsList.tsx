import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Phone, MapPin, Home, Search, Filter, Trash2, Edit, Calendar } from 'lucide-react';
import { useContacts } from '@/hooks/useContacts';
import { useCells } from '@/hooks/useCells';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { EditContactDialog } from './EditContactDialog';

export const ContactsList = () => {
  const { contacts, loading, deleteContact, updateContact, fetchContacts } = useContacts();
  const { cells } = useCells();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCell, setSelectedCell] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Estado para controle de diálogo de exclusão
  const [contactToDelete, setContactToDelete] = useState<null | { id: string; name: string }>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Novo estado para o contato sendo editado
  const [contactToEdit, setContactToEdit] = useState(null);

  // Filtrar contatos
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (contact.whatsapp && contact.whatsapp.includes(searchTerm));
    
    const matchesCell = selectedCell === 'all' || 
                       (selectedCell === 'no-cell' && !contact.cell_id) ||
                       contact.cell_id === selectedCell;
    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;
    
    return matchesSearch && matchesCell && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatBirthDate = (birthDate: string) => {
    if (!birthDate) return null;
    // Fix: Create date without timezone issues by using local date
    const dateParts = birthDate.split('-');
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
    const day = parseInt(dateParts[2]);
    const localDate = new Date(year, month, day);
    return localDate.toLocaleDateString('pt-BR');
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null;
    // Fix: Create date without timezone issues
    const dateParts = birthDate.split('-');
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
    const day = parseInt(dateParts[2]);
    const birth = new Date(year, month, day);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Pendente</Badge>;
      case 'assigned':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Atribuído</Badge>;
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'visitor':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Visitante</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCellName = (cellId: string | null) => {
    if (!cellId) return 'Sem célula';
    const cell = cells.find(c => c.id === cellId);
    return cell ? cell.name : 'Célula não encontrada';
  };

  // Função para exclusão
  const handleDelete = async () => {
    if (!contactToDelete) return;
    setIsDeleting(true);
    try {
      await deleteContact(contactToDelete.id);
      setContactToDelete(null);
    } catch (e) {
      // Erro já gerenciado pelo hook useContacts
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando contatos...</span>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          Lista de Contatos
        </CardTitle>
        <CardDescription>
          Visualize e gerencie todos os contatos do sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nome, bairro ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCell} onValueChange={setSelectedCell}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por célula" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as células</SelectItem>
              <SelectItem value="no-cell">Sem célula</SelectItem>
              {cells.map((cell) => (
                <SelectItem key={cell.id} value={cell.id}>
                  {cell.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="assigned">Atribuído</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="visitor">Visitante</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Filter className="h-4 w-4" />
            <span>{filteredContacts.length} contatos</span>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <p className="text-sm text-blue-800">Total</p>
            <p className="text-xl font-bold text-blue-600">{contacts.length}</p>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg text-center">
            <p className="text-sm text-orange-800">Pendentes</p>
            <p className="text-xl font-bold text-orange-600">
              {contacts.filter(c => c.status === 'pending').length}
            </p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <p className="text-sm text-green-800">Ativos</p>
            <p className="text-xl font-bold text-green-600">
              {contacts.filter(c => c.status === 'active').length}
            </p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg text-center">
            <p className="text-sm text-purple-800">Visitantes</p>
            <p className="text-xl font-bold text-purple-600">
              {contacts.filter(c => c.status === 'visitor').length}
            </p>
          </div>
        </div>

        {/* Lista de Contatos */}
        {filteredContacts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm || selectedCell !== 'all' || statusFilter !== 'all' 
                  ? 'Nenhum contato encontrado com os filtros aplicados.' 
                  : 'Nenhum contato cadastrado ainda.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContacts.map((contact) => (
              <Card key={contact.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold truncate">{contact.name}</h3>
                      <div className="flex gap-2 items-center">
                        {getStatusBadge(contact.status)}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-blue-500 hover:bg-blue-100"
                          title="Editar contato"
                          aria-label="Editar contato"
                          onClick={() => setContactToEdit(contact)}
                        >
                          <Edit />
                        </Button>
                        {/* Botão de Deletar */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:bg-red-100"
                              title="Deletar contato"
                              aria-label="Deletar contato"
                              onClick={() => setContactToDelete({ id: contact.id, name: contact.name })}
                            >
                              <Trash2 />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogTitle>Excluir contato</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o contato <span className="font-bold">{contact.name}</span>?
                              Esta ação não poderá ser desfeita.
                            </AlertDialogDescription>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setContactToDelete(null)}>
                                Cancelar
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDelete}
                                disabled={isDeleting}
                              >
                                {isDeleting ? 'Excluindo...' : 'Excluir'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      {contact.attendance_code && (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-gray-700">Código:</span>
                          <span className="tracking-wider">{contact.attendance_code}</span>
                        </div>
                      )}
                      {contact.whatsapp && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{contact.whatsapp}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{contact.neighborhood}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        <span>{getCellName(contact.cell_id)}</span>
                      </div>

                      {contact.birth_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatBirthDate(contact.birth_date)} 
                            {calculateAge(contact.birth_date) && ` (${calculateAge(contact.birth_date)} anos)`}
                          </span>
                        </div>
                      )}

                      <div className="text-xs text-gray-500">
                        Cadastrado: {formatDate(contact.created_at)}
                      </div>
                      {contact.encounter_with_god && (
                        <div className="text-xs text-green-700 font-semibold">Já fez Encontro com Deus</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {/* Confirmação de exclusão centralizada (fora do map) para garantir fechar corretamente */}
        <AlertDialog open={!!contactToDelete} onOpenChange={(open) => { if (!open) setContactToDelete(null); }}>
          <AlertDialogContent>
            <AlertDialogTitle>Excluir contato</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o contato{' '}
              <span className="font-bold">{contactToDelete?.name}</span>?
              Esta ação não poderá ser desfeita.
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setContactToDelete(null)}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dialog de editar */}
        {contactToEdit && (
          <EditContactDialog
            contact={contactToEdit}
            isOpen={!!contactToEdit}
            onClose={() => setContactToEdit(null)}
          />
        )}
      </CardContent>
    </Card>
  );
};
