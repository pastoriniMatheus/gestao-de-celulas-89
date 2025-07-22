
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Cell {
  id: string;
  name: string;
}

interface Contact {
  id: string;
  name: string;
}

interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface ReferralAndCellFieldsProps {
  formData: {
    cell_id: string;
    referred_by: string;
  };
  onUpdateFormData: (updates: any) => void;
  cells: Cell[];
  contacts: Contact[];
  profiles: Profile[];
}

export const ReferralAndCellFields = ({ 
  formData, 
  onUpdateFormData, 
  cells, 
  contacts, 
  profiles 
}: ReferralAndCellFieldsProps) => {
  const safeCellValue = formData.cell_id || 'no-cell';
  const safeReferralValue = formData.referred_by || 'no-referral';

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="cell">Célula</Label>
        <Select 
          value={safeCellValue} 
          onValueChange={(value) => onUpdateFormData({ cell_id: value === 'no-cell' ? '' : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma célula" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no-cell">Nenhuma célula</SelectItem>
            {cells.map((cell) => (
              <SelectItem key={cell.id} value={cell.id}>
                {cell.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="referral">Indicado por</Label>
        <Select 
          value={safeReferralValue} 
          onValueChange={(value) => onUpdateFormData({ referred_by: value === 'no-referral' ? '' : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione quem indicou" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no-referral">Ninguém</SelectItem>
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
    </div>
  );
};
