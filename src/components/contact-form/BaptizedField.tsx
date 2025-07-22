
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface BaptizedFieldProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const BaptizedField = ({ checked, onChange }: BaptizedFieldProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id="baptized"
        checked={checked}
        onCheckedChange={(checked) => onChange(!!checked)}
      />
      <Label
        htmlFor="baptized"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Batizado
      </Label>
    </div>
  );
};
