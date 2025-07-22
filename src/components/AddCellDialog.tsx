
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus } from 'lucide-react';
import { useCells } from '@/hooks/useCells';
import { useCities } from '@/hooks/useCities';
import { useNeighborhoods } from '@/hooks/useNeighborhoods';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const AddCellDialog = () => {
  const { addCell } = useCells();
  const { cities } = useCities();
  const [open, setOpen] = useState(false);
  const [leaders, setLeaders] = useState<any[]>([]);
  const [selectedCityId, setSelectedCityId] = useState('');
  const { neighborhoods } = useNeighborhoods(selectedCityId);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    meeting_day: '',
    meeting_time: '',
    leader_id: '',
    neighborhood_id: '',
    active: true
  });

  const weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, email, role')
          .in('role', ['admin', 'leader'])
          .eq('active', true)
          .order('name');

        if (error) throw error;
        setLeaders(data || []);
      } catch (error) {
        console.error('Erro ao buscar líderes:', error);
      }
    };

    if (open) {
      fetchLeaders();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.address || !formData.meeting_day || !formData.meeting_time) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      await addCell({
        name: formData.name,
        address: formData.address,
        meeting_day: parseInt(formData.meeting_day),
        meeting_time: formData.meeting_time,
        leader_id: formData.leader_id || null,
        neighborhood_id: formData.neighborhood_id || null,
        active: formData.active
      });

      toast({
        title: "Sucesso",
        description: "Célula criada com sucesso!"
      });

      setFormData({
        name: '',
        address: '',
        meeting_day: '',
        meeting_time: '',
        leader_id: '',
        neighborhood_id: '',
        active: true
      });
      
      setSelectedCityId('');
      setOpen(false);
    } catch (error: any) {
      console.error('Erro ao criar célula:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar célula",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nova Célula
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Nova Célula</DialogTitle>
          <DialogDescription>
            Preencha as informações da nova célula
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome da Célula *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Célula da Paz"
              required
            />
          </div>

          <div>
            <Label htmlFor="address">Endereço *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Endereço completo"
              required
            />
          </div>

          <div>
            <Label htmlFor="city">Cidade</Label>
            <Select 
              value={selectedCityId || "none"} 
              onValueChange={(value) => {
                const cityId = value === "none" ? "" : value;
                setSelectedCityId(cityId);
                setFormData(prev => ({ ...prev, neighborhood_id: '' }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Selecione uma cidade</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name} - {city.state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="neighborhood">Bairro</Label>
            <Select 
              value={formData.neighborhood_id || "none"} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, neighborhood_id: value === "none" ? "" : value }))}
              disabled={!selectedCityId}
            >
              <SelectTrigger>
                <SelectValue placeholder={selectedCityId ? "Selecione o bairro" : "Primeiro selecione uma cidade"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum bairro</SelectItem>
                {neighborhoods.map((neighborhood) => (
                  <SelectItem key={neighborhood.id} value={neighborhood.id}>
                    {neighborhood.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="leader">Líder</Label>
            <Select 
              value={formData.leader_id || "none"} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, leader_id: value === "none" ? "" : value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o líder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum líder</SelectItem>
                {leaders.map((leader) => (
                  <SelectItem key={leader.id} value={leader.id}>
                    {leader.name} ({leader.role === 'admin' ? 'Admin' : 'Líder'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="meeting_day">Dia da Reunião *</Label>
              <Select 
                value={formData.meeting_day || "day_none"} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, meeting_day: value === "day_none" ? "" : value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o dia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day_none">Selecione o dia</SelectItem>
                  {weekDays.map((day, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="meeting_time">Horário *</Label>
              <Input
                id="meeting_time"
                type="time"
                value={formData.meeting_time}
                onChange={(e) => setFormData(prev => ({ ...prev, meeting_time: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
            />
            <Label htmlFor="active">Célula ativa</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Criar Célula
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
