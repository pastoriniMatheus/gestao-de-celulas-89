
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface City {
  id: string;
  name: string;
  state: string;
}

interface AddNeighborhoodDialogProps {
  cities: City[];
  onNeighborhoodAdded: () => void;
}

export const AddNeighborhoodDialog = ({ cities, onNeighborhoodAdded }: AddNeighborhoodDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    city_id: ''
  });
  
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.city_id || formData.city_id === "none") {
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
        .from('neighborhoods')
        .insert([{
          name: formData.name,
          city_id: formData.city_id
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Bairro adicionado com sucesso!",
      });

      setFormData({ name: '', city_id: '' });
      setIsOpen(false);
      onNeighborhoodAdded();
    } catch (error) {
      console.error('Erro ao criar bairro:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar bairro. Tente novamente.",
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
          Novo Bairro
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Bairro</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="city">Cidade *</Label>
            <Select 
              value={formData.city_id || "none"} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, city_id: value === "none" ? "" : value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Selecione a cidade</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name} - {city.state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="neighborhood-name">Nome do Bairro *</Label>
            <Input
              id="neighborhood-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Centro"
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
              {loading ? 'Criando...' : 'Criar Bairro'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
