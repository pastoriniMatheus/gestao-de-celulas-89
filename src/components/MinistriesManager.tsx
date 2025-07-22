
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Edit, Trash2, UserPlus } from 'lucide-react';
import { useMinistries } from '@/hooks/useMinistries';
import { useContacts } from '@/hooks/useContacts';
import { MinistryMembersDialog } from './MinistryMembersDialog';

export const MinistriesManager = () => {
  const { ministries, loading, createMinistry, updateMinistry, deleteMinistry } = useMinistries();
  const { contacts } = useContacts();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  const [selectedMinistry, setSelectedMinistry] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    leader_id: '',
    description: ''
  });

  const handleCreateMinistry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMinistry(formData);
      setIsCreateDialogOpen(false);
      setFormData({ name: '', leader_id: '', description: '' });
    } catch (error) {
      console.error('Erro ao criar ministério:', error);
    }
  };

  const handleEditMinistry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMinistry) return;
    
    try {
      await updateMinistry(selectedMinistry.id, formData);
      setIsEditDialogOpen(false);
      setSelectedMinistry(null);
      setFormData({ name: '', leader_id: '', description: '' });
    } catch (error) {
      console.error('Erro ao atualizar ministério:', error);
    }
  };

  const handleDeleteMinistry = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este ministério?')) {
      try {
        await deleteMinistry(id);
      } catch (error) {
        console.error('Erro ao remover ministério:', error);
      }
    }
  };

  const openEditDialog = (ministry: any) => {
    setSelectedMinistry(ministry);
    setFormData({
      name: ministry.name,
      leader_id: ministry.leader_id || '',
      description: ministry.description || ''
    });
    setIsEditDialogOpen(true);
  };

  const openMembersDialog = (ministry: any) => {
    setSelectedMinistry(ministry);
    setIsMembersDialogOpen(true);
  };

  // Filtrar contatos para mostrar apenas membros ativos
  const availableLeaders = contacts.filter(contact => 
    contact.status === 'member' || contact.status === 'leader'
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando ministérios...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Users className="h-6 w-6 text-purple-600" />
                Gerenciamento de Ministérios
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Gerencie os ministérios da igreja, seus líderes e membros
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Ministério
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Ministério</DialogTitle>
                  <DialogDescription>
                    Preencha as informações do novo ministério
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateMinistry} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome do Ministério</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Ex: Ministério de Louvor"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="leader">Líder</Label>
                    <Select value={formData.leader_id} onValueChange={(value) => setFormData({...formData, leader_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um líder" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sem líder</SelectItem>
                        {availableLeaders.map((contact) => (
                          <SelectItem key={contact.id} value={contact.id}>
                            {contact.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Descrição do ministério..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                      Criar Ministério
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ministries.map((ministry) => (
          <Card key={ministry.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{ministry.name}</CardTitle>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openMembersDialog(ministry)}
                  >
                    <UserPlus className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(ministry)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteMinistry(ministry.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
              {ministry.description && (
                <CardDescription>{ministry.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Líder:</span>
                  <span className="text-sm">
                    {ministry.leader?.name || 'Sem líder'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Membros:</span>
                  <Badge variant="secondary">
                    {ministry.member_count || 0}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Ministério</DialogTitle>
            <DialogDescription>
              Atualize as informações do ministério
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditMinistry} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nome do Ministério</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Ministério de Louvor"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="edit-leader">Líder</Label>
              <Select value={formData.leader_id} onValueChange={(value) => setFormData({...formData, leader_id: value === 'none' ? '' : value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um líder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem líder</SelectItem>
                  {availableLeaders.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Descrição do ministério..."
                rows={3}
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                Salvar Alterações
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Membros */}
      {selectedMinistry && (
        <MinistryMembersDialog
          ministry={selectedMinistry}
          isOpen={isMembersDialogOpen}
          onClose={() => {
            setIsMembersDialogOpen(false);
            setSelectedMinistry(null);
          }}
        />
      )}
    </div>
  );
};
