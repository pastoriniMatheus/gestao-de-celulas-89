
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, MapPin, Phone, User, Home, Calendar } from 'lucide-react';
import { useContacts } from '@/hooks/useContacts';
import { useCells } from '@/hooks/useCells';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { toast } from '@/hooks/use-toast';
import { useEffect, useMemo, useState as useReactState } from 'react';

export const PendingContactsManager = () => {
  const { contacts, updateContact } = useContacts();
  const { cells, loading: cellsLoading } = useCells();
  const permissions = useUserPermissions();
  const [updating, setUpdating] = useState<string | null>(null);

  // Filtrar contatos pendentes (sem célula atribuída)
  const pendingContacts = contacts.filter(contact => 
    contact.status === 'pending' && !contact.cell_id
  );

  // Filtrar apenas células ativas (para líderes, apenas suas células)
  const activeCells = cells.filter(cell => cell.active);

  const handleAssignCell = async (contactId: string, cellId: string) => {
    if (!cellId || cellId === 'no-cell') return;

    // Se for líder, verificar se a célula pertence a ele
    if (permissions.isLeader && !permissions.isAdmin) {
      const cell = cells.find(c => c.id === cellId);
      if (!cell || cell.leader_id !== permissions.userProfile?.id) {
        toast({
          title: "Erro",
          description: "Você só pode atribuir contatos às suas próprias células",
          variant: "destructive"
        });
        return;
      }
    }

    setUpdating(contactId);
    try {
      console.log('PendingContactsManager: Atribuindo contato à célula:', { contactId, cellId });
      
      await updateContact(contactId, { 
        cell_id: cellId,
        status: 'member'
      });

      console.log('PendingContactsManager: Contato atribuído com sucesso');
      toast({
        title: "Sucesso",
        description: "Contato atribuído à célula com sucesso!"
      });
    } catch (error: any) {
      console.error('PendingContactsManager: Erro inesperado:', error);
      toast({
        title: "Erro",
        description: `Erro inesperado: ${error?.message || 'Tente novamente'}`,
        variant: "destructive"
      });
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatBirthDate = (birthDate: string) => {
    if (!birthDate) return null;
    return new Date(birthDate).toLocaleDateString('pt-BR');
  };

  const calculateAge = (birthDate: string) => {
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-orange-600" />
            Contatos Pendentes
          </CardTitle>
          <CardDescription>
            {permissions.isLeader && !permissions.isAdmin 
              ? `Contatos pendentes que podem ser atribuídos às suas células (${pendingContacts.length} pendentes)`
              : `Contatos aguardando atribuição de célula (${pendingContacts.length} pendentes)`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingContacts.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {permissions.isLeader && !permissions.isAdmin 
                  ? 'Nenhum contato pendente disponível para suas células no momento.'
                  : 'Nenhum contato pendente no momento.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingContacts.map((contact) => (
                <Card key={contact.id} className="border-orange-200 bg-orange-50">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{contact.name}</h3>
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                            Pendente
                          </Badge>
                        </div>
                        <div className="flex flex-col gap-1 text-sm text-gray-600">
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
                          {contact.birth_date && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {formatBirthDate(contact.birth_date)}
                                {calculateAge(contact.birth_date) && ` (${calculateAge(contact.birth_date)} anos)`}
                              </span>
                            </div>
                          )}
                          <span className="text-xs text-gray-500">
                            Cadastrado em: {formatDate(contact.created_at)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 min-w-[220px]">
                        <label className="text-sm font-medium">
                          {permissions.isLeader && !permissions.isAdmin 
                            ? 'Atribuir à Minha Célula:' 
                            : 'Atribuir à Célula:'
                          }
                        </label>
                        <div className="flex gap-2">
                          <Select
                            onValueChange={(value) => handleAssignCell(contact.id, value)}
                            disabled={updating === contact.id || cellsLoading}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Selecione uma célula" />
                            </SelectTrigger>
                            <SelectContent className="z-[50] bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
                              <SelectItem value="none">Nenhuma</SelectItem>
                              {activeCells.map((cell) => (
                                <SelectItem key={cell.id} value={cell.id} className="py-2">
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-sm flex gap-1 items-center">
                                      <Home className="h-3 w-3 mr-1 text-blue-400" />
                                      {cell.name}
                                    </span>
                                    <span className="text-xs text-gray-500 ml-5">{cell.address}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {updating === contact.id && (
                          <div className="flex items-center gap-2 text-xs text-blue-600">
                            <div className="animate-spin rounded-full h-3 w-3 border border-blue-600 border-t-transparent"></div>
                            Atribuindo...
                          </div>
                        )}
                        {activeCells.length === 0 && (
                          <p className="text-xs text-red-600">
                            {permissions.isLeader && !permissions.isAdmin 
                              ? 'Você não possui células ativas cadastradas'
                              : 'Nenhuma célula ativa cadastrada'
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
