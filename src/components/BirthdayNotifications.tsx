
import { useState } from 'react';
import { Bell, X, Users, Phone } from 'lucide-react';
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

  const handleSendMessage = (birthday: any) => {
    if (!birthday.whatsapp) {
      toast({
        title: "WhatsApp não cadastrado",
        description: `${birthday.contact_name} não possui WhatsApp cadastrado`,
        variant: "destructive"
      });
      return;
    }

    const message = `🎉 Feliz Aniversário, ${birthday.contact_name}! 🎂\n\nQue Deus abençoe sua vida com muita saúde, paz e alegria. Desejamos um ano repleto de conquistas e vitórias!\n\nCom carinho,\nEquipe de Células`;
    const whatsappUrl = `https://wa.me/55${birthday.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    
    markNotificationSent(birthday.contact_id);
    
    toast({
      title: "Mensagem enviada",
      description: `Mensagem de aniversário enviada para ${birthday.contact_name}`
    });
  };

  if (loading) return null;

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
        <Card className={`absolute ${isMobile ? 'right-2 left-2 top-12 max-w-none w-auto' : 'right-0 top-12 w-96'} z-50 shadow-lg border bg-white`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bell className="h-4 w-4 text-red-500 flex-shrink-0" />
                <span className="truncate">Aniversários de Hoje</span>
              </CardTitle>
              <CardDescription className="text-xs">
                {birthdays.length === 0 
                  ? "Nenhum aniversário hoje" 
                  : `${birthdays.length} aniversário(s) hoje`
                }
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-6 w-6 flex-shrink-0">
              <X className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className={`${isMobile ? 'max-h-[60vh]' : 'h-[400px]'}`}>
              <div className={`space-y-2 ${isMobile ? 'p-4' : 'p-4'}`}>
                {birthdays.length > 0 ? (
                  <div className="space-y-3">
                    {birthdays.map(birthday => (
                      <div 
                        key={birthday.contact_id} 
                        className={`flex ${isMobile ? 'flex-col space-y-3' : 'items-center justify-between'} p-4 rounded-md border bg-red-50 border-red-100`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <p className={`${isMobile ? 'text-base' : 'text-sm'} font-medium text-gray-900 truncate`}>
                              {birthday.contact_name || 'Nome não encontrado'}
                            </p>
                            <Badge className="bg-red-500 text-white text-xs flex-shrink-0">
                              HOJE!
                            </Badge>
                          </div>
                          <p className={`${isMobile ? 'text-sm' : 'text-xs'} text-red-600 font-medium mb-2`}>
                            Aniversário hoje{birthday.age ? ` - ${birthday.age} anos` : ''}
                          </p>
                          <p className={`${isMobile ? 'text-sm' : 'text-xs'} text-muted-foreground`}>
                            {birthday.whatsapp ? 
                              `WhatsApp: ${birthday.whatsapp}` : 
                              'WhatsApp não cadastrado'
                            }
                          </p>
                        </div>
                        <Button
                          size={isMobile ? "default" : "sm"}
                          onClick={() => handleSendMessage(birthday)}
                          className={`bg-green-600 hover:bg-green-700 ${isMobile ? 'w-full h-10 text-sm' : 'h-8 text-xs flex-shrink-0'}`}
                          disabled={!birthday.whatsapp}
                        >
                          <Phone className={`${isMobile ? 'h-4 w-4' : 'h-3 w-3'} mr-2`} />
                          Enviar WhatsApp
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-muted-foreground text-sm">
                      Nenhum aniversário hoje
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
