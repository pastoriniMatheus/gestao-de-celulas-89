import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Users, BookOpen, Save } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function ClassRecord() {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [attendance, setAttendance] = useState<{[key: string]: { present: boolean, type: string }}>({});

  const queryClient = useQueryClient();

  // Buscar escala do dia selecionado
  const { data: schedule } = useQuery({
    queryKey: ['schedule', selectedDate, selectedClass],
    queryFn: async () => {
      if (!selectedDate || !selectedClass) return null;
      
      const { data, error } = await supabase
        .from('teacher_schedules')
        .select(`
          *,
          lesson:lessons(title)
        `)
        .eq('worship_date', selectedDate)
        .eq('class', selectedClass)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!selectedDate && !!selectedClass
  });

  // Buscar crianças da turma selecionada
  const { data: children = [] } = useQuery({
    queryKey: ['children-by-class', selectedClass],
    queryFn: async () => {
      if (!selectedClass) return [];
      
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('class', selectedClass)
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedClass
  });

  const saveClassRecordMutation = useMutation({
    mutationFn: async (recordData: any) => {
      // Primeiro, criar o registro da aula
      const { data: classRecord, error: classError } = await supabase
        .from('class_records')
        .insert([{
          worship_date: selectedDate,
          class: selectedClass,
          lesson_id: schedule?.lesson_id,
          teacher_1: schedule?.teacher_1,
          teacher_2: schedule?.teacher_2,
          total_members: recordData.totalMembers,
          total_visitors: recordData.totalVisitors
        }])
        .select()
        .single();
      
      if (classError) throw classError;

      // Depois, inserir as presenças individuais
      const attendanceRecords = Object.entries(attendance)
        .filter(([_, data]) => data.present)
        .map(([childId, data]) => ({
          child_id: childId,
          class_record_id: classRecord.id,
          present: true,
          type: data.type
        }));

      if (attendanceRecords.length > 0) {
        const { error: attendanceError } = await supabase
          .from('child_attendance')
          .insert(attendanceRecords);
        
        if (attendanceError) throw attendanceError;
      }

      return classRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class_records'] });
      toast.success('Aula registrada com sucesso!');
      setAttendance({});
    },
    onError: (error) => {
      toast.error('Erro ao registrar aula: ' + error.message);
    }
  });

  const handleAttendanceChange = (childId: string, field: 'present' | 'type', value: boolean | string) => {
    setAttendance(prev => ({
      ...prev,
      [childId]: {
        ...prev[childId],
        [field]: value,
        type: prev[childId]?.type || 'Membro'
      }
    }));
  };

  const handleSaveClass = () => {
    if (!selectedDate || !selectedClass) {
      toast.error('Selecione data e turma');
      return;
    }

    const presentChildren = Object.values(attendance).filter(a => a.present);
    const totalMembers = presentChildren.filter(a => a.type === 'Membro').length;
    const totalVisitors = presentChildren.filter(a => a.type === 'Visitante').length;

    saveClassRecordMutation.mutate({
      totalMembers,
      totalVisitors
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <h3 className="text-base sm:text-lg font-semibold text-orange-700">Registro de Aula</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-2">
          <Label htmlFor="date" className="text-sm">Data do Culto</Label>
          <Input
            id="date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="class" className="text-sm">Turma</Label>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione a turma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Berçário">Berçário</SelectItem>
              <SelectItem value="Jardim">Jardim</SelectItem>
              <SelectItem value="Pré-Adolescentes">Pré-Adolescentes</SelectItem>
              <SelectItem value="Adolescentes">Adolescentes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {schedule && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-700 text-sm sm:text-base">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              Informações da Escala
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <Users className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Professora 1:</span>
                <span className="ml-1">{schedule.teacher_1 || 'Não definida'}</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Users className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Professora 2:</span>
                <span className="ml-1">{schedule.teacher_2 || 'Não definida'}</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <BookOpen className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Lição:</span>
                <span className="ml-1">{schedule.lesson?.title || 'Não definida'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedDate && selectedClass && children.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              Lista de Presença - {selectedClass}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {children.map((child) => (
                <div key={child.id} className="flex items-center justify-between border-b pb-3 gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Checkbox
                      checked={attendance[child.id]?.present || false}
                      onCheckedChange={(checked) => 
                        handleAttendanceChange(child.id, 'present', checked as boolean)
                      }
                      className="flex-shrink-0"
                    />
                    <span className="font-medium text-sm truncate">{child.name}</span>
                  </div>
                  
                  {attendance[child.id]?.present && (
                    <Select
                      value={attendance[child.id]?.type || 'Membro'}
                      onValueChange={(value) => handleAttendanceChange(child.id, 'type', value)}
                    >
                      <SelectTrigger className="w-24 sm:w-32 flex-shrink-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Membro">Membro</SelectItem>
                        <SelectItem value="Visitante">Visitante</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center bg-green-50 p-3 rounded-lg">
                  <div className="text-xl sm:text-2xl font-bold text-green-600">
                    {Object.values(attendance).filter(a => a.present && a.type === 'Membro').length}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">Membros Presentes</div>
                </div>
                <div className="text-center bg-blue-50 p-3 rounded-lg">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">
                    {Object.values(attendance).filter(a => a.present && a.type === 'Visitante').length}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">Visitantes Presentes</div>
                </div>
              </div>
              
              <Button 
                onClick={handleSaveClass} 
                className="w-full bg-orange-600 hover:bg-orange-700 text-sm sm:text-base py-2 sm:py-3"
                disabled={saveClassRecordMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar Aula
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
