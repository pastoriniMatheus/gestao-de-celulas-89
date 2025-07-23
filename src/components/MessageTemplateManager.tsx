
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, MessageSquare } from 'lucide-react';
import { useMessageTemplates, MessageTemplate } from '@/hooks/useMessageTemplates';

export const MessageTemplateManager = () => {
  const { templates, loading, addTemplate, updateTemplate, deleteTemplate } = useMessageTemplates();
  const [isOpen, setIsOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    template_type: 'custom' as 'birthday' | 'welcome' | 'reminder' | 'custom',
    subject: '',
    message: '',
    variables: [] as string[],
    active: true
  });

  const resetForm = () => {
    setFormData({
      name: '',
      template_type: 'custom',
      subject: '',
      message: '',
      variables: [],
      active: true
    });
    setEditingTemplate(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, formData);
      } else {
        await addTemplate(formData);
      }
      resetForm();
      setIsOpen(false);
    } catch (error) {
      console.error('Erro ao salvar template:', error);
    }
  };

  const handleEdit = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      template_type: template.template_type,
      subject: template.subject || '',
      message: template.message,
      variables: template.variables,
      active: template.active
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar este template?')) {
      await deleteTemplate(id);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Templates de Mensagem
          </CardTitle>
          <CardDescription>
            Gerencie templates para diferentes tipos de mensagens
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Template
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingTemplate ? 'Editar Template' : 'Novo Template'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="template-name">Nome do Template</Label>
                      <Input
                        id="template-name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Nome do template"
                      />
                    </div>
                    <div>
                      <Label htmlFor="template-type">Tipo</Label>
                      <Select
                        value={formData.template_type}
                        onValueChange={(value: any) => setFormData({...formData, template_type: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="birthday">Aniversário</SelectItem>
                          <SelectItem value="welcome">Boas-vindas</SelectItem>
                          <SelectItem value="reminder">Lembrete</SelectItem>
                          <SelectItem value="custom">Personalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="template-subject">Assunto (opcional)</Label>
                    <Input
                      id="template-subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      placeholder="Assunto da mensagem"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="template-message">Mensagem</Label>
                    <Textarea
                      id="template-message"
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder="Digite sua mensagem aqui. Use {{nome}} para variáveis."
                      rows={6}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="template-active"
                      checked={formData.active}
                      onCheckedChange={(checked) => setFormData({...formData, active: checked})}
                    />
                    <Label htmlFor="template-active">Template ativo</Label>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSubmit}>
                      {editingTemplate ? 'Atualizar' : 'Criar'} Template
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            {loading ? (
              <div className="text-center py-4">Carregando templates...</div>
            ) : (
              <div className="space-y-2">
                {templates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{template.name}</h3>
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {template.template_type}
                        </span>
                        {!template.active && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                            Inativo
                          </span>
                        )}
                      </div>
                      {template.subject && (
                        <p className="text-sm text-gray-600 mt-1">Assunto: {template.subject}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {template.message}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(template)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
