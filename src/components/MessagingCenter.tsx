import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Users, Webhook, Filter } from 'lucide-react';
import { useMessaging } from '@/hooks/useMessaging';
import { useWebhookConfigs } from '@/hooks/useWebhookConfigs';
import { toast } from '@/hooks/use-toast';
export const MessagingCenter = () => {
  const {
    contacts,
    cells,
    pipelineStages,
    selectedContacts,
    loading,
    setSelectedContacts,
    applyFilters
  } = useMessaging();
  const {
    webhooks
  } = useWebhookConfigs();
  const [message, setMessage] = useState('');
  const [selectedCell, setSelectedCell] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedWebhook, setSelectedWebhook] = useState<string>('');
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [sending, setSending] = useState(false);
  useEffect(() => {
    const filters = {
      ...(selectedCell !== 'all' && {
        cellId: selectedCell
      }),
      ...(selectedStage !== 'all' && {
        pipelineStageId: selectedStage
      }),
      ...(selectedStatus !== 'all' && {
        status: selectedStatus
      })
    };
    applyFilters(filters);
  }, [selectedCell, selectedStage, selectedStatus, applyFilters]);
  const handleSelectAll = (checked: boolean) => {
    setIsSelectAll(checked);
    if (checked) {
      setSelectedContacts(contacts.map(c => c.id));
    } else {
      setSelectedContacts([]);
    }
  };
  const handleContactSelect = (contactId: string, checked: boolean) => {
    if (checked) {
      setSelectedContacts([...selectedContacts, contactId]);
    } else {
      setSelectedContacts(selectedContacts.filter(id => id !== contactId));
      setIsSelectAll(false);
    }
  };
  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast({
        title: "Erro",
        description: "Digite uma mensagem",
        variant: "destructive"
      });
      return;
    }
    if (selectedContacts.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um contato",
        variant: "destructive"
      });
      return;
    }
    if (!selectedWebhook) {
      toast({
        title: "Erro",
        description: "Selecione um webhook para envio",
        variant: "destructive"
      });
      return;
    }
    setSending(true);
    try {
      const webhook = webhooks.find(w => w.id === selectedWebhook);
      if (!webhook) {
        throw new Error('Webhook não encontrado');
      }
      const selectedContactsData = contacts.filter(c => selectedContacts.includes(c.id));
      const response = await fetch(webhook.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...webhook.headers
        },
        body: JSON.stringify({
          event_type: 'bulk_message',
          message: message,
          contacts: selectedContactsData.map(contact => ({
            id: contact.id,
            name: contact.name,
            whatsapp: contact.whatsapp,
            neighborhood: contact.neighborhood,
            status: contact.status
          })),
          total_contacts: selectedContactsData.length,
          timestamp: new Date().toISOString(),
          webhook_name: webhook.name
        })
      });
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      toast({
        title: "Sucesso",
        description: `Mensagem enviada para ${selectedContactsData.length} contatos via webhook`
      });
      setMessage('');
      setSelectedContacts([]);
      setIsSelectAll(false);
      setSelectedWebhook('');
    } catch (error) {
      console.error('Erro ao enviar:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagem via webhook",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };
  if (loading) {
    return <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando...</span>
      </div>;
  }
  const messageWebhooks = webhooks.filter(w => w.active && w.event_type === 'custom');
  return <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Central de Mensagens</h1>
        <p className="text-gray-600">Envie mensagens em massa via webhook</p>
      </div>

      {/* Configuração da Mensagem */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Configurar Mensagem
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Webhook Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Webhook className="h-4 w-4 text-purple-600" />
              Webhook de Destino *
            </label>
            <Select value={selectedWebhook} onValueChange={setSelectedWebhook}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o webhook para envio" />
              </SelectTrigger>
              <SelectContent>
                {messageWebhooks.map(webhook => <SelectItem key={webhook.id} value={webhook.id}>
                    {webhook.name}
                  </SelectItem>)}
              </SelectContent>
            </Select>
            {messageWebhooks.length === 0 && <p className="text-sm text-amber-600">
                Nenhum webhook ativo encontrado. Configure webhooks em Configurações → Webhooks.
              </p>}
          </div>

          {/* Message Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Mensagem *</label>
            <Textarea placeholder="Digite sua mensagem..." value={message} onChange={e => setMessage(e.target.value)} rows={4} className="resize-none" />
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5 text-green-600" />
            Filtros de Contatos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedCell} onValueChange={setSelectedCell}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as células" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as células</SelectItem>
                {cells.map(cell => <SelectItem key={cell.id} value={cell.id}>
                    {cell.name}
                  </SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={selectedStage} onValueChange={setSelectedStage}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os estágios" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os estágios</SelectItem>
                {pipelineStages.map(stage => <SelectItem key={stage.id} value={stage.id}>
                    {stage.name}
                  </SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="member">Membros</SelectItem>
                <SelectItem value="visitor">Visitantes</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Contatos */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-indigo-600" />
              Contatos ({contacts.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Checkbox id="select-all" checked={isSelectAll} onCheckedChange={handleSelectAll} />
              <label htmlFor="select-all" className="text-sm font-medium">
                Selecionar todos
              </label>
            </div>
          </div>
        </CardHeader>
        <CardContent className="py-0 my-0">
          <div className="max-h-80 overflow-y-auto space-y-2">
            {contacts.map(contact => <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Checkbox checked={selectedContacts.includes(contact.id)} onCheckedChange={checked => handleContactSelect(contact.id, checked as boolean)} />
                  <div>
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-gray-600">{contact.whatsapp || 'Sem WhatsApp'}</p>
                    <p className="text-xs text-gray-500">{contact.neighborhood}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {contact.status === 'member' ? 'Membro' : contact.status === 'visitor' ? 'Visitante' : 'Pendente'}
                </Badge>
              </div>)}
            {contacts.length === 0 && <p className="text-center text-gray-500 py-8">
                Nenhum contato encontrado com os filtros aplicados
              </p>}
          </div>
        </CardContent>
      </Card>

      {/* Enviar */}
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedContacts.length} contato(s) selecionado(s)
            </div>
            <Button onClick={handleSendMessage} disabled={sending || selectedContacts.length === 0 || !message.trim() || !selectedWebhook} size="lg" className="min-w-32">
              {sending ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar via Webhook
                </>}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>;
};