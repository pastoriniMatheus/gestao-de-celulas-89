
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Neighborhood {
  id: string;
  name: string;
  city_id: string;
}

export const useNeighborhoods = (cityId?: string) => {
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!cityId) {
      setNeighborhoods([]);
      return;
    }

    const fetchNeighborhoods = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('neighborhoods')
          .select('*')
          .eq('city_id', cityId)
          .eq('active', true)
          .order('name');

        if (error) throw error;
        setNeighborhoods(data || []);
      } catch (error) {
        console.error('Erro ao carregar bairros:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNeighborhoods();
  }, [cityId]);

  return { neighborhoods, loading };
};
