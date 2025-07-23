
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Users, Send, Clock, AlertCircle } from 'lucide-react';
import { useContacts } from '@/hooks/useContacts';
import { useMessaging } from '@/hooks/useMessaging';
import { useMessageHistory } from '@/hooks/useMessageHistory';
import { MessageTemplateManager } from './MessageTemplateManager';

export const MessagingCenter = () => {
  const { contacts } = useContacts();
  const { sendMessage, loading } = useMessaging();
  const { history } = useMessageHistory();
  const [message, setMessage] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [messageType, setMessageType] = useState<'birthday' | 'new_contact' | 'pipeline_change' | 'bulk_message'>('bulk_message');

  const handleSendMessage = async () => {
    if (!message.trim() || selectedContacts.length === 0) return;

    try {
      await sendMessage({
        message,
        contacts: selectedContacts,
        type: messageType
      });
      setMessage('');
      setSelectedContacts([]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const filteredHistory = history.filter(msg => msg.type === messageType);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Central de Mensagens
          </CardTitle>
          <CardDescription>
            Envie mensagens para seus contatos e gerencie templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="send" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="send">Enviar Mensagem</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>
            
            <TabsContent value="send" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="message-type">Tipo de Mensagem</Label>
                  <Select value={messageType} onValueChange={(value: 'birthday' | 'new_contact' | 'pipeline_change' | 'bulk_message') => setMessageType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="birthday">Aniversário</SelectItem>
                      <SelectItem value="new_contact">Novo Contato</SelectItem>
                      <SelectItem value="pipeline_change">Mudança de Pipeline</SelectItem>
                      <SelectItem value="bulk_message">Mensagem em Massa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="selected-contacts">Contatos Selecionados</Label>
                  <Select value="" onValueChange={(value) => {
                    if (value && !selectedContacts.includes(value)) {
                      setSelectedContacts([...selectedContacts, value]);
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar contatos" />
                    </SelectTrigger>
                    <SelectContent>
                      {contacts.map((contact) => (
                        <SelectItem key={contact.id} value={contact.id}>
                          {contact.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {selectedContacts.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedContacts.map((contactId) => {
                    const contact = contacts.find(c => c.id === contactId);
                    return (
                      <div key={contactId} className="flex items-center gap-2 bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        <span className="text-sm">{contact?.name}</span>
                        <button
                          onClick={() => setSelectedContacts(selectedContacts.filter(id => id !== contactId))}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              
              <div>
                <Label htmlFor="message">Mensagem</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Digite sua mensagem aqui..."
                  rows={4}
                />
              </div>
              
              <Button 
                onClick={handleSendMessage}
                disabled={loading || !message.trim() || selectedContacts.length === 0}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                {loading ? 'Enviando...' : 'Enviar Mensagem'}
              </Button>
            </TabsContent>
            
            <TabsContent value="history" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <h3 className="font-medium">Histórico de Mensagens</h3>
                </div>
                
                {filteredHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhuma mensagem enviada ainda
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredHistory.map((msg) => (
                      <div key={msg.id} className="p-4 border rounded">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium">{msg.type}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(msg.sent_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{msg.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {msg.contacts?.length || 0} contatos
                          </span>
                          {msg.status === 'sent' && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Enviado
                            </span>
                          )}
                          {msg.status === 'failed' && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                              Falha
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="templates">
              <MessageTemplateManager />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
