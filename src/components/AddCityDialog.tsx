
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AddCityDialogProps {
  onCityAdded: () => void;
}

export const AddCityDialog = ({ onCityAdded }: AddCityDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    state: ''
  });
  
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.state) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('cities')
        .insert([{
          name: formData.name,
          state: formData.state.toUpperCase()
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Cidade adicionada com sucesso!",
      });

      setFormData({ name: '', state: '' });
      setIsOpen(false);
      onCityAdded();
    } catch (error) {
      console.error('Erro ao criar cidade:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar cidade. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Nova Cidade
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Cidade</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="city-name">Nome da Cidade *</Label>
            <Input
              id="city-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: São Paulo"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="state">Estado (UF) *</Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value.toUpperCase() }))}
              placeholder="Ex: SP"
              maxLength={2}
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Cidade'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
