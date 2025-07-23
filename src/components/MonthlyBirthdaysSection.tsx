
import { useState } from 'react';
import { Calendar, Gift, Phone, X, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMonthlyBirthdays } from '@/hooks/useMonthlyBirthdays';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useIsMobile } from '@/hooks/use-mobile';

export const MonthlyBirthdaysSection = () => {
  const {
    monthlyBirthdays,
    loading
  } = useMonthlyBirthdays();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const currentMonthName = format(new Date(), 'MMMM', {
    locale: ptBR
  });

  const handleSendMessage = (name: string, whatsapp: string | null) => {
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
    
    toast({
      title: "Mensagem enviada",
      description: `Mensagem de aniversário enviada para ${name}`
    });
  };

  const formatBirthDate = (birthDate: string, day: number) => {
    try {
      return `${day} de ${currentMonthName}`;
    } catch (error) {
      return `Dia ${day}`;
    }
  };

  if (loading) return null;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-9 w-9"
        title={`Aniversariantes de ${currentMonthName}`}
      >
        <Gift className="h-4 w-4" />
        {monthlyBirthdays.length > 0 && (
          <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-xs bg-orange-500 flex items-center justify-center">
            {monthlyBirthdays.length}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className={`absolute ${isMobile ? 'right-2 left-2 top-12 max-w-[calc(100vw-1rem)]' : 'right-0 top-12 w-96'} z-50 shadow-lg border bg-white`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4 text-orange-500 flex-shrink-0" />
                <span className="truncate">Aniversariantes de {currentMonthName}</span>
              </CardTitle>
              <CardDescription className="text-xs">
                {monthlyBirthdays.length === 0 
                  ? `Nenhum aniversariante em ${currentMonthName}` 
                  : `${monthlyBirthdays.length} aniversariante(s) este mês`
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
                {monthlyBirthdays.length > 0 ? (
                  <div className="space-y-3">
                    {monthlyBirthdays.map(contact => {
                      const today = new Date().getDate();
                      const isToday = contact.day === today;
                      
                      return (
                        <div 
                          key={contact.id} 
                          className={`flex items-center justify-between p-3 rounded-md border ${isMobile ? 'min-h-[90px]' : 'min-h-[80px]'} ${
                            isToday 
                              ? 'bg-gradient-to-r from-orange-100 to-yellow-100 border-orange-300' 
                              : 'bg-orange-50 border-orange-100'
                          }`}
                        >
                          <div className="flex-1 min-w-0 pr-3">
                            <div className="flex items-center gap-2 mb-1">
                              <p className={`${isMobile ? 'text-sm' : 'text-sm'} font-medium text-gray-900 truncate`}>
                                {contact.name}
                              </p>
                              {isToday && (
                                <Badge className="bg-orange-500 text-white text-xs flex-shrink-0">
                                  HOJE!
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-orange-600 font-medium">
                              {formatBirthDate(contact.birth_date, contact.day)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {contact.age !== null ? `${contact.age} anos` : 'Idade não calculada'}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleSendMessage(contact.name, contact.whatsapp)}
                            className={`bg-green-600 hover:bg-green-700 ${isMobile ? 'h-9 px-3 text-xs' : 'h-8 text-xs'} flex-shrink-0`}
                          >
                            <Phone className="h-3 w-3 mr-1" />
                            {isMobile ? 'Enviar' : 'WhatsApp'}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-muted-foreground text-sm">
                      Nenhum aniversariante em {currentMonthName}
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
