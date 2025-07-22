
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function EncounterWithGodField({ checked, onChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id="encounter-with-god"
        checked={checked}
        onCheckedChange={val => onChange(!!val)}
      />
      <label htmlFor="encounter-with-god" className="text-sm">
        Já fez Encontro com Deus?
      </label>
    </div>
  );
}
