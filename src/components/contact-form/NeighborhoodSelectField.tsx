
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

interface Neighborhood {
  id: string;
  name: string;
}

interface Props {
  neighborhood: string;
  onChange: (neighborhood: string) => void;
  neighborhoods: Neighborhood[];
}

export function NeighborhoodSelectField({ neighborhood, onChange, neighborhoods }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="neighborhood-select" className="text-sm font-medium">
        Bairro
      </label>
      <Select value={neighborhood} onValueChange={onChange}>
        <SelectTrigger id="neighborhood-select">
          <SelectValue placeholder="Selecione o bairro..." />
        </SelectTrigger>
        <SelectContent>
          {neighborhoods.map(nb => (
            <SelectItem key={nb.id} value={nb.name}>
              {nb.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
