
import { useState } from 'react';
import { UserPlus, X, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNewContactNotifications } from '@/hooks/useNewContactNotifications';
import { useIsMobile } from '@/hooks/use-mobile';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const NewContactNotifications = () => {
  const { newContacts, loading } = useNewContactNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  if (loading) return null;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-9 w-9"
        title="Novos Contatos Hoje"
      >
        <UserPlus className="h-4 w-4" />
        {newContacts.length > 0 && (
          <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-xs bg-blue-500 flex items-center justify-center">
            {newContacts.length}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className={`absolute ${isMobile ? 'right-2 left-2 top-12 max-w-none w-auto' : 'right-0 top-12 w-96'} z-50 shadow-lg border bg-white`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <span className="truncate">Novos Contatos Hoje</span>
              </CardTitle>
              <CardDescription className="text-xs">
                {newContacts.length === 0 
                  ? "Nenhum novo contato hoje" 
                  : `${newContacts.length} novo(s) contato(s) hoje`
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
                {newContacts.length > 0 ? (
                  <div className="space-y-3">
                    {newContacts.map(contact => (
                      <div 
                        key={contact.id} 
                        className="flex flex-col p-4 rounded-md border bg-blue-50 border-blue-100"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <p className={`${isMobile ? 'text-base' : 'text-sm'} font-medium text-gray-900 truncate`}>
                            {contact.name}
                          </p>
                          <Badge className="bg-blue-500 text-white text-xs flex-shrink-0">
                            NOVO!
                          </Badge>
                        </div>
                        <p className={`${isMobile ? 'text-sm' : 'text-xs'} text-blue-600 font-medium mb-2`}>
                          Cadastrado em {format(new Date(contact.created_at), 'HH:mm', { locale: ptBR })}
                        </p>
                        <p className={`${isMobile ? 'text-sm' : 'text-xs'} text-muted-foreground`}>
                          {contact.whatsapp ? 
                            `WhatsApp: ${contact.whatsapp}` : 
                            'WhatsApp não cadastrado'
                          }
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-muted-foreground text-sm">
                      Nenhum novo contato hoje
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
