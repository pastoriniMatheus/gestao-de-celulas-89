
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCities } from "@/hooks/useCities";
import { useNeighborhoods } from "@/hooks/useNeighborhoods";
import type { Cell } from "@/hooks/useCells";

interface Leader {
  id: string;
  name: string;
}

interface EditCellDialogProps {
  isOpen: boolean;
  onClose: () => void;
  cell: Cell;
  onCellUpdated: (cell: Cell) => void;
}

export const EditCellDialog = ({
  isOpen,
  onClose,
  cell,
  onCellUpdated,
}: EditCellDialogProps) => {
  const { cities } = useCities();
  const [selectedCityId, setSelectedCityId] = useState('');
  const { neighborhoods } = useNeighborhoods(selectedCityId);
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    leader_id: '',
    neighborhood_id: '',
    active: true,
    meeting_day: 0,
    meeting_time: '',
  });
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [saving, setSaving] = useState(false);

  // Inicializar dados do formulário
  useEffect(() => {
    if (isOpen && cell) {
      console.log('EditCellDialog: Inicializando formulário com célula:', cell);
      
      setFormData({
        name: cell.name || '',
        address: cell.address || '',
        leader_id: cell.leader_id || '',
        neighborhood_id: cell.neighborhood_id || '',
        active: cell.active !== undefined ? cell.active : true,
        meeting_day: cell.meeting_day !== undefined ? cell.meeting_day : 0,
        meeting_time: cell.meeting_time || '',
      });
      
      // Definir cidade selecionada baseado no bairro da célula
      if (cell.city_id) {
        setSelectedCityId(cell.city_id);
      } else if (cell.neighborhood_id) {
        // Buscar cidade do bairro
        const findCityForNeighborhood = async () => {
          try {
            const { data: neighborhood } = await supabase
              .from('neighborhoods')
              .select('city_id')
              .eq('id', cell.neighborhood_id)
              .single();
            
            if (neighborhood?.city_id) {
              setSelectedCityId(neighborhood.city_id);
            }
          } catch (error) {
            console.error('Erro ao buscar cidade do bairro:', error);
          }
        };
        findCityForNeighborhood();
      }
    }
  }, [isOpen, cell]);

  // Buscar líderes
  useEffect(() => {
    const fetchLeaders = async () => {
      if (!isOpen) return;
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, name")
          .in("role", ["admin", "leader"])
          .eq("active", true)
          .order("name");

        if (error) {
          console.error('Erro ao buscar líderes:', error);
          setLeaders([]);
        } else {
          setLeaders(data || []);
        }
      } catch (error) {
        console.error('Erro inesperado ao buscar líderes:', error);
        setLeaders([]);
      }
    };

    fetchLeaders();
  }, [isOpen]);

  const handleInputChange = (field: string, value: any) => {
    console.log(`Alterando ${field} para:`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCityChange = (cityId: string) => {
    if (cityId === "none") {
      setSelectedCityId('');
      setFormData(prev => ({
        ...prev,
        neighborhood_id: ''
      }));
    } else {
      setSelectedCityId(cityId);
      setFormData(prev => ({
        ...prev,
        neighborhood_id: ''
      }));
    }
  };

  const handleNeighborhoodChange = (neighborhoodId: string) => {
    if (neighborhoodId === "none") {
      setFormData(prev => ({
        ...prev,
        neighborhood_id: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        neighborhood_id: neighborhoodId
      }));
    }
  };

  const handleLeaderChange = (leaderId: string) => {
    if (leaderId === "none") {
      setFormData(prev => ({
        ...prev,
        leader_id: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        leader_id: leaderId
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('EditCellDialog: Iniciando salvamento com dados:', formData);
    
    // Validações básicas
    if (!formData.name?.trim()) {
      toast({ 
        title: "Erro",
        description: "Nome da célula é obrigatório.",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.address?.trim()) {
      toast({ 
        title: "Erro",
        description: "Endereço da célula é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      // Preparar dados para atualização - apenas campos que existem na tabela cells
      const updateData = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        leader_id: formData.leader_id || null,
        neighborhood_id: formData.neighborhood_id || null,
        active: formData.active,
        meeting_day: Number(formData.meeting_day),
        meeting_time: formData.meeting_time,
        updated_at: new Date().toISOString()
      };

      console.log('EditCellDialog: Atualizando célula ID:', cell.id);
      console.log('EditCellDialog: Dados de atualização:', updateData);

      // Realizar atualização diretamente
      const { data: updatedData, error: updateError } = await supabase
        .from("cells")
        .update(updateData)
        .eq("id", cell.id)
        .select(`
          *,
          neighborhoods!cells_neighborhood_id_fkey (
            id,
            name,
            city_id,
            cities!neighborhoods_city_id_fkey (
              id,
              name,
              state
            )
          ),
          profiles!cells_leader_id_fkey (
            id,
            name
          )
        `)
        .single();

      if (updateError) {
        console.error('EditCellDialog: Erro na atualização:', updateError);
        throw new Error(`Erro ao atualizar célula: ${updateError.message}`);
      }

      if (!updatedData) {
        throw new Error('Nenhum dado foi retornado após a atualização');
      }

      console.log('EditCellDialog: Atualização realizada com sucesso:', updatedData);

      // Transformar dados para o formato esperado
      const transformedData = {
        ...updatedData,
        leader_name: updatedData.profiles?.name || null,
        neighborhood_name: updatedData.neighborhoods?.name || null,
        city_id: updatedData.neighborhoods?.cities?.id || null,
        city_name: updatedData.neighborhoods?.cities?.name || null
      };

      console.log('EditCellDialog: Dados transformados:', transformedData);

      toast({
        title: "Sucesso",
        description: "Célula atualizada com sucesso!",
      });

      // Notificar componente pai sobre a atualização
      onCellUpdated(transformedData);
      onClose();
      
    } catch (error: any) {
      console.error('EditCellDialog: Erro inesperado:', error);
      toast({
        title: "Erro",
        description: error?.message || "Erro desconhecido ao salvar célula",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Editar Célula</AlertDialogTitle>
          <AlertDialogDescription>
            Atualize os dados da célula.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="address">Endereço *</Label>
            <Input
              type="text"
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label>Cidade</Label>
            <Select 
              value={selectedCityId || "none"} 
              onValueChange={handleCityChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma cidade</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name} - {city.state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Bairro</Label>
            <Select 
              value={formData.neighborhood_id || "none"} 
              onValueChange={handleNeighborhoodChange}
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

          <div className="grid gap-2">
            <Label>Líder da Célula</Label>
            <Select 
              value={formData.leader_id || "none"} 
              onValueChange={handleLeaderChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um líder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum líder</SelectItem>
                {leaders.map((leader) => (
                  <SelectItem key={leader.id} value={leader.id}>
                    {leader.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="meeting_day">Dia da reunião *</Label>
            <Select 
              value={String(formData.meeting_day)} 
              onValueChange={(value) => handleInputChange('meeting_day', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o dia da semana" />
              </SelectTrigger>
              <SelectContent>
                {weekDays.map((day, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="meeting_time">Horário da reunião *</Label>
            <Input
              type="time"
              id="meeting_time"
              value={formData.meeting_time}
              onChange={(e) => handleInputChange('meeting_time', e.target.value)}
              required
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => handleInputChange('active', e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="active">Ativo</Label>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving} type="button">Cancelar</AlertDialogCancel>
            <Button type="submit" disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
};
