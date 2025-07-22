import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Calendar, AlertTriangle, Utensils, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
export function MobileChildrenManager() {
  const [showForm, setShowForm] = useState(false);
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
  const {
    data: children = []
  } = useQuery({
    queryKey: ['children'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('children').select(`
          *,
          parent_contact:contacts(name)
        `).order('name');
      if (error) throw error;
      return data;
    }
  });
  const {
    data: contacts = []
  } = useQuery({
    queryKey: ['contacts-for-parents'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('contacts').select('id, name').order('name');
      if (error) throw error;
      return data;
    }
  });
  const createChildMutation = useMutation({
    mutationFn: async (childData: any) => {
      const {
        data,
        error
      } = await supabase.from('children').insert([childData]).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['children']
      });
      toast.success('Criança cadastrada!');
      resetForm();
      setShowForm(false);
    },
    onError: error => {
      toast.error('Erro: ' + error.message);
    }
  });
  const updateChildMutation = useMutation({
    mutationFn: async ({
      id,
      ...childData
    }: any) => {
      const {
        data,
        error
      } = await supabase.from('children').update(childData).eq('id', id).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['children']
      });
      toast.success('Criança atualizada!');
      resetForm();
      setShowForm(false);
    },
    onError: error => {
      toast.error('Erro: ' + error.message);
    }
  });
  const deleteChildMutation = useMutation({
    mutationFn: async (id: string) => {
      const {
        error
      } = await supabase.from('children').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['children']
      });
      toast.success('Criança removida!');
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
      updateChildMutation.mutate({
        id: editingChild.id,
        ...formData
      });
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
    setShowForm(true);
  };
  const handleDelete = (id: string) => {
    if (confirm('Remover esta criança?')) {
      deleteChildMutation.mutate(id);
    }
  };
  if (showForm) {
    return <div className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-pink-700">
            {editingChild ? 'Editar' : 'Nova'} Criança
          </h3>
          <Button size="sm" variant="ghost" onClick={() => {
          setShowForm(false);
          resetForm();
        }}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label className="text-xs">Nome</Label>
            <Input value={formData.name} onChange={e => setFormData({
            ...formData,
            name: e.target.value
          })} className="h-8 text-sm" required />
          </div>

          <div>
            <Label className="text-xs">Data de Nascimento</Label>
            <Input type="date" value={formData.birth_date} onChange={e => setFormData({
            ...formData,
            birth_date: e.target.value
          })} className="h-8 text-sm" required />
          </div>

          <div>
            <Label className="text-xs">Turma</Label>
            <Select value={formData.class} onValueChange={value => setFormData({
            ...formData,
            class: value
          })}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Selecione" />
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
            <Label className="text-xs">Tipo</Label>
            <Select value={formData.type} onValueChange={value => setFormData({
            ...formData,
            type: value
          })}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Membro">Membro</SelectItem>
                <SelectItem value="Visitante">Visitante</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Pais/Responsáveis</Label>
            <Select value={formData.parent_contact_id} onValueChange={value => setFormData({
            ...formData,
            parent_contact_id: value
          })}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {contacts.map(contact => <SelectItem key={contact.id} value={contact.id}>
                    {contact.name}
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="is_autistic" checked={formData.is_autistic} onCheckedChange={checked => setFormData({
            ...formData,
            is_autistic: checked === true
          })} />
            <Label htmlFor="is_autistic" className="text-xs flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-yellow-600" />
              Autista
            </Label>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="has_food_restriction" checked={formData.has_food_restriction} onCheckedChange={checked => setFormData({
              ...formData,
              has_food_restriction: checked === true
            })} />
              <Label htmlFor="has_food_restriction" className="text-xs flex items-center gap-1">
                <Utensils className="w-3 h-3 text-orange-600" />
                Restrição alimentar
              </Label>
            </div>
            
            {formData.has_food_restriction && <Textarea value={formData.food_restriction_details} onChange={e => setFormData({
            ...formData,
            food_restriction_details: e.target.value
          })} placeholder="Detalhes da restrição..." className="text-xs h-16 resize-none" />}
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" size="sm" className="flex-1 bg-pink-600 hover:bg-pink-700 h-8 text-xs">
              {editingChild ? 'Atualizar' : 'Cadastrar'}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => {
            setShowForm(false);
            resetForm();
          }} className="h-8 text-xs">
              Cancelar
            </Button>
          </div>
        </form>
      </div>;
  }
  return <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-pink-700">
          Crianças ({children.length})
        </h3>
        <Button size="sm" onClick={() => setShowForm(true)} className="bg-pink-600 hover:bg-pink-700 h-7 text-xs px-2">
          <Plus className="w-3 h-3 mr-1" />
          Nova
        </Button>
      </div>

      <div className="space-y-1.5">
        {children.map(child => <Card key={child.id} className="border border-pink-100">
            <CardContent className="p-2 px-[8px]">
              <div className="space-y-1">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{child.name}</h4>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-600">
                        {new Date(child.birth_date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(child)} className="h-6 w-6 p-0">
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(child.id)} className="h-6 w-6 p-0 text-red-600 hover:text-red-700">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <span className="px-1.5 py-0.5 bg-pink-100 text-pink-800 rounded text-xs">
                    {child.class}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-xs ${child.type === 'Membro' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                    {child.type}
                  </span>
                </div>

                {child.parent_contact?.name && <p className="text-xs text-gray-600">
                    Pais: {child.parent_contact.name}
                  </p>}

                {(child.is_autistic || child.has_food_restriction) && <div className="flex gap-1 mt-1 my-px">
                    {child.is_autistic && <span className="flex items-center gap-1 px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        Autista
                      </span>}
                    {child.has_food_restriction && <span className="flex items-center gap-1 px-1.5 py-0.5 bg-orange-100 text-orange-800 rounded text-xs cursor-help" title={child.food_restriction_details || 'Restrição alimentar'}>
                        <Utensils className="w-2.5 h-2.5" />
                        Restrição
                      </span>}
                  </div>}
              </div>
            </CardContent>
          </Card>)}

        {children.length === 0 && <Card className="border-dashed border-2 border-gray-200">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500">Nenhuma criança cadastrada</p>
              <Button size="sm" onClick={() => setShowForm(true)} className="mt-2 bg-pink-600 hover:bg-pink-700 text-xs">
                Cadastrar primeira criança
              </Button>
            </CardContent>
          </Card>}
      </div>
    </div>;
}