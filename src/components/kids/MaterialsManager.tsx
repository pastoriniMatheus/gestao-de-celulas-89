
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Edit, Trash2, Download, FileText, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function MaterialsManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any>(null);
  const [formData, setFormData] = useState({
    file_name: '',
    category: '',
    file_url: '',
    file_type: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const queryClient = useQueryClient();

  const { data: materials = [], isLoading } = useQuery({
    queryKey: ['materials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const createMaterialMutation = useMutation({
    mutationFn: async (materialData: any) => {
      const { data, error } = await supabase
        .from('materials')
        .insert([materialData])
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success('Material adicionado com sucesso!');
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error('Erro ao adicionar material: ' + error.message);
    }
  });

  const updateMaterialMutation = useMutation({
    mutationFn: async ({ id, ...materialData }: any) => {
      const { data, error } = await supabase
        .from('materials')
        .update(materialData)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success('Material atualizado com sucesso!');
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error('Erro ao atualizar material: ' + error.message);
    }
  });

  const deleteMaterialMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success('Material removido com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao remover material: ' + error.message);
    }
  });

  const resetForm = () => {
    setFormData({
      file_name: '',
      category: '',
      file_url: '',
      file_type: ''
    });
    setSelectedFile(null);
    setEditingMaterial(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFormData({
        ...formData,
        file_name: file.name,
        file_type: file.type
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Para este exemplo, vamos simular o upload usando uma URL fictícia
    // Em um ambiente real, você faria o upload para o Supabase Storage
    let fileUrl = formData.file_url;
    
    if (selectedFile && !editingMaterial) {
      // Simular URL do arquivo (em produção, seria o upload real)
      fileUrl = `https://storage.supabase.co/v1/object/public/materials/${Date.now()}_${selectedFile.name}`;
    }
    
    const materialData = {
      ...formData,
      file_url: fileUrl
    };
    
    if (editingMaterial) {
      updateMaterialMutation.mutate({ id: editingMaterial.id, ...materialData });
    } else {
      createMaterialMutation.mutate(materialData);
    }
  };

  const handleEdit = (material: any) => {
    setEditingMaterial(material);
    setFormData({
      file_name: material.file_name,
      category: material.category,
      file_url: material.file_url,
      file_type: material.file_type || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover este material?')) {
      deleteMaterialMutation.mutate(id);
    }
  };

  const handleDownload = (material: any) => {
    // Em um ambiente real, isso abriria o arquivo ou iniciaria o download
    window.open(material.file_url, '_blank');
    toast.info('Abrindo arquivo...');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-700">Materiais de Apoio</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-slate-600 hover:bg-slate-700">
              <Plus className="w-4 h-4 mr-2" />
              Anexar Material
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingMaterial ? 'Editar Material' : 'Anexar Novo Material'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingMaterial && (
                <div>
                  <Label htmlFor="file">Selecionar Arquivo</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="file"
                      type="file"
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                      className="flex-1"
                    />
                    <Upload className="w-4 h-4 text-gray-500" />
                  </div>
                  {selectedFile && (
                    <div className="text-sm text-gray-600 mt-1">
                      Arquivo selecionado: {selectedFile.name}
                    </div>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="file_name">Nome do Arquivo</Label>
                <Input
                  id="file_name"
                  value={formData.file_name}
                  onChange={(e) => setFormData({ ...formData, file_name: e.target.value })}
                  required
                  placeholder="Nome para identificação"
                />
              </div>
              
              <div>
                <Label htmlFor="category">Categoria</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kids">Kids</SelectItem>
                    <SelectItem value="Jovens">Jovens</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editingMaterial && (
                <div>
                  <Label htmlFor="file_url">URL do Arquivo</Label>
                  <Input
                    id="file_url"
                    value={formData.file_url}
                    onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              )}
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-slate-600 hover:bg-slate-700">
                  {editingMaterial ? 'Atualizar' : 'Anexar'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
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
                <TableHead>Nome do Arquivo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : materials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    Nenhum material anexado
                  </TableCell>
                </TableRow>
              ) : (
                materials.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{material.file_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        material.category === 'Kids' 
                          ? 'bg-pink-100 text-pink-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {material.category}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {material.file_type ? material.file_type.split('/')[1]?.toUpperCase() : 'Arquivo'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {new Date(material.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(material)}
                          title="Baixar"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(material)}
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(material.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Excluir"
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
