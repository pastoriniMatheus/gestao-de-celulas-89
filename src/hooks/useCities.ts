
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface City {
  id: string;
  name: string;
  state: string;
}

export const useCities = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const { data, error } = await supabase
          .from('cities')
          .select('*')
          .eq('active', true)
          .order('name');

        if (error) throw error;
        setCities(data || []);
      } catch (error) {
        console.error('Erro ao carregar cidades:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  return { cities, loading };
};
