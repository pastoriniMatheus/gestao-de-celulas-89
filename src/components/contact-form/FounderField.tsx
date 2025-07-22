
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Crown } from 'lucide-react';

interface FounderFieldProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const FounderField: React.FC<FounderFieldProps> = ({ checked, onChange }) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox 
        id="founder"
        checked={checked}
        onCheckedChange={onChange}
      />
      <Label htmlFor="founder" className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        <Crown className="w-4 h-4 text-yellow-600" />
        Fundador
      </Label>
    </div>
  );
};
