
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Bell, Users } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useMinistries } from '@/hooks/useMinistries';

export function KidsNotificationsManager() {
  const queryClient = useQueryClient();
  const { ministries } = useMinistries();
  const [formData, setFormData] = useState({
    child_id: '',
    message: ''
  });

  // Buscar ministérios Kids e Jovens
  const kidsMinistries = ministries.filter(m => 
    m.name.toLowerCase().includes('kids') || 
    m.name.toLowerCase().includes('jovens') ||
    m.name.toLowerCase().includes('ministério kids') ||
    m.name.toLowerCase().includes('ministério jovens')
  );

  const { data: children = [] } = useQuery({
    queryKey: ['children-for-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('children')
        .select('id, name, class')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  const { data: ministryTeachers = [] } = useQuery({
    queryKey: ['ministry-teachers-kids-jovens'],
    queryFn: async () => {
      const kidsMinistryIds = kidsMinistries.map(m => m.id);
      
      if (kidsMinistryIds.length === 0) {
        return [];
      }

      const { data, error } = await supabase
        .from('ministry_teachers')
        .select(`
          *,
          contact:contacts!ministry_teachers_contact_id_fkey(id, name),
          ministry:ministries!ministry_teachers_ministry_id_fkey(name)
        `)
        .eq('active', true)
        .in('ministry_id', kidsMinistryIds);
      
      if (error) throw error;
      return data;
    },
    enabled: kidsMinistries.length > 0
  });

  // Configurar atualização em tempo real para notificações
  useEffect(() => {
    const channel = supabase
      .channel('child_notifications_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'child_notifications'
        },
        () => {
          console.log('Nova notificação detectada, atualizando dados...');
          queryClient.invalidateQueries({ queryKey: ['child-notifications'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const sendNotificationMutation = useMutation({
    mutationFn: async (notificationData: any) => {
      const selectedChild = children.find(child => child.id === notificationData.child_id);
      const category = selectedChild?.class === 'Adolescentes' || selectedChild?.class === 'Pré-Adolescentes' ? 'Jovens' : 'Kids';
      
      const { data, error } = await supabase
        .from('child_notifications')
        .insert([{
          child_id: notificationData.child_id,
          message: notificationData.message,
          category: category
        }])
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Notificação enviada com sucesso!');
      setFormData({ child_id: '', message: '' });
      // Invalidar queries para atualizar todas as notificações
      queryClient.invalidateQueries({ queryKey: ['child-notifications'] });
    },
    onError: (error) => {
      toast.error('Erro ao enviar notificação: ' + error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.child_id || !formData.message.trim()) {
      toast.error('Selecione uma criança e digite a mensagem');
      return;
    }
    sendNotificationMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      {/* Seção dos Ministérios Kids e Jovens */}
      {kidsMinistries.length > 0 && (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Professores nos Ministérios Kids e Jovens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {ministryTeachers.map(teacher => (
                <div key={teacher.id} className="bg-white p-3 rounded-lg border">
                  <div className="font-medium text-gray-800">{teacher.contact?.name}</div>
                  <div className="text-sm text-gray-600">{teacher.ministry?.name}</div>
                </div>
              ))}
            </div>
            {ministryTeachers.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                Nenhum professor cadastrado nos ministérios Kids e Jovens.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-rose-600" />
            Enviar Notificação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="child_id">Selecionar Criança</Label>
              <Select 
                value={formData.child_id} 
                onValueChange={value => setFormData({ ...formData, child_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Busque e selecione uma criança..." />
                </SelectTrigger>
                <SelectContent>
                  {children.map(child => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.name} - {child.class}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="message">Mensagem</Label>
              <Textarea 
                id="message" 
                value={formData.message} 
                onChange={e => setFormData({ ...formData, message: e.target.value })} 
                placeholder="Digite sua mensagem aqui..." 
                rows={4} 
                className="resize-none" 
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-rose-600 hover:bg-rose-700" 
              disabled={sendNotificationMutation.isPending}
            >
              <Send className="w-4 h-4 mr-2" />
              {sendNotificationMutation.isPending ? 'Enviando...' : 'Enviar Notificação'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800">Como funciona</h4>
              <p className="text-sm text-blue-700 mt-1">
                As notificações enviadas aqui aparecerão na página <a href="/avisos" className="underline"><strong>/avisos</strong></a> do sistema,
                organizadas por categoria (Kids ou Jovens) e exibindo o nome da criança junto com a mensagem.
                As notificações são atualizadas automaticamente quando novas mensagens são enviadas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
