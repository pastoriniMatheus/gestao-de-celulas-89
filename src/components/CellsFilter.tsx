
import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CellsFilterProps {
  onFilterChange: (filters: CellFilters) => void;
}

export interface CellFilters {
  search: string;
  city: string;
  neighborhood: string;
  leader: string;
}

export const CellsFilter = ({ onFilterChange }: CellsFilterProps) => {
  const [filters, setFilters] = useState<CellFilters>({
    search: '',
    city: '',
    neighborhood: '',
    leader: ''
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof CellFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      search: '',
      city: '',
      neighborhood: '',
      leader: ''
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');
  const activeFiltersCount = Object.values(filters).filter(value => value !== '').length;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome da célula..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {isExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Cidade
                </label>
                <Input
                  placeholder="Filtrar por cidade..."
                  value={filters.city}
                  onChange={(e) => updateFilter('city', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Bairro
                </label>
                <Input
                  placeholder="Filtrar por bairro..."
                  value={filters.neighborhood}
                  onChange={(e) => updateFilter('neighborhood', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Líder
                </label>
                <Input
                  placeholder="Filtrar por nome do líder..."
                  value={filters.leader}
                  onChange={(e) => updateFilter('leader', e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
