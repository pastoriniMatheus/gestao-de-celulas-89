
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useContacts } from '@/hooks/useContacts';
import { useContactForm } from '@/hooks/useContactForm';
import { useContactDialogData } from '@/hooks/useContactDialogData';
import { BasicInfoFields } from './contact-form/BasicInfoFields';
import { LocationFields } from './contact-form/LocationFields';
import { ReferralAndCellFields } from './contact-form/ReferralAndCellFields';
import { EncounterWithGodField } from './contact-form/EncounterWithGodField';
import { BaptizedField } from './contact-form/BaptizedField';
import { FounderField } from './contact-form/FounderField';
import { LeaderField } from './contact-form/LeaderField';
import { PhotoUpload } from './PhotoUpload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const AddContactDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  
  const { addContact } = useContacts();
  const { toast } = useToast();
  const { formData, updateFormData, resetForm } = useContactForm();
  const { 
    cells,
    cities,
    contacts,
    profiles,
    neighborhoods,
    getFilteredNeighborhoods 
  } = useContactDialogData(isOpen);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.whatsapp || !formData.neighborhood) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios (Nome, WhatsApp e Bairro).",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const contactToAdd = {
        name: formData.name,
        whatsapp: formData.whatsapp,
        neighborhood: formData.neighborhood,
        city_id: formData.city_id || null,
        cell_id: formData.cell_id === 'none' ? null : formData.cell_id || null,
        ministry_id: null,
        status: 'pending',
        birth_date: formData.birth_date || null,
        encounter_with_god: !!formData.encounter_with_god,
        baptized: !!formData.baptized,
        pipeline_stage_id: null,
        age: null,
        attendance_code: null,
        referred_by: formData.referred_by || null,
        photo_url: photoUrl,
        founder: !!formData.founder,
        leader_id: formData.leader_id || null,
      };
      await addContact(contactToAdd);
      toast({
        title: "Sucesso",
        description: "Contato adicionado com sucesso com status pendente!",
      });
      resetForm();
      setPhotoUrl(null);
      setIsOpen(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error?.message || "Erro ao criar contato. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Contato
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Contato</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo de Foto */}
          <div>
            <Label>Foto do Contato</Label>
            <PhotoUpload
              currentPhotoUrl={photoUrl}
              onPhotoChange={setPhotoUrl}
              contactName={formData.name || 'Novo Contato'}
            />
          </div>

          <BasicInfoFields
            formData={formData}
            onUpdateFormData={updateFormData}
            showBirthDate={false}
          />
          <div>
            <Label htmlFor="add-contact-birth-date">Data de Nascimento</Label>
            <Input
              id="add-contact-birth-date"
              type="date"
              value={formData.birth_date || ''}
              onChange={e => updateFormData({ birth_date: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EncounterWithGodField
              checked={!!formData.encounter_with_god}
              onChange={checked => updateFormData({ encounter_with_god: checked })}
            />
            <BaptizedField
              checked={!!formData.baptized}
              onChange={checked => updateFormData({ baptized: checked })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FounderField
              checked={!!formData.founder}
              onChange={checked => updateFormData({ founder: checked })}
            />
          </div>
          <LeaderField
            value={formData.leader_id}
            onChange={value => updateFormData({ leader_id: value })}
            profiles={profiles}
          />
          <LocationFields
            formData={formData}
            onUpdateFormData={updateFormData}
            cities={cities}
            getFilteredNeighborhoods={getFilteredNeighborhoods}
          />
          <ReferralAndCellFields
            formData={formData}
            onUpdateFormData={updateFormData}
            cells={cells}
            contacts={contacts}
            profiles={profiles}
          />
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
              {loading ? 'Salvando...' : 'Salvar Contato'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
