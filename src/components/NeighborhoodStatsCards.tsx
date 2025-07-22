
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Home, Users, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface NeighborhoodStats {
  id: string;
  neighborhood_name: string;
  city_name: string | null;
  total_cells: number;
  total_contacts: number;
  total_leaders: number;
  total_people: number;
}

interface NeighborhoodStatsCardsProps {
  selectedNeighborhoodId?: string | null;
  onSelectNeighborhood?: (neighborhood: NeighborhoodStats | null) => void;
}

export const NeighborhoodStatsCards = ({
  selectedNeighborhoodId,
  onSelectNeighborhood,
}: NeighborhoodStatsCardsProps) => {
  const [stats, setStats] = useState<NeighborhoodStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('neighborhood_stats')
      .select('*')
      .order('neighborhood_name');
    if (!error) {
      setStats(data || []);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Carregando métricas...</span>
      </div>
    );
  }

  if (stats.length === 0) {
    return (
      <div className="text-center text-gray-600 py-12">
        <MapPin className="h-8 w-8 mx-auto mb-2" />
        Nenhum bairro cadastrado.
      </div>
    );
  }

  // Filtra se for passado neighborhood selecionado
  const cardsToShow = selectedNeighborhoodId
    ? stats.filter((b) => b.id === selectedNeighborhoodId)
    : stats;

  return (
    <div className="w-full">
      {selectedNeighborhoodId && onSelectNeighborhood && (
        <div className="mb-6 text-end">
          <button
            className="text-blue-600 hover:underline font-medium text-sm"
            onClick={() => onSelectNeighborhood(null)}
            type="button"
          >
            ← Ver todos os bairros
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {cardsToShow.map((bairro) => (
          <Card
            key={bairro.id}
            className={`hover:scale-[1.01] transition-all shadow border-2 border-blue-100 bg-white/95 cursor-pointer
              ${selectedNeighborhoodId === bairro.id ? 'border-blue-600 ring-2 ring-blue-300' : ''}
            `}
            tabIndex={0}
            aria-pressed={selectedNeighborhoodId === bairro.id}
            onClick={() =>
              onSelectNeighborhood?.(
                selectedNeighborhoodId === bairro.id ? null : bairro
              )
            }
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectNeighborhood?.(
                  selectedNeighborhoodId === bairro.id ? null : bairro
                );
              }
            }}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-pink-600" />
                  <span className="font-bold text-base">{bairro.neighborhood_name}</span>
                </div>
                {bairro.city_name && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {bairro.city_name}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 justify-between items-center">
                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs flex items-center gap-1">
                  <Home className="h-3 w-3" />
                  {bairro.total_cells} célula{Number(bairro.total_cells) === 1 ? "" : "s"}
                </span>
                <span className="bg-green-50 text-green-700 px-2 py-1 rounded-md text-xs flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {bairro.total_contacts} contato{Number(bairro.total_contacts) === 1 ? "" : "s"}
                </span>
                <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-md text-xs flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {bairro.total_leaders} líder{Number(bairro.total_leaders) === 1 ? "" : "es"}
                </span>
                <span className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded-md text-xs flex items-center gap-1 font-semibold">
                  Total: {bairro.total_people}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
