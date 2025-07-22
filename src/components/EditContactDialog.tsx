
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useCells } from '@/hooks/useCells';
import { useCities } from '@/hooks/useCities';
import { useContacts } from '@/hooks/useContacts';
import { useMinistries } from '@/hooks/useMinistries';
import { useNeighborhoodsByCity } from '@/hooks/useNeighborhoodsByCity';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PhotoUpload } from './PhotoUpload';

interface EditContactDialogProps {
  contact: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (updatedContact: any) => void;
}

export const EditContactDialog = ({
  contact,
  isOpen,
  onClose,
  onUpdate
}: EditContactDialogProps) => {
  const { cells } = useCells();
  const { cities } = useCities();
  const { contacts, updateContact } = useContacts();
  const { ministries } = useMinistries();
  const { toast } = useToast();
  const { isAdmin } = useUserPermissions();

  // Buscar líderes (profiles) para o campo "Indicado por"
  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, role')
        .eq('active', true)
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  const { data: pipelineStages = [] } = useQuery({
    queryKey: ['pipeline-stages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pipeline_stages')
        .select('*')
        .eq('active', true)
        .order('position');
      if (error) throw error;
      return data;
    }
  });

  // Buscar todos os bairros para mapear cidade
  const { data: allNeighborhoods = [] } = useQuery({
    queryKey: ['all-neighborhoods'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('neighborhoods')
        .select('*')
        .eq('active', true)
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  // Estado do formulário com valores padrão
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    neighborhood: '',
    city_id: '',
    cell_id: '',
    ministry_id: '',
    status: 'pending',
    encounter_with_god: false,
    baptized: false,
    pipeline_stage_id: '',
    age: null as number | null,
    birth_date: '',
    referred_by: '',
    photo_url: '',
    founder: false,
    leader_id: ''
  });

  // Hook para buscar bairros baseado na cidade selecionada
  const { neighborhoods } = useNeighborhoodsByCity(formData.city_id);

  // Função para encontrar a cidade de um bairro
  const findCityByNeighborhood = useCallback((neighborhoodName: string) => {
    const neighborhood = allNeighborhoods.find(n => n.name === neighborhoodName);
    return neighborhood ? neighborhood.city_id : '';
  }, [allNeighborhoods]);

  // Resetar formulário quando o dialog for fechado
  const resetForm = useCallback(() => {
    console.log('EditContactDialog: Resetando formulário');
    setFormData({
      name: '',
      whatsapp: '',
      neighborhood: '',
      city_id: '',
      cell_id: '',
      ministry_id: '',
      status: 'pending',
      encounter_with_god: false,
      baptized: false,
      pipeline_stage_id: '',
      age: null,
      birth_date: '',
      referred_by: '',
      photo_url: '',
      founder: false,
      leader_id: ''
    });
  }, []);

  // Carregar dados do contato sempre que o dialog abrir com um novo contato
  const loadContactData = useCallback(() => {
    if (!contact || !isOpen) {
      console.log('EditContactDialog: Não há contato ou dialog está fechado');
      return;
    }

    console.log('EditContactDialog: Carregando dados do contato', contact.id, contact.name);
    
    // Determinar city_id - primeiro tenta usar o city_id do contato, senão mapeia pelo bairro
    let cityId = contact.city_id || '';
    if (!cityId && contact.neighborhood && allNeighborhoods.length > 0) {
      cityId = findCityByNeighborhood(contact.neighborhood);
      console.log('EditContactDialog: Cidade mapeada pelo bairro:', { neighborhood: contact.neighborhood, cityId });
    }
    
    // Carregar TODOS os dados do contato
    const newFormData = {
      name: contact.name || '',
      whatsapp: contact.whatsapp || '',
      neighborhood: contact.neighborhood || '',
      city_id: cityId,
      cell_id: contact.cell_id || '',
      ministry_id: contact.ministry_id || '',
      status: contact.status || 'pending',
      encounter_with_god: Boolean(contact.encounter_with_god),
      baptized: Boolean(contact.baptized),
      pipeline_stage_id: contact.pipeline_stage_id || '',
      age: contact.age || null,
      birth_date: contact.birth_date || '',
      referred_by: contact.referred_by || '',
      photo_url: contact.photo_url || '',
      founder: Boolean(contact.founder),
      leader_id: contact.leader_id || ''
    };

    console.log('EditContactDialog: Carregando dados:', newFormData);
    setFormData(newFormData);
  }, [contact, isOpen, allNeighborhoods, findCityByNeighborhood]);

  // Effect para gerenciar abertura/fechamento do dialog
  useEffect(() => {
    console.log('EditContactDialog: Effect principal - isOpen:', isOpen, 'contactId:', contact?.id);
    
    if (!isOpen) {
      // Dialog fechado - resetar formulário
      resetForm();
      return;
    }

    if (!contact) {
      console.log('EditContactDialog: Sem contato para carregar');
      return;
    }

    // Dialog aberto com contato - aguardar dados necessários carregarem
    if (allNeighborhoods.length === 0) {
      console.log('EditContactDialog: Aguardando neighborhoods carregarem...');
      return;
    }

    // Carregar dados do contato
    loadContactData();
  }, [isOpen, contact, allNeighborhoods.length, loadContactData, resetForm]);

  // Effect adicional para garantir que os dados sejam carregados quando neighborhoods chegarem
  useEffect(() => {
    if (isOpen && contact && allNeighborhoods.length > 0) {
      console.log('EditContactDialog: Neighborhoods carregados, recarregando dados do contato');
      loadContactData();
    }
  }, [allNeighborhoods.length, isOpen, contact, loadContactData]);

  const handlePhotoChange = (photoUrl: string | null) => {
    setFormData(prev => ({ ...prev, photo_url: photoUrl || '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos obrigatórios
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório!",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.whatsapp.trim()) {
      toast({
        title: "Erro",
        description: "WhatsApp é obrigatório!",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.neighborhood.trim()) {
      toast({
        title: "Erro",
        description: "Bairro é obrigatório!",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('EditContactDialog: Enviando dados para atualização:', formData);
      
      // Preparar dados para envio, convertendo valores especiais para null
      const dataToUpdate = {
        ...formData,
        city_id: formData.city_id === 'no-city' || !formData.city_id ? null : formData.city_id,
        cell_id: formData.cell_id === 'no-cell' || !formData.cell_id ? null : formData.cell_id,
        ministry_id: formData.ministry_id === 'no-ministry' || !formData.ministry_id ? null : formData.ministry_id,
        pipeline_stage_id: formData.pipeline_stage_id === 'no-stage' || !formData.pipeline_stage_id ? null : formData.pipeline_stage_id,
        referred_by: formData.referred_by === 'no-referral' || !formData.referred_by ? null : formData.referred_by,
        leader_id: formData.leader_id === 'no-leader' || !formData.leader_id ? null : formData.leader_id,
      };

      // Se não for admin, manter os valores originais para célula e líder
      if (!isAdmin) {
        dataToUpdate.cell_id = contact.cell_id;
        dataToUpdate.leader_id = contact.leader_id;
      }

      console.log('EditContactDialog: Dados finais para atualização:', dataToUpdate);

      const updatedContact = await updateContact(contact.id, dataToUpdate);
      if (onUpdate) {
        onUpdate(updatedContact);
      }
      toast({
        title: "Sucesso",
        description: "Contato atualizado com sucesso!"
      });
      onClose();
    } catch (error) {
      console.error("EditContactDialog: Erro ao atualizar contato:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar contato!",
        variant: "destructive"
      });
    }
  };

  if (!isOpen || !contact) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Membro</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label>Foto do Contato</Label>
              <PhotoUpload
                currentPhotoUrl={formData.photo_url}
                onPhotoChange={handlePhotoChange}
                contactName={formData.name}
              />
            </div>

            <div>
              <Label htmlFor="edit-name">Nome *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-whatsapp">WhatsApp *</Label>
              <Input
                id="edit-whatsapp"
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-city">Cidade</Label>
              <Select 
                value={formData.city_id || 'no-city'} 
                onValueChange={(value) => {
                  console.log('EditContactDialog: Mudando cidade para:', value);
                  setFormData(prev => ({ 
                    ...prev, 
                    city_id: value === 'no-city' ? '' : value,
                    neighborhood: value !== prev.city_id ? '' : prev.neighborhood
                  }));
                }}
              >
                <SelectTrigger id="edit-city">
                  <SelectValue placeholder="Selecione uma cidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-city">Nenhuma cidade</SelectItem>
                  {cities.map(city => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-neighborhood">Bairro *</Label>
              {formData.city_id && formData.city_id !== 'no-city' ? (
                <Select 
                  value={formData.neighborhood || 'no-neighborhood'} 
                  onValueChange={(value) => {
                    console.log('EditContactDialog: Mudando bairro para:', value);
                    setFormData(prev => ({ 
                      ...prev, 
                      neighborhood: value === 'no-neighborhood' ? '' : value 
                    }));
                  }}
                >
                  <SelectTrigger id="edit-neighborhood">
                    <SelectValue placeholder="Selecione um bairro" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-neighborhood">Nenhum bairro</SelectItem>
                    {neighborhoods.map(neighborhood => (
                      <SelectItem key={neighborhood.id} value={neighborhood.name}>
                        {neighborhood.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="edit-neighborhood"
                  value={formData.neighborhood}
                  onChange={(e) => {
                    console.log('EditContactDialog: Digitando bairro:', e.target.value);
                    setFormData(prev => ({ ...prev, neighborhood: e.target.value }));
                  }}
                  placeholder="Digite o nome do bairro"
                  required
                />
              )}
            </div>

            <div>
              <Label htmlFor="edit-birth-date">Data de Nascimento</Label>
              <Input
                id="edit-birth-date"
                type="date"
                value={formData.birth_date || ''}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-encounter"
                checked={formData.encounter_with_god}
                onCheckedChange={(checked) => setFormData({ ...formData, encounter_with_god: checked })}
              />
              <Label htmlFor="edit-encounter">Já fez Encontro com Deus?</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-baptized"
                checked={formData.baptized}
                onCheckedChange={(checked) => setFormData({ ...formData, baptized: checked })}
              />
              <Label htmlFor="edit-baptized">Batizado</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-founder"
                checked={formData.founder}
                onCheckedChange={(checked) => setFormData({ ...formData, founder: checked })}
              />
              <Label htmlFor="edit-founder">Fundador</Label>
            </div>

            {/* Campo Líder Responsável - APENAS ADMIN pode ver e editar */}
            {isAdmin && (
              <div>
                <Label htmlFor="edit-leader">Líder Responsável</Label>
                <Select 
                  value={formData.leader_id || 'no-leader'} 
                  onValueChange={(value) => {
                    console.log('EditContactDialog: Mudando líder para:', value);
                    setFormData(prev => ({ 
                      ...prev, 
                      leader_id: value === 'no-leader' ? '' : value 
                    }));
                  }}
                >
                  <SelectTrigger id="edit-leader">
                    <SelectValue placeholder="Selecione um líder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-leader">Nenhum líder</SelectItem>
                    {profiles.map(profile => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.name} ({profile.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Campo Célula - APENAS ADMIN pode ver e editar */}
            {isAdmin && (
              <div>
                <Label htmlFor="edit-cell">Célula</Label>
                <Select 
                  value={formData.cell_id || 'no-cell'} 
                  onValueChange={(value) => {
                    console.log('EditContactDialog: Mudando célula para:', value);
                    setFormData(prev => ({ 
                      ...prev, 
                      cell_id: value === 'no-cell' ? '' : value 
                    }));
                  }}
                >
                  <SelectTrigger id="edit-cell">
                    <SelectValue placeholder="Selecione uma célula" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-cell">Nenhuma célula</SelectItem>
                    {cells.map(cell => (
                      <SelectItem key={cell.id} value={cell.id}>
                        {cell.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="edit-referred">Indicado por</Label>
              <Select 
                value={formData.referred_by || 'no-referral'} 
                onValueChange={(value) => {
                  console.log('EditContactDialog: Mudando indicação para:', value);
                  setFormData(prev => ({ 
                    ...prev, 
                    referred_by: value === 'no-referral' ? '' : value 
                  }));
                }}
              >
                <SelectTrigger id="edit-referred">
                  <SelectValue placeholder="Selecione quem indicou" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-referral">Nenhuma indicação</SelectItem>
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name}
                    </SelectItem>
                  ))}
                  {profiles.map((profile) => (
                    <SelectItem key={`profile-${profile.id}`} value={profile.id}>
                      {profile.name} (Líder)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-pipeline">Estágio Discípulo</Label>
              <Select 
                value={formData.pipeline_stage_id || 'no-stage'} 
                onValueChange={(value) => {
                  console.log('EditContactDialog: Mudando estágio para:', value);
                  setFormData(prev => ({ 
                    ...prev, 
                    pipeline_stage_id: value === 'no-stage' ? '' : value 
                  }));
                }}
              >
                <SelectTrigger id="edit-pipeline">
                  <SelectValue placeholder="Selecione uma etapa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-stage">Nenhuma etapa</SelectItem>
                  {pipelineStages.map(stage => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
