
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, MapPin, Phone, Calendar, UserPlus } from 'lucide-react';
import { useContacts } from '@/hooks/useContacts';
import { useCells } from '@/hooks/useCells';
import { toast } from '@/hooks/use-toast';

export const PendingFormContacts = () => {
  const { contacts, updateContact } = useContacts();
  const { cells, loading: cellsLoading } = useCells();
  const [updating, setUpdating] = useState<string | null>(null);

  // Filtrar contatos pendentes que vieram do formulário (com attendance_code)
  const pendingFormContacts = contacts.filter(contact => 
    contact.status === 'pending' && contact.attendance_code
  );

  const handleAssignToCell = async (contactId: string, cellId: string) => {
    if (!cellId || cellId === 'none') return;

    setUpdating(contactId);
    try {
      console.log('PendingFormContacts: Atribuindo contato à célula:', { contactId, cellId });
      
      // Explicitamente definir que será membro ao atribuir célula
      const updateData = {
        cell_id: cellId,
        status: 'member' as const // Garantir que o status seja alterado para member
      };

      console.log('P endingFormContacts: Dados de atualização:', updateData);
      
      await updateContact(contactId, updateData);

      toast({
        title: "Sucesso",
        description: "Contato atribuído à célula e transformado em membro!"
      });
    } catch (error: any) {
      console.error('PendingFormContacts: Erro ao atribuir célula:', error);
      toast({
        title: "Erro",
        description: `Erro ao atribuir célula: ${error?.message || 'Tente novamente'}`,
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

  const formatBirthDate = (birthDate: string | null) => {
    if (!birthDate) return null;
    return new Date(birthDate).toLocaleDateString('pt-BR');
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

  const activeCells = cells.filter(cell => cell.active);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Contatos Pendentes do Formulário
          </CardTitle>
          <CardDescription>
            Contatos vindos do formulário de cadastro aguardando atribuição de célula ({pendingFormContacts.length} pendentes)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingFormContacts.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                Nenhum contato do formulário pendente no momento.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingFormContacts.map((contact) => (
                <Card key={contact.id} className="border-blue-200 bg-blue-50">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{contact.name}</h3>
                          <Badge variant="default" className="bg-blue-100 text-blue-800">
                            Formulário
                          </Badge>
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
                          {contact.attendance_code && (
                            <span className="text-xs text-blue-600 font-semibold">
                              Código: {contact.attendance_code}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 min-w-[220px]">
                        <label className="text-sm font-medium">
                          Atribuir à Célula:
                        </label>
                        <div className="flex gap-2">
                          <Select
                            onValueChange={(value) => handleAssignToCell(contact.id, value)}
                            disabled={updating === contact.id || cellsLoading}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Selecione uma célula" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Nenhuma</SelectItem>
                              {activeCells.map((cell) => (
                                <SelectItem key={cell.id} value={cell.id}>
                                  <div className="flex flex-col">
                                    <span className="font-semibold">{cell.name}</span>
                                    <span className="text-xs text-gray-500">{cell.address}</span>
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
                            Nenhuma célula ativa cadastrada
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
