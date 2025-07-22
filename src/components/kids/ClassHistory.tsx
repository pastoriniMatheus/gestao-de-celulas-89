
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Users, BookOpen, Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function ClassHistory() {
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const { data: classRecords = [], isLoading } = useQuery({
    queryKey: ['class_records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('class_records')
        .select(`
          *,
          lesson:lessons(title)
        `)
        .order('worship_date', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: attendanceDetails = [] } = useQuery({
    queryKey: ['attendance_details', selectedRecord?.id],
    queryFn: async () => {
      if (!selectedRecord?.id) return [];
      
      const { data, error } = await supabase
        .from('child_attendance')
        .select(`
          *,
          child:children(name)
        `)
        .eq('class_record_id', selectedRecord.id)
        .eq('present', true);
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedRecord?.id
  });

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-purple-700">Histórico de Aulas</h3>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Turma</TableHead>
                <TableHead>Professora 1</TableHead>
                <TableHead>Professora 2</TableHead>
                <TableHead>Lição</TableHead>
                <TableHead>Presentes</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : classRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Nenhuma aula registrada
                  </TableCell>
                </TableRow>
              ) : (
                classRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(record.worship_date).toLocaleDateString('pt-BR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                        {record.class}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        {record.teacher_1 || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        {record.teacher_2 || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-gray-400" />
                        {record.lesson?.title || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="text-sm">
                          <span className="text-green-600 font-medium">{record.total_members || 0}</span>
                          <span className="text-gray-400 mx-1">/</span>
                          <span className="text-blue-600 font-medium">{record.total_visitors || 0}</span>
                        </div>
                        <div className="text-xs text-gray-500">M / V</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedRecord(record)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>
                              Detalhes da Aula - {record.class} ({new Date(record.worship_date).toLocaleDateString('pt-BR')})
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <Card className="p-4">
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-green-600">{record.total_members || 0}</div>
                                  <div className="text-sm text-gray-600">Membros</div>
                                </div>
                              </Card>
                              <Card className="p-4">
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-blue-600">{record.total_visitors || 0}</div>
                                  <div className="text-sm text-gray-600">Visitantes</div>
                                </div>
                              </Card>
                            </div>
                            
                            <div>
                              <h4 className="font-medium mb-2">Informações da Aula:</h4>
                              <div className="space-y-2 text-sm">
                                <p><strong>Professora 1:</strong> {record.teacher_1 || 'Não definida'}</p>
                                <p><strong>Professora 2:</strong> {record.teacher_2 || 'Não definida'}</p>
                                <p><strong>Lição:</strong> {record.lesson?.title || 'Não definida'}</p>
                              </div>
                            </div>
                            
                            {attendanceDetails.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-2">Crianças Presentes:</h4>
                                <div className="max-h-40 overflow-y-auto">
                                  <div className="grid grid-cols-2 gap-2">
                                    {attendanceDetails.map((attendance) => (
                                      <div key={attendance.id} className="flex items-center justify-between text-sm border-b pb-1">
                                        <span>{attendance.child?.name}</span>
                                        <span className={`px-2 py-1 rounded text-xs ${
                                          attendance.type === 'Membro' 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-blue-100 text-blue-800'
                                        }`}>
                                          {attendance.type}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
