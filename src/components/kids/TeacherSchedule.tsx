import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Plus, Edit2, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useMinistries } from '@/hooks/useMinistries';

export function TeacherSchedule() {
  const queryClient = useQueryClient();
  const { ministries } = useMinistries();
  const [formData, setFormData] = useState({
    worship_date: '',
    class: '',
    teacher_1: '',
    teacher_2: '',
    lesson_id: '',
    observations: ''
  });

  // Buscar lições disponíveis
  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .order('title');
      if (error) throw error;
      return data;
    }
  });

  // Buscar escalas de professoras
  const { data: schedules = [] } = useQuery({
    queryKey: ['teacher-schedules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teacher_schedules')
        .select(`
          *,
          lesson:lessons(*) 
        `)
        .order('worship_date', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Criar nova escala
  const createScheduleMutation = useMutation({
    mutationFn: async (scheduleData: any) => {
      const { data, error } = await supabase
        .from('teacher_schedules')
        .insert([scheduleData])
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Escala de professoras criada com sucesso!');
      setFormData({
        worship_date: '',
        class: '',
        teacher_1: '',
        teacher_2: '',
        lesson_id: '',
        observations: ''
      });
      queryClient.invalidateQueries({ queryKey: ['teacher-schedules'] });
    },
    onError: (error) => {
      toast.error('Erro ao criar escala: ' + error.message);
    }
  });

  // Deletar escala
  const deleteScheduleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('teacher_schedules')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Escala removida com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['teacher-schedules'] });
    },
    onError: (error) => {
      toast.error('Erro ao remover escala: ' + error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.worship_date || !formData.class || !formData.teacher_1) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    createScheduleMutation.mutate(formData);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover esta escala?')) {
      deleteScheduleMutation.mutate(id);
    }
  };

  // Obter membros APENAS do ministério Kids & Jovens
  const getKidsMinistryMembers = () => {
    const kidsMinistry = ministries.find(ministry => 
      ministry.name.toLowerCase().includes('kids') || 
      ministry.name.toLowerCase().includes('jovens') ||
      ministry.name.toLowerCase().includes('infantil') ||
      ministry.name.toLowerCase().includes('criança')
    );
    
    console.log('Ministérios disponíveis:', ministries);
    console.log('Ministério Kids encontrado:', kidsMinistry);
    
    if (!kidsMinistry || !kidsMinistry.members) {
      console.log('Nenhum ministério Kids encontrado ou sem membros');
      return [];
    }

    const members = kidsMinistry.members.map(member => ({
      id: member.id,
      name: member.name,
      ministry: kidsMinistry.name
    }));
    
    console.log('Membros do ministério Kids:', members);
    return members;
  };

  const kidsMinistryMembers = getKidsMinistryMembers();

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Calendar className="w-5 h-5" />
            Nova Escala de Professoras - Kids & Jovens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="worship_date">Data do Culto *</Label>
                <Input
                  id="worship_date"
                  type="date"
                  value={formData.worship_date}
                  onChange={(e) => setFormData({ ...formData, worship_date: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="class">Classe *</Label>
                <Select value={formData.class} onValueChange={(value) => setFormData({ ...formData, class: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a classe..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Berçário">Berçário (0-2 anos)</SelectItem>
                    <SelectItem value="Maternal">Maternal (3-4 anos)</SelectItem>
                    <SelectItem value="Jardim">Jardim (5-6 anos)</SelectItem>
                    <SelectItem value="Primários">Primários (7-8 anos)</SelectItem>
                    <SelectItem value="Juniores">Juniores (9-10 anos)</SelectItem>
                    <SelectItem value="Pré-Adolescentes">Pré-Adolescentes (11-12 anos)</SelectItem>
                    <SelectItem value="Adolescentes">Adolescentes (13-17 anos)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="teacher_1">Professora 1 *</Label>
                <Select value={formData.teacher_1} onValueChange={(value) => setFormData({ ...formData, teacher_1: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a professora 1..." />
                  </SelectTrigger>
                  <SelectContent>
                    {kidsMinistryMembers.length > 0 ? (
                      kidsMinistryMembers.map(member => (
                        <SelectItem key={`teacher1-${member.id}`} value={member.name}>
                          {member.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-members" disabled>
                        Nenhum membro do ministério Kids & Jovens encontrado
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="teacher_2">Professora 2</Label>
                <Select value={formData.teacher_2} onValueChange={(value) => setFormData({ ...formData, teacher_2: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a professora 2..." />
                  </SelectTrigger>
                  <SelectContent>
                    {kidsMinistryMembers.length > 0 ? (
                      kidsMinistryMembers.map(member => (
                        <SelectItem key={`teacher2-${member.id}`} value={member.name}>
                          {member.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-members" disabled>
                        Nenhum membro do ministério Kids & Jovens encontrado
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="lesson_id">Lição</Label>
              <Select value={formData.lesson_id} onValueChange={(value) => setFormData({ ...formData, lesson_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a lição..." />
                </SelectTrigger>
                <SelectContent>
                  {lessons.map(lesson => (
                    <SelectItem key={lesson.id} value={lesson.id}>
                      {lesson.title} - {lesson.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="observations">Observações</Label>
              <Textarea
                id="observations"
                value={formData.observations}
                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                placeholder="Observações especiais para esta escala..."
                rows={3}
              />
            </div>
            
            <Button type="submit" disabled={createScheduleMutation.isPending}>
              <Plus className="w-4 h-4 mr-2" />
              {createScheduleMutation.isPending ? 'Criando...' : 'Criar Escala'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de Escalas */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Escalas Programadas</h3>
        {schedules.map(schedule => (
          <Card key={schedule.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                  <div>
                    <p className="text-sm text-gray-600">Data</p>
                    <p className="font-medium">
                      {new Date(schedule.worship_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Classe</p>
                    <p className="font-medium">{schedule.class}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Professoras</p>
                    <p className="font-medium">{schedule.teacher_1}</p>
                    {schedule.teacher_2 && (
                      <p className="text-sm text-gray-600">{schedule.teacher_2}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Lição</p>
                    <p className="font-medium">{schedule.lesson?.title || 'Não definida'}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(schedule.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {schedule.observations && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm text-gray-600">Observações:</p>
                  <p className="text-sm">{schedule.observations}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {schedules.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhuma escala programada ainda.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
