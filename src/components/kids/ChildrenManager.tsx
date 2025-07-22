import { useIsMobile } from '@/hooks/use-mobile';
import { MobileChildrenManager } from './MobileChildrenManager';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Calendar, AlertTriangle, Utensils } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function ChildrenManager() {
  const isMobile = useIsMobile();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    birth_date: '',
    class: '',
    type: '',
    parent_contact_id: '',
    is_autistic: false,
    has_food_restriction: false,
    food_restriction_details: ''
  });
  const queryClient = useQueryClient();

  const { data: children = [], isLoading } = useQuery({
    queryKey: ['children'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('children')
        .select(`
          *,
          parent_contact:contacts(name)
        `)
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts-for-parents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  const createChildMutation = useMutation({
    mutationFn: async (childData: any) => {
      const { data, error } = await supabase
        .from('children')
        .insert([childData])
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children'] });
      toast.success('Criança cadastrada com sucesso!');
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error('Erro ao cadastrar criança: ' + error.message);
    }
  });

  const updateChildMutation = useMutation({
    mutationFn: async ({ id, ...childData }: any) => {
      const { data, error } = await supabase
        .from('children')
        .update(childData)
        .eq('id', id)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children'] });
      toast.success('Criança atualizada com sucesso!');
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error('Erro ao atualizar criança: ' + error.message);
    }
  });

  const deleteChildMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children'] });
      toast.success('Criança removida com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao remover criança: ' + error.message);
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      birth_date: '',
      class: '',
      type: '',
      parent_contact_id: '',
      is_autistic: false,
      has_food_restriction: false,
      food_restriction_details: ''
    });
    setEditingChild(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingChild) {
      updateChildMutation.mutate({ id: editingChild.id, ...formData });
    } else {
      createChildMutation.mutate(formData);
    }
  };

  const handleEdit = (child: any) => {
    setEditingChild(child);
    setFormData({
      name: child.name,
      birth_date: child.birth_date,
      class: child.class,
      type: child.type,
      parent_contact_id: child.parent_contact_id || '',
      is_autistic: child.is_autistic || false,
      has_food_restriction: child.has_food_restriction || false,
      food_restriction_details: child.food_restriction_details || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover esta criança?')) {
      deleteChildMutation.mutate(id);
    }
  };

  // Renderização condicional APÓS todos os hooks
  if (isMobile) {
    return <MobileChildrenManager />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-pink-700 py-[12px]">Gerenciar Crianças</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-pink-600 hover:bg-pink-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Criança
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingChild ? 'Editar Criança' : 'Nova Criança'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="birth_date">Data de Nascimento</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="class">Turma</Label>
                <Select value={formData.class} onValueChange={(value) => setFormData({ ...formData, class: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a turma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Berçário">Berçário</SelectItem>
                    <SelectItem value="Jardim">Jardim</SelectItem>
                    <SelectItem value="Pré-Adolescentes">Pré-Adolescentes</SelectItem>
                    <SelectItem value="Adolescentes">Adolescentes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Membro">Membro</SelectItem>
                    <SelectItem value="Visitante">Visitante</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="parent_contact_id">Pais/Responsáveis</Label>
                <Select value={formData.parent_contact_id} onValueChange={(value) => setFormData({ ...formData, parent_contact_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione os pais" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map(contact => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_autistic"
                  checked={formData.is_autistic}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_autistic: checked === true })}
                />
                <Label htmlFor="is_autistic" className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  É autista
                </Label>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has_food_restriction"
                    checked={formData.has_food_restriction}
                    onCheckedChange={(checked) => setFormData({ ...formData, has_food_restriction: checked === true })}
                  />
                  <Label htmlFor="has_food_restriction" className="flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-orange-600" />
                    Restrição alimentar
                  </Label>
                </div>
                
                {formData.has_food_restriction && (
                  <div>
                    <Label htmlFor="food_restriction_details">Detalhes da restrição alimentar</Label>
                    <Textarea
                      id="food_restriction_details"
                      value={formData.food_restriction_details}
                      onChange={(e) => setFormData({ ...formData, food_restriction_details: e.target.value })}
                      placeholder="Descreva as restrições alimentares..."
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-pink-600 hover:bg-pink-700">
                  {editingChild ? 'Atualizar' : 'Cadastrar'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Data de Nascimento</TableHead>
                <TableHead>Turma</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Pais</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : children.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Nenhuma criança cadastrada
                  </TableCell>
                </TableRow>
              ) : (
                children.map((child) => (
                  <TableRow key={child.id}>
                    <TableCell className="font-medium">{child.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(child.birth_date).toLocaleDateString('pt-BR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-pink-100 text-pink-800 rounded-full text-sm">
                        {child.class}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        child.type === 'Membro' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {child.type}
                      </span>
                    </TableCell>
                    <TableCell>{child.parent_contact?.name || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {child.is_autistic && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                            <AlertTriangle className="w-3 h-3" />
                            Autista
                          </span>
                        )}
                        {child.has_food_restriction && (
                          <span 
                            className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs cursor-help"
                            title={child.food_restriction_details || 'Restrição alimentar'}
                          >
                            <Utensils className="w-3 h-3" />
                            Restrição
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(child)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(child.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
