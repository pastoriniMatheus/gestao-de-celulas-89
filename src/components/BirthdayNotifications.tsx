
import { useState } from 'react';
import { Bell, Gift, Phone, X, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBirthdayNotifications } from '@/hooks/useBirthdayNotifications';
import { useNewContactNotifications } from '@/hooks/useNewContactNotifications';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useIsMobile } from '@/hooks/use-mobile';

export const BirthdayNotifications = () => {
  const { todayBirthdays, loading: birthdayLoading, markNotificationSent } = useBirthdayNotifications();
  const { newContacts, loading: contactsLoading } = useNewContactNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const totalNotifications = todayBirthdays.length + newContacts.length;
  const loading = birthdayLoading || contactsLoading;

  const handleSendMessage = async (contactId: string, name: string, whatsapp: string | null) => {
    if (!whatsapp) {
      toast({
        title: "WhatsApp não cadastrado",
        description: `${name} não possui WhatsApp cadastrado`,
        variant: "destructive"
      });
      return;
    }

    // Abrir WhatsApp com mensagem de aniversário
    const message = `🎉 Feliz Aniversário, ${name}! 🎂\n\nQue Deus abençoe sua vida com muita saúde, paz e alegria. Desejamos um ano repleto de conquistas e vitórias!\n\nCom carinho,\nEquipe de Células`;
    const whatsappUrl = `https://wa.me/55${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    
    await markNotificationSent(contactId);
    
    toast({
      title: "Mensagem enviada",
      description: `Mensagem de aniversário enviada para ${name}`
    });
  };

  const handleWelcomeMessage = (name: string, whatsapp: string | null) => {
    if (!whatsapp) {
      toast({
        title: "WhatsApp não cadastrado",
        description: `${name} não possui WhatsApp cadastrado`,
        variant: "destructive"
      });
      return;
    }

    // Abrir WhatsApp com mensagem de boas-vindas
    const message = `🙏 Olá ${name}!\n\nSeja muito bem-vindo(a) à nossa comunidade! Ficamos felizes em tê-lo(a) conosco.\n\nEm breve entraremos em contato para conhecê-lo(a) melhor.\n\nQue Deus abençoe!\n\nEquipe de Células`;
    const whatsappUrl = `https://wa.me/55${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "Mensagem enviada",
      description: `Mensagem de boas-vindas enviada para ${name}`
    });
  };

  const formatBirthDate = (birthDate: string) => {
    try {
      // Adicionar hora para evitar problemas de timezone
      const date = new Date(birthDate + 'T00:00:00');
      return format(date, "dd 'de' MMMM", { locale: ptBR });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return birthDate;
    }
  };

  const formatContactTime = (createdAt: string) => {
    try {
      const date = new Date(createdAt);
      return format(date, "HH:mm", { locale: ptBR });
    } catch (error) {
      return createdAt;
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
      >
        <Bell className="h-4 w-4" />
        {totalNotifications > 0 && (
          <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-xs bg-red-500 flex items-center justify-center">
            {totalNotifications}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className={`absolute ${isMobile ? 'right-0 left-0 mx-2 top-12 min-w-[320px]' : 'right-0 top-12 w-80'} z-50 shadow-lg border bg-white`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bell className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <span className="truncate">Notificações</span>
              </CardTitle>
              <CardDescription className="text-xs">
                {totalNotifications === 0 
                  ? "Nenhuma notificação hoje" 
                  : `${totalNotifications} notificação(ões) hoje`
                }
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-6 w-6 flex-shrink-0">
              <X className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className={`${isMobile ? 'h-[350px]' : 'h-[400px]'}`}>
              <div className="space-y-4 p-4">
                {/* Seção de Aniversariantes */}
                {todayBirthdays.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Gift className="h-4 w-4 text-orange-500 flex-shrink-0" />
                      <span className="text-sm font-medium">Aniversariantes ({todayBirthdays.length})</span>
                    </div>
                    <div className="space-y-2">
                      {todayBirthdays.map((contact) => (
                        <div key={contact.contact_id} className="flex items-center justify-between p-3 bg-orange-50 rounded-md border border-orange-100 min-h-[80px]">
                          <div className="flex-1 min-w-0 pr-3">
                            <p className="text-sm font-medium text-gray-900 truncate">{contact.contact_name}</p>
                            <p className="text-xs text-orange-600 font-medium">
                              {formatBirthDate(contact.birth_date)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {contact.age !== null && contact.age !== undefined ? `${contact.age} anos` : 'Idade não calculada'}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleSendMessage(contact.contact_id, contact.contact_name, contact.whatsapp)}
                            className="bg-green-600 hover:bg-green-700 h-8 text-xs flex-shrink-0"
                          >
                            <Phone className="h-3 w-3 mr-1" />
                            {isMobile ? 'WhatsApp' : 'Enviar'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Separador se ambas as seções têm conteúdo */}
                {todayBirthdays.length > 0 && newContacts.length > 0 && (
                  <Separator />
                )}

                {/* Seção de Novos Contatos */}
                {newContacts.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <UserPlus className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <span className="text-sm font-medium">Novos Contatos ({newContacts.length})</span>
                    </div>
                    <div className="space-y-2">
                      {newContacts.map((contact) => (
                        <div key={contact.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-md border border-blue-100 min-h-[80px]">
                          <div className="flex-1 min-w-0 pr-3">
                            <p className="text-sm font-medium text-gray-900 truncate">{contact.name}</p>
                            <p className="text-xs text-blue-600 font-medium">
                              Cadastrado às {formatContactTime(contact.created_at)}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {contact.whatsapp ? `WhatsApp: ${contact.whatsapp}` : 'WhatsApp não informado'}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleWelcomeMessage(contact.name, contact.whatsapp)}
                            className="bg-green-600 hover:bg-green-700 h-8 text-xs flex-shrink-0"
                            disabled={!contact.whatsapp}
                          >
                            <Phone className="h-3 w-3 mr-1" />
                            {isMobile ? 'Saudar' : 'Saudar'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mensagem quando não há notificações */}
                {totalNotifications === 0 && (
                  <p className="text-center text-muted-foreground py-4 text-sm">
                    🔔 Nenhuma notificação hoje
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
