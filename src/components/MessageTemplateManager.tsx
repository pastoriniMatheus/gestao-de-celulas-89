
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, MessageSquare } from 'lucide-react';
import { useMessageTemplates } from '@/hooks/useMessageTemplates';
import { useToast } from '@/hooks/use-toast';

export const MessageTemplateManager = () => {
  const { templates, loading, addTemplate, updateTemplate, deleteTemplate } = useMessageTemplates();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    template_type: 'custom' as 'custom' | 'birthday' | 'welcome' | 'reminder',
    subject: '',
    message: '',
    variables: [] as string[]
  });

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addTemplate({
        ...formData,
        active: true
      });
      setIsCreateDialogOpen(false);
      setFormData({ name: '', template_type: 'custom', subject: '', message: '', variables: [] });
      toast({
        title: "Sucesso",
        description: "Template criado com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar template",
        variant: "destructive"
      });
    }
  };

  const handleEditTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;
    
    try {
      await updateTemplate(selectedTemplate.id, formData);
      setIsEditDialogOpen(false);
      setSelectedTemplate(null);
      setFormData({ name: '', template_type: 'custom', subject: '', message: '', variables: [] });
      toast({
        title: "Sucesso",
        description: "Template atualizado com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar template",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTemplate = async (templateId: string, templateName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o template "${templateName}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      await deleteTemplate(templateId);
      toast({
        title: "Sucesso",
        description: "Template excluído com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir template",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (template: any) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      template_type: template.template_type,
      subject: template.subject || '',
      message: template.message,
      variables: template.variables || []
    });
    setIsEditDialogOpen(true);
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      custom: 'bg-blue-100 text-blue-800',
      birthday: 'bg-pink-100 text-pink-800',
      welcome: 'bg-green-100 text-green-800',
      reminder: 'bg-orange-100 text-orange-800'
    };

    const labels = {
      custom: 'Personalizado',
      birthday: 'Aniversário',
      welcome: 'Boas-vindas',
      reminder: 'Lembrete'
    };

    return (
      <Badge className={variants[type as keyof typeof variants] || variants.custom}>
        {labels[type as keyof typeof labels] || type}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando templates...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                Templates de Mensagens
              </CardTitle>
              <CardDescription>
                Gerencie templates para envio de mensagens automáticas
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Novo Template</DialogTitle>
                  <DialogDescription>
                    Crie um template para envio de mensagens
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateTemplate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome do Template</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Ex: Boas-vindas à célula"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Tipo</Label>
                      <Select value={formData.template_type} onValueChange={(value) => setFormData({...formData, template_type: value as any})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="custom">Personalizado</SelectItem>
                          <SelectItem value="birthday">Aniversário</SelectItem>
                          <SelectItem value="welcome">Boas-vindas</SelectItem>
                          <SelectItem value="reminder">Lembrete</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="subject">Assunto (opcional)</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      placeholder="Assunto da mensagem"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Mensagem</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder="Escreva sua mensagem aqui..."
                      rows={4}
                      required
                    />
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      Criar Template
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Assunto</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>{getTypeBadge(template.template_type)}</TableCell>
                    <TableCell>{template.subject || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={template.active ? "default" : "secondary"}>
                        {template.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(template)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteTemplate(template.id, template.name)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Template</DialogTitle>
            <DialogDescription>
              Atualize as informações do template
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditTemplate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Nome do Template</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Boas-vindas à célula"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-type">Tipo</Label>
                <Select value={formData.template_type} onValueChange={(value) => setFormData({...formData, template_type: value as any})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Personalizado</SelectItem>
                    <SelectItem value="birthday">Aniversário</SelectItem>
                    <SelectItem value="welcome">Boas-vindas</SelectItem>
                    <SelectItem value="reminder">Lembrete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-subject">Assunto (opcional)</Label>
              <Input
                id="edit-subject"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                placeholder="Assunto da mensagem"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-message">Mensagem</Label>
              <Textarea
                id="edit-message"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                placeholder="Escreva sua mensagem aqui..."
                rows={4}
                required
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Salvar Alterações
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
