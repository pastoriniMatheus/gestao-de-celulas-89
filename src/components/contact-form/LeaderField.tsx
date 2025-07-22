
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface LeaderFieldProps {
  value: string;
  onChange: (value: string) => void;
  profiles: Profile[];
}

export const LeaderField = ({ value, onChange, profiles }: LeaderFieldProps) => {
  // Filtrar apenas perfis com role de líder
  const leaders = profiles.filter(profile => 
    profile.role === 'leader' || profile.role === 'admin'
  );

  const safeValue = value || 'no-leader';

  return (
    <div>
      <Label htmlFor="leader">Líder Responsável</Label>
      <Select 
        value={safeValue} 
        onValueChange={(selectedValue) => onChange(selectedValue === 'no-leader' ? '' : selectedValue)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione um líder" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="no-leader">Nenhum líder</SelectItem>
          {leaders.map((leader) => (
            <SelectItem key={leader.id} value={leader.id}>
              {leader.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
