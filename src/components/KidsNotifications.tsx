import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Users, X, Sparkles, Heart, Trash2 } from 'lucide-react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  message: string;
  category: string;
  created_at: string;
  child_name: string;
  child_class: string;
}

export function KidsNotifications() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [newNotifications, setNewNotifications] = useState<Set<string>>(new Set());
  const [blinkingNotifications, setBlinkingNotifications] = useState<Set<string>>(new Set());

  const {
    data: notifications = [],
    isLoading
  } = useQuery({
    queryKey: ['child-notifications'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('child_notifications').select(`
          id,
          message,
          category,
          created_at,
          children!child_notifications_child_id_fkey(name, class)
        `).order('created_at', {
        ascending: false
      });
      if (error) throw error;
      return data.map(item => ({
        id: item.id,
        message: item.message,
        category: item.category,
        created_at: item.created_at,
        child_name: item.children?.name || 'Criança não encontrada',
        child_class: item.children?.class || 'Classe não definida'
      }));
    }
  });

  const clearNotificationsMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('child_notifications')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['child-notifications'] });
      toast({
        title: "Avisos limpos",
        description: "Todos os avisos foram removidos com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao limpar avisos",
        description: "Ocorreu um erro ao tentar limpar os avisos.",
        variant: "destructive",
      });
      console.error('Erro ao limpar avisos:', error);
    }
  });

  useEffect(() => {
    console.log('Configurando canal de notificações em tempo real...');
    const channel = supabase.channel('notifications_realtime').on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'child_notifications'
    }, payload => {
      console.log('Nova notificação recebida via realtime:', payload);
      const notificationId = payload.new.id;

      setNewNotifications(prev => new Set([...prev, notificationId]));
      setBlinkingNotifications(prev => new Set([...prev, notificationId]));

      setTimeout(() => {
        setNewNotifications(prev => {
          const newSet = new Set(prev);
          newSet.delete(notificationId);
          return newSet;
        });
      }, 30000);

      setTimeout(() => {
        setBlinkingNotifications(prev => {
          const newSet = new Set(prev);
          newSet.delete(notificationId);
          return newSet;
        });
      }, 30000);
      queryClient.invalidateQueries({
        queryKey: ['child-notifications']
      });
    }).subscribe(status => {
      console.log('Status da inscrição do canal:', status);
    });
    return () => {
      console.log('Removendo canal de notificações...');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);

    setBlinkingNotifications(prev => {
      const newSet = new Set(prev);
      newSet.delete(notification.id);
      return newSet;
    });
    setNewNotifications(prev => {
      const newSet = new Set(prev);
      newSet.delete(notification.id);
      return newSet;
    });
  };

  const isNotificationBlinking = (notificationId: string) => {
    return blinkingNotifications.has(notificationId);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <span className="text-2xl font-semibold text-gray-700">Carregando avisos...</span>
        </div>
      </div>;
  }

  return <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Bell className="w-10 h-10 text-blue-600 animate-pulse" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Centro de Avisos
            </h1>
            <Bell className="w-10 h-10 text-pink-600 animate-pulse" />
          </div>
          <p className="text-xl text-gray-700 font-medium">Informações importantes para toda comunidade</p>
          
          {notifications.length > 0 && (
            <div className="mt-6">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2">
                    <Trash2 className="w-4 h-4" />
                    Limpar Todos os Avisos
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar limpeza</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação irá remover todos os avisos permanentemente. Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => clearNotificationsMutation.mutate()}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Limpar Avisos
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        {notifications.length === 0 ? <Card className="max-w-2xl mx-auto shadow-xl border-2 border-blue-200">
            <CardContent className="text-center py-12">
              <div className="flex items-center justify-center gap-4 mb-6">
                <Bell className="w-20 h-20 text-gray-300" />
                <Heart className="w-14 h-14 text-pink-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-600 mb-3">Nenhum aviso no momento</h3>
              <p className="text-lg text-gray-500">
                Quando houver informações importantes, elas aparecerão aqui.
              </p>
            </CardContent>
          </Card> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notifications.map(notification => <Card key={notification.id} className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl transform border-2 ${isNotificationBlinking(notification.id) ? 'ring-4 ring-yellow-400 animate-[pulse_1s_ease-in-out_infinite] bg-gradient-to-br from-yellow-100 via-orange-100 to-red-100 shadow-2xl border-orange-400 scale-105' : 'bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 shadow-lg border-blue-200'}`} onClick={() => handleNotificationClick(notification)} style={{
          animation: isNotificationBlinking(notification.id) ? 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite' : undefined
        }}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="secondary" className={`text-sm px-3 py-1 font-bold ${notification.category === 'Kids' ? "bg-gradient-to-r from-pink-200 to-pink-300 text-pink-800 border border-pink-400" : "bg-gradient-to-r from-blue-200 to-blue-300 text-blue-800 border border-blue-400"}`}>
                      {notification.category}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-center py-3 bg-gradient-to-r from-gray-50 via-white to-gray-50 rounded-lg border border-gray-200">
                      <div className="font-bold text-lg text-gray-800 mb-1">
                        {notification.child_name}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">
                        {notification.child_class}
                      </div>
                    </div>
                    
                    <p className="text-gray-700 text-sm leading-relaxed line-clamp-3 font-medium">
                      {notification.message}
                    </p>
                  </div>

                  {isNotificationBlinking(notification.id) && <div className="mt-4 flex items-center justify-center gap-2 text-orange-800 font-bold text-sm bg-gradient-to-r from-yellow-200 to-orange-200 rounded-lg py-2 border-2 border-orange-400">
                      <Sparkles className="w-4 h-4 animate-spin" />
                      NOVO AVISO
                      <Sparkles className="w-4 h-4 animate-spin" />
                    </div>}
                </CardContent>
              </Card>)}
          </div>}

        <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
          <DialogContent className="max-w-5xl max-h-[95vh] bg-white border-0 shadow-2xl rounded-3xl overflow-hidden p-0">
            {selectedNotification && (
              <div className="relative">
                {/* Header com gradiente */}
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-8 py-12 text-center relative">
                  <div className="absolute top-4 right-4">
                    <button 
                      onClick={() => setSelectedNotification(null)}
                      className="text-white/80 hover:text-white transition-colors p-2 rounded-full hover:bg-white/20"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <Bell className="w-12 h-12 text-yellow-300 drop-shadow-lg" />
                    <h1 className="text-5xl font-bold text-white drop-shadow-lg">
                      Aviso Importante
                    </h1>
                    <Bell className="w-12 h-12 text-yellow-300 drop-shadow-lg" />
                  </div>
                  
                  <Badge 
                    variant="secondary" 
                    className={`text-xl px-6 py-3 font-bold rounded-full shadow-lg ${
                      selectedNotification.category === 'Kids' 
                        ? "bg-pink-500 text-white border-0" 
                        : "bg-blue-500 text-white border-0"
                    }`}
                  >
                    {selectedNotification.category}
                  </Badge>
                </div>

                {/* Conteúdo principal */}
                <div className="px-8 py-12 space-y-8">
                  {/* Nome da criança */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <Users className="w-10 h-10 text-blue-600" />
                      <h2 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {selectedNotification.child_name}
                      </h2>
                      <Users className="w-10 h-10 text-pink-600" />
                    </div>
                    <p className="text-3xl text-gray-700 font-semibold">
                      {selectedNotification.child_class}
                    </p>
                  </div>
                  
                  {/* Mensagem */}
                  <div className="text-center">
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-8 border-orange-500 p-8 rounded-2xl shadow-lg">
                      <p className="text-3xl leading-relaxed text-gray-800 font-medium">
                        {selectedNotification.message}
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="text-center pt-8 border-t border-gray-200">
                    <p className="text-lg text-gray-600 font-medium flex items-center justify-center gap-2">
                      <Sparkles className="w-5 h-5 text-yellow-500" />
                      Sistema de Avisos Kids & Jovens
                      <Sparkles className="w-5 h-5 text-yellow-500" />
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>;
}
