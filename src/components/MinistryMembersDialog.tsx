
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { UserPlus, UserMinus, Search } from 'lucide-react';
import { useContacts } from '@/hooks/useContacts';
import { useMinistries } from '@/hooks/useMinistries';
import { toast } from 'sonner';

interface MinistryMembersDialogProps {
  ministry: any;
  isOpen: boolean;
  onClose: () => void;
}

export const MinistryMembersDialog = ({ ministry, isOpen, onClose }: MinistryMembersDialogProps) => {
  const { contacts } = useContacts();
  const { addMemberToMinistry, removeMemberFromMinistry, getMinistryMembers } = useMinistries();
  const [ministryMembers, setMinistryMembers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);

  // Filtrar apenas membros de células
  const cellMembers = contacts.filter(contact => 
    contact.cell_id && contact.status === 'member'
  );

  // Filtrar contatos disponíveis (que não estão no ministério)
  const availableContacts = cellMembers.filter(contact => 
    !ministryMembers.some(member => member.contact?.id === contact.id) &&
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Função para buscar membros do ministério - otimizada para evitar loops
  const fetchMinistryMembers = async () => {
    if (!ministry?.id || !isOpen) return;
    
    setMembersLoading(true);
    try {
      console.log('Buscando membros do ministério:', ministry.id);
      const members = await getMinistryMembers(ministry.id);
      console.log('Membros encontrados:', members);
      setMinistryMembers(members);
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
      toast.error('Erro ao carregar membros do ministério');
    } finally {
      setMembersLoading(false);
    }
  };

  useEffect(() => {
    // Resetar estado quando o diálogo abrir/fechar
    if (isOpen && ministry) {
      setSearchTerm('');
      setMinistryMembers([]);
      fetchMinistryMembers();
    } else {
      setMinistryMembers([]);
      setSearchTerm('');
    }
  }, [ministry?.id, isOpen]);

  const handleAddMember = async (contactId: string) => {
    if (loading) return;
    
    setLoading(true);
    try {
      console.log('Adicionando membro ao ministério:', { ministryId: ministry.id, contactId });
      await addMemberToMinistry(ministry.id, contactId);
      // Recarregar membros após adicionar
      await fetchMinistryMembers();
      toast.success('Membro adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar membro:', error);
      toast.error('Erro ao adicionar membro');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (contactId: string) => {
    if (loading) return;
    
    setLoading(true);
    try {
      console.log('Removendo membro do ministério:', { ministryId: ministry.id, contactId });
      await removeMemberFromMinistry(ministry.id, contactId);
      // Recarregar membros após remover
      await fetchMinistryMembers();
      toast.success('Membro removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover membro:', error);
      toast.error('Erro ao remover membro');
    } finally {
      setLoading(false);
    }
  };

  if (!ministry) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Membros - {ministry.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Membros Atuais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Membros Atuais ({ministryMembers.length})
            </h3>
            
            {membersLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2">Carregando membros...</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {ministryMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <span className="font-medium">{member.contact?.name || 'Nome não encontrado'}</span>
                      {member.contact?.whatsapp && (
                        <p className="text-sm text-gray-600">{member.contact.whatsapp}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveMember(member.contact?.id)}
                      disabled={loading}
                    >
                      <UserMinus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {ministryMembers.length === 0 && !membersLoading && (
                  <p className="text-gray-500 text-center py-4">Nenhum membro cadastrado</p>
                )}
              </div>
            )}
          </div>

          {/* Adicionar Membros */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Adicionar Membros</h3>
            
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Buscar contatos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableContacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <span className="font-medium">{contact.name}</span>
                    {contact.whatsapp && (
                      <p className="text-sm text-gray-600">{contact.whatsapp}</p>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      Membro de Célula
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAddMember(contact.id)}
                    disabled={loading}
                  >
                    <UserPlus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {availableContacts.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  {searchTerm ? 'Nenhum contato encontrado' : 'Todos os membros disponíveis já estão no ministério'}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
