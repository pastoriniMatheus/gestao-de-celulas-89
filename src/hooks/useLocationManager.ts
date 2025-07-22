
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface City {
  id: string;
  name: string;
  state: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface Neighborhood {
  id: string;
  name: string;
  city_id: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useLocationManager = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [citiesData, neighborhoodsData] = await Promise.all([
        supabase.from('cities').select('*').order('name'),
        supabase.from('neighborhoods').select('*').order('name')
      ]);

      if (citiesData.error) throw citiesData.error;
      if (neighborhoodsData.error) throw neighborhoodsData.error;

      setCities(citiesData.data || []);
      setNeighborhoods(neighborhoodsData.data || []);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCity = async (id: string) => {
    try {
      await forceDeleteCity(id);
    } catch (error) {
      console.error('Erro ao deletar cidade:', error);
      toast({
        title: "Erro",
        description: "Erro ao deletar cidade. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const deleteNeighborhood = async (id: string, name: string) => {
    try {
      await forceDeleteNeighborhood(id, name);
    } catch (error) {
      console.error('Erro ao deletar bairro:', error);
      toast({
        title: "Erro",
        description: "Erro ao deletar bairro. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const forceDeleteCity = async (id: string) => {
    try {
      console.log('Iniciando exclusão forçada da cidade:', id);
      
      // 1. Primeiro, deletar todos os bairros da cidade
      console.log('Deletando bairros da cidade...');
      const { error: neighborhoodsError } = await supabase
        .from('neighborhoods')
        .delete()
        .eq('city_id', id);

      if (neighborhoodsError) {
        console.error('Erro ao deletar bairros:', neighborhoodsError);
      }

      // 2. Remover referências em contatos (definir city_id como null)
      console.log('Removendo referências em contatos...');
      const { error: contactsError } = await supabase
        .from('contacts')
        .update({ city_id: null })
        .eq('city_id', id);

      if (contactsError) {
        console.error('Erro ao atualizar contatos:', contactsError);
      }

      // 3. Remover referências em células (definir neighborhood_id como null)
      console.log('Verificando células...');
      const { error: cellsError } = await supabase
        .from('cells')
        .update({ neighborhood_id: null })
        .eq('neighborhood_id', id);

      if (cellsError) {
        console.error('Erro ao atualizar células:', cellsError);
      }

      // 4. Finalmente, deletar a cidade
      console.log('Deletando cidade...');
      const { error: cityError } = await supabase
        .from('cities')
        .delete()
        .eq('id', id);

      if (cityError) {
        console.error('Erro ao deletar cidade:', cityError);
        throw cityError;
      }

      toast({
        title: "Sucesso",
        description: "Cidade e todos os dados relacionados foram removidos!"
      });

      // Atualizar estado local imediatamente
      setCities(prev => prev.filter(city => city.id !== id));
      setNeighborhoods(prev => prev.filter(neighborhood => neighborhood.city_id !== id));
      
    } catch (error) {
      console.error('Erro ao deletar cidade:', error);
      toast({
        title: "Erro",
        description: "Erro ao deletar cidade. Verifique se não há dados vinculados.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const forceDeleteNeighborhood = async (id: string, name: string) => {
    try {
      console.log('Iniciando exclusão forçada do bairro:', id, name);
      
      // 1. Primeiro, atualizar contatos que usam este bairro
      console.log('Removendo referências em contatos...');
      const { error: contactsError } = await supabase
        .from('contacts')
        .update({ neighborhood: '' })
        .eq('neighborhood', name);

      if (contactsError) {
        console.error('Erro ao atualizar contatos:', contactsError);
      }

      // 2. Remover referências de células
      console.log('Removendo referências em células...');
      const { error: cellsError } = await supabase
        .from('cells')
        .update({ neighborhood_id: null })
        .eq('neighborhood_id', id);

      if (cellsError) {
        console.error('Erro ao atualizar células:', cellsError);
      }

      // 3. Finalmente, deletar o bairro
      console.log('Deletando bairro...');
      const { error: neighborhoodError } = await supabase
        .from('neighborhoods')
        .delete()
        .eq('id', id);

      if (neighborhoodError) {
        console.error('Erro ao deletar bairro:', neighborhoodError);
        throw neighborhoodError;
      }

      toast({
        title: "Sucesso",
        description: "Bairro e todas as referências foram removidos!"
      });

      // Atualizar estado local imediatamente
      setNeighborhoods(prev => prev.filter(neighborhood => neighborhood.id !== id));
      
    } catch (error) {
      console.error('Erro ao deletar bairro:', error);
      toast({
        title: "Erro",
        description: "Erro ao deletar bairro. Verifique se não há dados vinculados.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const addCity = async (cityData: Pick<City, 'name' | 'state' | 'active'>) => {
    try {
      const { data, error } = await supabase
        .from('cities')
        .insert([cityData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Cidade adicionada com sucesso!"
      });

      // Atualizar estado local imediatamente
      setCities(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Erro ao criar cidade:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar cidade",
        variant: "destructive"
      });
      throw error;
    }
  };

  const addNeighborhood = async (neighborhoodData: Pick<Neighborhood, 'name' | 'city_id' | 'active'>) => {
    try {
      const { data, error } = await supabase
        .from('neighborhoods')
        .insert([neighborhoodData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Bairro adicionado com sucesso!"
      });

      // Atualizar estado local imediatamente
      setNeighborhoods(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Erro ao criar bairro:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar bairro",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateCity = async (id: string, updates: Partial<Pick<City, 'name' | 'state' | 'active'>>) => {
    try {
      const { data, error } = await supabase
        .from('cities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Cidade atualizada com sucesso!"
      });

      // Atualizar estado local imediatamente
      setCities(prev => prev.map(city => city.id === id ? data : city));
      return data;
    } catch (error) {
      console.error('Erro ao atualizar cidade:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar cidade",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateNeighborhood = async (id: string, updates: Partial<Pick<Neighborhood, 'name' | 'active'>>) => {
    try {
      const { data, error } = await supabase
        .from('neighborhoods')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Bairro atualizado com sucesso!"
      });

      // Atualizar estado local imediatamente
      setNeighborhoods(prev => prev.map(neighborhood => neighborhood.id === id ? data : neighborhood));
      return data;
    } catch (error) {
      console.error('Erro ao atualizar bairro:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar bairro",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchData();

    // Configurar real-time updates com melhor handling
    const channel = supabase
      .channel('location-manager-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cities'
        },
        (payload) => {
          console.log('Cidade alterada em tempo real:', payload);
          
          if (payload.eventType === 'INSERT') {
            setCities(prev => [...prev, payload.new as City]);
          } else if (payload.eventType === 'UPDATE') {
            setCities(prev => prev.map(city => 
              city.id === payload.new.id ? payload.new as City : city
            ));
          } else if (payload.eventType === 'DELETE') {
            setCities(prev => prev.filter(city => city.id !== payload.old.id));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'neighborhoods'
        },
        (payload) => {
          console.log('Bairro alterado em tempo real:', payload);
          
          if (payload.eventType === 'INSERT') {
            setNeighborhoods(prev => [...prev, payload.new as Neighborhood]);
          } else if (payload.eventType === 'UPDATE') {
            setNeighborhoods(prev => prev.map(neighborhood => 
              neighborhood.id === payload.new.id ? payload.new as Neighborhood : neighborhood
            ));
          } else if (payload.eventType === 'DELETE') {
            setNeighborhoods(prev => prev.filter(neighborhood => neighborhood.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    cities,
    neighborhoods,
    loading,
    deleteCity,
    deleteNeighborhood,
    forceDeleteCity,
    forceDeleteNeighborhood,
    addCity,
    addNeighborhood,
    updateCity,
    updateNeighborhood,
    refreshData: fetchData
  };
};
