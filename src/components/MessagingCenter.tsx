
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Filter, 
  Save, 
  Clock, 
  Loader, 
  CheckCircle,
  AlertCircle,
  FileText,
  MessageSquarePlus,
  Trash2
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMessaging } from '@/hooks/useMessaging';
import { useWebhookConfigs } from '@/hooks/useWebhookConfigs';
import { useMessageTemplates, MessageTemplate } from '@/hooks/useMessageTemplates';
import { useMessageHistory, MessageHistory } from '@/hooks/useMessageHistory';
import { EmojiPicker } from '@/components/EmojiPicker';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/components/AuthProvider';

export const MessagingCenter = () => {
  const {
    contacts,
    cells,
    pipelineStages,
    selectedContacts,
    loading,
    setSelectedContacts,
    applyFilters,
    sendMessage
  } = useMessaging();
  
  const { webhooks } = useWebhookConfigs();
  const { templates, addTemplate, deleteTemplate } = useMessageTemplates();
  const { history, loading: historyLoading, saveMessageToHistory } = useMessageHistory();
  const { userProfile } = useAuth();
  
  const [message, setMessage] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [selectedCell, setSelectedCell] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedWebhook, setSelectedWebhook] = useState<string>('default');
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [sending, setSending] = useState(false);
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('message');

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
      }),
      ...(searchText && {
        searchName: searchText
      })
    };
    applyFilters(filters);
  }, [selectedCell, selectedStage, selectedStatus, searchText, applyFilters]);

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
    
    setSending(true);
    try {
      // Enviar via webhook se selecionado
      if (selectedWebhook !== 'default') {
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
      } else {
        // Enviar via método padrão (WhatsApp direto)
        await sendMessage(selectedContacts, message);
      }
      
      // Salvar no histórico
      await saveMessageToHistory(message, selectedContacts);
      
      toast({
        title: "Sucesso",
        description: `Mensagem enviada para ${selectedContacts.length} contatos`
      });
      
      // Limpar após envio
      setMessage('');
      setSelectedContacts([]);
      setIsSelectAll(false);
      
    } catch (error) {
      console.error('Erro ao enviar:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagem",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim() || !message.trim()) {
      toast({
        title: "Erro",
        description: "Nome do template e mensagem são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      await addTemplate({
        name: templateName,
        template_type: 'custom',
        message: message,
        variables: [],
        active: true
      });

      toast({
        title: "Sucesso",
        description: "Template salvo com sucesso"
      });
      
      setSaveTemplateOpen(false);
      setTemplateName('');
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar template",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await deleteTemplate(templateId);
      toast({
        title: "Sucesso",
        description: "Template deletado com sucesso"
      });
    } catch (error) {
      console.error('Erro ao deletar template:', error);
      toast({
        title: "Erro",
        description: "Erro ao deletar template",
        variant: "destructive"
      });
    }
  };

  const handleLoadTemplate = (template: MessageTemplate) => {
    setMessage(template.message);
    toast({
      title: "Template carregado",
      description: `Template "${template.name}" carregado com sucesso`
    });
  };

  const handleAddEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji);
  };

  // Filtrar templates ativos
  const activeTemplates = templates.filter(t => t.active);
  
  // Filtrar histórico para líderes
  const filteredHistory = userProfile?.role === 'admin' 
    ? history 
    : history; // No futuro, filtrar por mensagens enviadas pelo usuário

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  // Mensagens disponíveis para webhook
  const messageWebhooks = webhooks.filter(w => w.active && (w.event_type === 'custom' || w.event_type === 'bulk_message'));

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Central de Mensagens</h1>
        <p className="text-gray-600">Envie mensagens para seus contatos</p>
      </div>

      <Tabs defaultValue="message" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="message" className="flex-1">
            <MessageSquare className="h-4 w-4 mr-2" />
            Nova Mensagem
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex-1">
            <FileText className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-1">
            <Clock className="h-4 w-4 mr-2" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="message" className="space-y-6 mt-6">
          {/* Configuração da Mensagem */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                Mensagem
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Templates */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Template</label>
                <Select onValueChange={(value) => {
                  if (value !== 'none') {
                    const template = templates.find(t => t.id === value);
                    if (template) handleLoadTemplate(template);
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum template</SelectItem>
                    {activeTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Webhook Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  Método de Envio
                </label>
                <Select value={selectedWebhook} onValueChange={setSelectedWebhook}>
                  <SelectTrigger>
                    <SelectValue placeholder="WhatsApp Direto (padrão)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">WhatsApp Direto (padrão)</SelectItem>
                    {messageWebhooks.map(webhook => (
                      <SelectItem key={webhook.id} value={webhook.id}>
                        Webhook: {webhook.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {messageWebhooks.length === 0 && (
                  <p className="text-sm text-amber-600">
                    Para utilizar webhooks, configure-os em Configurações → Webhooks.
                  </p>
                )}
              </div>

              {/* Message Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Mensagem *</label>
                  <div className="flex items-center gap-2">
                    <EmojiPicker onEmojiSelect={handleAddEmoji} />
                    
                    <Dialog open={saveTemplateOpen} onOpenChange={setSaveTemplateOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Save className="h-4 w-4 mr-2" />
                          Salvar Template
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Salvar como Template</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Nome do Template *</label>
                            <Input
                              placeholder="Ex: Mensagem de Boas-vindas"
                              value={templateName}
                              onChange={(e) => setTemplateName(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Conteúdo do Template</label>
                            <Textarea
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              rows={5}
                              className="resize-none"
                              readOnly
                            />
                          </div>
                          <Button 
                            className="w-full" 
                            onClick={handleSaveTemplate}
                            disabled={!templateName.trim() || !message.trim()}
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Salvar Template
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <Textarea
                  placeholder="Digite sua mensagem..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500">
                  {message.length} caracteres | Aprox. {Math.ceil(message.length / 160)} SMS
                </p>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Select value={selectedCell} onValueChange={setSelectedCell}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as células" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as células</SelectItem>
                    {cells.map(cell => (
                      <SelectItem key={cell.id} value={cell.id}>
                        {cell.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStage} onValueChange={setSelectedStage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os estágios" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os estágios</SelectItem>
                    {pipelineStages.map(stage => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.name}
                      </SelectItem>
                    ))}
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
              
              <div className="relative">
                <Input
                  placeholder="Buscar por nome..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="pl-10"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
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
                  <Checkbox 
                    id="select-all" 
                    checked={isSelectAll} 
                    onCheckedChange={handleSelectAll} 
                  />
                  <label htmlFor="select-all" className="text-sm font-medium">
                    Selecionar todos
                  </label>
                </div>
              </div>
            </CardHeader>
            <CardContent className="py-0 my-0">
              <ScrollArea className="max-h-80 overflow-y-auto space-y-2">
                {contacts.map(contact => (
                  <div 
                    key={contact.id} 
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors my-2"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        checked={selectedContacts.includes(contact.id)} 
                        onCheckedChange={checked => handleContactSelect(contact.id, checked as boolean)} 
                      />
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-sm text-gray-600">{contact.whatsapp || 'Sem WhatsApp'}</p>
                        <p className="text-xs text-gray-500">{contact.neighborhood}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {contact.status === 'member' ? 'Membro' : contact.status === 'visitor' ? 'Visitante' : 'Pendente'}
                    </Badge>
                  </div>
                ))}
                {contacts.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    Nenhum contato encontrado com os filtros aplicados
                  </p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Enviar */}
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {selectedContacts.length} contato(s) selecionado(s)
                </div>
                <Button 
                  onClick={handleSendMessage} 
                  disabled={sending || selectedContacts.length === 0 || !message.trim()} 
                  size="lg" 
                  className="min-w-32"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Mensagem
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6 mt-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-amber-600" />
                Templates Disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[500px] overflow-y-auto">
                <div className="p-4 space-y-4">
                  {activeTemplates.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>Nenhum template disponível</p>
                      <p className="text-sm">Você pode criar templates salvando suas mensagens</p>
                    </div>
                  ) : (
                    activeTemplates.map(template => (
                      <div key={template.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="font-medium text-lg">{template.name}</h3>
                            <p className="text-xs text-gray-500">
                              Tipo: {template.template_type === 'custom' ? 'Personalizado' : template.template_type}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                setMessage(template.message);
                                setActiveTab('message');
                              }}
                            >
                              Usar
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir o template "{template.name}"? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteTemplate(template.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                        <div className="bg-gray-100 p-3 rounded text-sm whitespace-pre-wrap">
                          {template.message}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6 mt-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-purple-600" />
                Histórico de Mensagens
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[500px] overflow-y-auto">
                <div className="p-4 space-y-4">
                  {historyLoading ? (
                    <div className="text-center py-8">
                      <Loader className="h-8 w-8 mx-auto mb-2 text-gray-400 animate-spin" />
                      <p className="text-gray-500">Carregando histórico...</p>
                    </div>
                  ) : filteredHistory.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>Nenhuma mensagem no histórico</p>
                    </div>
                  ) : (
                    filteredHistory.map(item => (
                      <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-gray-500">
                                {format(new Date(item.sent_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              </p>
                              {item.status === 'sent' ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  <CheckCircle className="h-3 w-3 mr-1" /> Enviada
                                </Badge>
                              ) : item.status === 'partial' ? (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                  <AlertCircle className="h-3 w-3 mr-1" /> Parcial
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                  <AlertCircle className="h-3 w-3 mr-1" /> Falha
                                </Badge>
                              )}
                            </div>
                            <p className="font-medium mt-1">
                              Enviada para {item.recipients_count} contato(s)
                            </p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setMessage(item.message_content);
                              setActiveTab('message');
                            }}
                          >
                            Reutilizar
                          </Button>
                        </div>
                        <div className="bg-gray-100 p-3 rounded text-sm whitespace-pre-wrap mt-2">
                          {item.message_content}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
