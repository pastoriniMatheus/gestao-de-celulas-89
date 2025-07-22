import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { CellFilters } from '@/components/CellsFilter';

export interface Cell {
  id: string;
  name: string;
  address: string;
  meeting_day: number;
  meeting_time: string;
  leader_id: string | null;
  neighborhood_id: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  // Campos relacionados para exibição
  leader_name?: string;
  neighborhood_name?: string;
  city_id?: string;
  city_name?: string;
}

export const useCells = () => {
  const [cells, setCells] = useState<Cell[]>([]);
  const [filteredCells, setFilteredCells] = useState<Cell[]>([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const fetchCells = async () => {
    try {
      setLoading(true);
      console.log('useCells: Iniciando busca de células com joins...');
      
      const { data, error } = await supabase
        .from('cells')
        .select(`
          *,
          neighborhoods!cells_neighborhood_id_fkey (
            id,
            name,
            city_id,
            cities!neighborhoods_city_id_fkey (
              id,
              name,
              state
            )
          ),
          profiles!cells_leader_id_fkey (
            id,
            name
          )
        `)
        .order('name');

      console.log('useCells: Resposta do Supabase com joins:', { data, error });

      if (error) {
        console.error('useCells: Erro ao buscar células:', error);
        if (mountedRef.current) {
          toast({
            title: "Erro",
            description: `Erro ao carregar células: ${error.message}`,
            variant: "destructive"
          });
        }
        return;
      }

      console.log('useCells: Células encontradas:', data?.length || 0);
      
      // Transformar os dados para incluir campos relacionados
      const transformedData = data?.map(cell => ({
        ...cell,
        leader_name: cell.profiles?.name || null,
        neighborhood_name: cell.neighborhoods?.name || null,
        city_id: cell.neighborhoods?.cities?.id || null,
        city_name: cell.neighborhoods?.cities?.name || null
      })) || [];
      
      if (mountedRef.current) {
        setCells(transformedData);
        setFilteredCells(transformedData);
      }
    } catch (error) {
      console.error('useCells: Erro inesperado:', error);
      if (mountedRef.current) {
        toast({
          title: "Erro",
          description: "Erro inesperado ao carregar células",
          variant: "destructive"
        });
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const applyFilters = (filters: CellFilters) => {
    let filtered = [...cells];

    if (filters.search) {
      filtered = filtered.filter(cell =>
        cell.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.city) {
      filtered = filtered.filter(cell =>
        cell.city_name?.toLowerCase().includes(filters.city.toLowerCase()) ||
        cell.address.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    if (filters.neighborhood) {
      filtered = filtered.filter(cell =>
        cell.neighborhood_name?.toLowerCase().includes(filters.neighborhood.toLowerCase()) ||
        cell.address.toLowerCase().includes(filters.neighborhood.toLowerCase())
      );
    }

    setFilteredCells(filtered);
  };

  const addCell = async (cellData: Omit<Cell, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('useCells: Criando nova célula:', cellData);
      
      const { data, error } = await supabase
        .from('cells')
        .insert([{
          name: cellData.name,
          address: cellData.address,
          meeting_day: cellData.meeting_day,
          meeting_time: cellData.meeting_time,
          leader_id: cellData.leader_id,
          neighborhood_id: cellData.neighborhood_id,
          active: cellData.active
        }])
        .select(`
          *,
          neighborhoods!cells_neighborhood_id_fkey (
            id,
            name,
            city_id,
            cities!neighborhoods_city_id_fkey (
              id,
              name,
              state
            )
          ),
          profiles!cells_leader_id_fkey (
            id,
            name
          )
        `)
        .single();

      if (error) {
        console.error('useCells: Erro ao criar célula:', error);
        throw error;
      }

      console.log('useCells: Célula criada com sucesso:', data);
      
      const transformedData = {
        ...data,
        leader_name: data.profiles?.name || null,
        neighborhood_name: data.neighborhoods?.name || null,
        city_id: data.neighborhoods?.cities?.id || null,
        city_name: data.neighborhoods?.cities?.name || null
      };
      
      if (mountedRef.current) {
        setCells(prev => [...prev, transformedData]);
        setFilteredCells(prev => [...prev, transformedData]);
      }
      
      toast({
        title: "Sucesso",
        description: "Célula criada com sucesso! - Sistema Matheus Pastorini"
      });
      
      return transformedData;
    } catch (error) {
      console.error('useCells: Erro ao criar célula:', error);
      throw error;
    }
  };

  const updateCell = async (id: string, updates: Partial<Cell>) => {
    try {
      console.log('useCells: Atualizando célula:', { id, updates });
      
      // Preparar dados para atualização (apenas campos da tabela cells)
      const updateData: any = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.address !== undefined) updateData.address = updates.address;
      if (updates.meeting_day !== undefined) updateData.meeting_day = updates.meeting_day;
      if (updates.meeting_time !== undefined) updateData.meeting_time = updates.meeting_time;
      if (updates.leader_id !== undefined) updateData.leader_id = updates.leader_id;
      if (updates.neighborhood_id !== undefined) updateData.neighborhood_id = updates.neighborhood_id;
      if (updates.active !== undefined) updateData.active = updates.active;
      
      updateData.updated_at = new Date().toISOString();
      
      console.log('useCells: Dados para atualização:', updateData);
      
      const { data, error } = await supabase
        .from('cells')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          neighborhoods!cells_neighborhood_id_fkey (
            id,
            name,
            city_id,
            cities!neighborhoods_city_id_fkey (
              id,
              name,
              state
            )
          ),
          profiles!cells_leader_id_fkey (
            id,
            name
          )
        `)
        .single();

      if (error) {
        console.error('useCells: Erro ao atualizar célula:', error);
        throw error;
      }

      console.log('useCells: Célula atualizada com sucesso:', data);
      
      const transformedData = {
        ...data,
        leader_name: data.profiles?.name || null,
        neighborhood_name: data.neighborhoods?.name || null,
        city_id: data.neighborhoods?.cities?.id || null,
        city_name: data.neighborhoods?.cities?.name || null
      };
      
      if (mountedRef.current) {
        setCells(prev => prev.map(cell => cell.id === id ? transformedData : cell));
        setFilteredCells(prev => prev.map(cell => cell.id === id ? transformedData : cell));
      }
      
      toast({
        title: "Sucesso",
        description: "Célula atualizada com sucesso! - Sistema Matheus Pastorini"
      });
      
      return transformedData;
    } catch (error) {
      console.error('useCells: Erro ao atualizar célula:', error);
      throw error;
    }
  };

  const deleteCell = async (id: string) => {
    try {
      console.log('useCells: Deletando célula:', id);
      
      const { error } = await supabase
        .from('cells')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('useCells: Erro ao deletar célula:', error);
        throw error;
      }

      console.log('useCells: Célula deletada com sucesso');
      
      if (mountedRef.current) {
        setCells(prev => prev.filter(cell => cell.id !== id));
        setFilteredCells(prev => prev.filter(cell => cell.id !== id));
      }
      
      toast({
        title: "Sucesso",
        description: "Célula deletada com sucesso! - Sistema Matheus Pastorini"
      });
    } catch (error) {
      console.error('useCells: Erro ao deletar célula:', error);
      throw error;
    }
  };

  useEffect(() => {
    console.log('useCells: Hook inicializando...');
    mountedRef.current = true;
    fetchCells();

    return () => {
      console.log('useCells: Limpando hook...');
      mountedRef.current = false;
    };
  }, []);

  return {
    cells: filteredCells,
    loading,
    fetchCells,
    addCell,
    updateCell,
    deleteCell,
    applyFilters
  };
};
