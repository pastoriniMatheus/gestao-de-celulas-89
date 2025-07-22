
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { UserCheck, Users, Plus, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Cell {
  id: string;
  name: string;
  address: string;
}

interface Contact {
  id: string;
  name: string;
  whatsapp: string | null;
  cell_id: string;
}

interface Attendance {
  id: string;
  contact_id: string;
  present: boolean;
  visitor: boolean;
}

export default function CellAttendancePage() {
  const { cellId } = useParams();
  const [cell, setCell] = useState<Cell | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [isVisitorDialogOpen, setIsVisitorDialogOpen] = useState(false);

  useEffect(() => {
    if (cellId) {
      fetchCellData();
      fetchContacts();
    }
  }, [cellId]);

  const fetchCellData = async () => {
    try {
      const { data: cellData, error: cellError } = await supabase
        .from('cells')
        .select('id, name, address')
        .eq('id', cellId)
        .single();

      if (cellError) throw cellError;
      setCell(cellData);
    } catch (error: any) {
      console.error('Erro ao buscar dados da célula:', error);
      toast({
        title: "Erro",
        description: "Célula não encontrada",
        variant: "destructive"
      });
    }
  };

  const fetchContacts = async () => {
    try {
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('id, name, whatsapp, cell_id')
        .eq('cell_id', cellId);

      if (contactsError) throw contactsError;
      setContacts(contactsData || []);

      // Buscar presenças de hoje
      const today = new Date().toISOString().split('T')[0];
      const { data: attendancesData, error: attendancesError } = await supabase
        .from('attendances')
        .select('id, contact_id, present, visitor')
        .eq('cell_id', cellId)
        .eq('attendance_date', today);

      if (attendancesError) throw attendancesError;
      setAttendances(attendancesData || []);
    } catch (error: any) {
      console.error('Erro ao buscar contatos:', error);
    }
  };

  const toggleAttendance = async (contactId: string, isPresent: boolean) => {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const existingAttendance = attendances.find(a => a.contact_id === contactId);
      
      if (existingAttendance) {
        const { error } = await supabase
          .from('attendances')
          .update({ present: isPresent })
          .eq('id', existingAttendance.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('attendances')
          .insert({
            contact_id: contactId,
            cell_id: cellId,
            attendance_date: today,
            present: isPresent,
            visitor: false
          });

        if (error) throw error;
      }

      fetchContacts();
      toast({
        title: "Sucesso",
        description: `Presença ${isPresent ? 'marcada' : 'desmarcada'} com sucesso!`
      });
    } catch (error: any) {
      console.error('Erro ao marcar presença:', error);
      toast({
        title: "Erro",
        description: "Erro ao marcar presença",
        variant: "destructive"
      });
    }
  };

  const addVisitor = async () => {
    if (!visitorName.trim()) {
      toast({
        title: "Erro",
        description: "Nome do visitante é obrigatório",
        variant: "destructive"
      });
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    
    try {
      setLoading(true);
      
      // Criar contato visitante
      const { data: visitorContact, error: contactError } = await supabase
        .from('contacts')
        .insert({
          name: visitorName,
          whatsapp: visitorPhone || null,
          cell_id: cellId,
          neighborhood: 'Visitante',
          city_id: null,
          status: 'visitor'
        })
        .select()
        .single();

      if (contactError) throw contactError;

      // Marcar presença do visitante
      const { error: attendanceError } = await supabase
        .from('attendances')
        .insert({
          contact_id: visitorContact.id,
          cell_id: cellId,
          attendance_date: today,
          present: true,
          visitor: true
        });

      if (attendanceError) throw attendanceError;

      toast({
        title: "Sucesso",
        description: "Visitante adicionado com sucesso!"
      });

      setVisitorName('');
      setVisitorPhone('');
      setIsVisitorDialogOpen(false);
      fetchContacts();
    } catch (error: any) {
      console.error('Erro ao adicionar visitante:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar visitante",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!cell) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <UserCheck className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Lista de Presença
            </CardTitle>
            <CardDescription className="text-base">
              <div className="flex items-center justify-center gap-2 mt-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="font-semibold">{cell.name}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{cell.address}</p>
              <Badge variant="outline" className="mt-2">
                {new Date().toLocaleDateString('pt-BR')}
              </Badge>
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Membros da Célula</h3>
              <Dialog open={isVisitorDialogOpen} onOpenChange={setIsVisitorDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Visitante
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Visitante</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nome *</label>
                      <Input
                        value={visitorName}
                        onChange={(e) => setVisitorName(e.target.value)}
                        placeholder="Nome do visitante"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">WhatsApp (opcional)</label>
                      <Input
                        value={visitorPhone}
                        onChange={(e) => setVisitorPhone(e.target.value)}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    <Button 
                      onClick={addVisitor} 
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? 'Adicionando...' : 'Adicionar Visitante'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>Presente</TableHead>
                    <TableHead>Tipo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map((contact) => {
                    const attendance = attendances.find(a => a.contact_id === contact.id);
                    const isPresent = attendance?.present || false;
                    const isVisitor = attendance?.visitor || false;
                    
                    return (
                      <TableRow key={contact.id}>
                        <TableCell className="font-medium">{contact.name}</TableCell>
                        <TableCell>{contact.whatsapp || '-'}</TableCell>
                        <TableCell>
                          <Checkbox
                            checked={isPresent}
                            onCheckedChange={(checked) => toggleAttendance(contact.id, !!checked)}
                          />
                        </TableCell>
                        <TableCell>
                          <Badge variant={isVisitor ? "secondary" : "default"}>
                            {isVisitor ? 'Visitante' : 'Membro'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {contacts.length === 0 && (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum membro encontrado</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Os membros da célula aparecerão aqui quando forem cadastrados.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
