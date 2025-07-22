
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Neighborhood {
  id: string;
  name: string;
  city_id: string;
}

export const useNeighborhoodsByCity = (cityId: string | null) => {
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchNeighborhoods = async () => {
      if (!cityId || cityId === 'no-city') {
        setNeighborhoods([]);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('neighborhoods')
          .select('id, name, city_id')
          .eq('city_id', cityId)
          .eq('active', true)
          .order('name');

        if (error) throw error;
        setNeighborhoods(data || []);
      } catch (error) {
        console.error('Erro ao buscar bairros:', error);
        setNeighborhoods([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNeighborhoods();
  }, [cityId]);

  return { neighborhoods, loading };
};
