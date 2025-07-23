
import { useState } from 'react';
import { Bell, Phone, X, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBirthdayNotifications } from '@/hooks/useBirthdayNotifications';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

export const BirthdayNotifications = () => {
  const {
    todayBirthdays = [],
    loading,
    markNotificationSent
  } = useBirthdayNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleSendMessage = async (name: string, whatsapp: string | null, contactId: string) => {
    if (!whatsapp) {
      toast({
        title: "WhatsApp não cadastrado",
        description: `${name} não possui WhatsApp cadastrado`,
        variant: "destructive"
      });
      return;
    }

    const message = `🎉 Feliz Aniversário, ${name}! 🎂\n\nQue Deus abençoe sua vida com muita saúde, paz e alegria. Desejamos um ano repleto de conquistas e vitórias!\n\nCom carinho,\nEquipe de Células`;
    const whatsappUrl = `https://wa.me/55${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    
    await markNotificationSent(contactId);
    
    toast({
      title: "Mensagem enviada",
      description: `Mensagem de aniversário enviada para ${name}`
    });
  };

  if (loading) return null;

  // Ensure todayBirthdays is an array before using it
  const birthdays = Array.isArray(todayBirthdays) ? todayBirthdays : [];

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-9 w-9"
        title="Notificações de Aniversário"
      >
        <Bell className="h-4 w-4" />
        {birthdays.length > 0 && (
          <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-xs bg-red-500 flex items-center justify-center">
            {birthdays.length}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className={`absolute ${isMobile ? 'right-2 left-2 top-12 max-w-[calc(100vw-1rem)]' : 'right-0 top-12 w-96'} z-50 shadow-lg border bg-white`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bell className="h-4 w-4 text-red-500 flex-shrink-0" />
                <span className="truncate">Notificações de Aniversário</span>
              </CardTitle>
              <CardDescription className="text-xs">
                {birthdays.length === 0 
                  ? "Nenhuma notificação pendente" 
                  : `${birthdays.length} notificação(ões) pendente(s)`
                }
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-6 w-6 flex-shrink-0">
              <X className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className={`${isMobile ? 'h-[calc(100vh-200px)] max-h-[300px]' : 'h-[400px]'}`}>
              <div className="space-y-2 p-4">
                {birthdays.length > 0 ? (
                  <div className="space-y-3">
                    {birthdays.map(birthday => (
                      <div 
                        key={birthday.contact_id} 
                        className={`flex items-center justify-between p-3 rounded-md border bg-red-50 border-red-100 ${isMobile ? 'min-h-[90px]' : 'min-h-[80px]'}`}
                      >
                        <div className="flex-1 min-w-0 pr-3">
                          <p className={`${isMobile ? 'text-sm' : 'text-sm'} font-medium text-gray-900 truncate`}>
                            {birthday.contact_name}
                          </p>
                          <p className="text-xs text-red-600 font-medium mt-1">
                            🎂 Aniversário hoje!
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {birthday.age !== null ? `${birthday.age} anos` : 'Idade não informada'}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleSendMessage(birthday.contact_name, birthday.whatsapp, birthday.contact_id)}
                          className={`bg-green-600 hover:bg-green-700 ${isMobile ? 'h-9 px-3 text-xs' : 'h-8 text-xs'} flex-shrink-0`}
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          {isMobile ? 'Enviar' : 'WhatsApp'}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-muted-foreground text-sm">
                      Nenhuma notificação de aniversário hoje
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
