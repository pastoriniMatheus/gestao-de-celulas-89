
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PipelineStage {
  id: string;
  name: string;
  color: string;
  position: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const usePipelineStages = () => {
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStages = async () => {
    try {
      console.log('Buscando estágios do pipeline...');
      
      const { data, error } = await supabase
        .from('pipeline_stages')
        .select('*')
        .eq('active', true)
        .order('position');

      if (error) {
        console.error('Erro ao buscar estágios:', error);
        throw error;
      }

      console.log('Estágios encontrados:', data);
      setStages(data || []);
    } catch (error) {
      console.error('Erro ao buscar estágios:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar estágios do pipeline.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addStage = async (stageData: Omit<PipelineStage, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Adicionando estágio:', stageData);
      
      const { data, error } = await supabase
        .from('pipeline_stages')
        .insert([stageData])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar estágio:', error);
        throw error;
      }

      console.log('Estágio criado com sucesso:', data);
      
      toast({
        title: "Sucesso",
        description: "Estágio adicionado com sucesso!",
      });

      await fetchStages();
      return data;
    } catch (error) {
      console.error('Erro ao criar estágio:', error);
      throw error;
    }
  };

  const updateStage = async (id: string, updates: Partial<PipelineStage>) => {
    try {
      console.log('Atualizando estágio:', id, updates);
      
      const { data, error } = await supabase
        .from('pipeline_stages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar estágio:', error);
        throw error;
      }

      console.log('Estágio atualizado com sucesso:', data);
      
      await fetchStages();
      return data;
    } catch (error) {
      console.error('Erro ao atualizar estágio:', error);
      throw error;
    }
  };

  const deleteStage = async (id: string) => {
    try {
      console.log('Deletando estágio:', id);
      
      const { error } = await supabase
        .from('pipeline_stages')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar estágio:', error);
        throw error;
      }

      console.log('Estágio deletado com sucesso');
      
      toast({
        title: "Sucesso",
        description: "Estágio removido com sucesso!",
      });

      await fetchStages();
    } catch (error) {
      console.error('Erro ao deletar estágio:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchStages();

    // Escutar mudanças na tabela pipeline_stages
    const channel = supabase
      .channel(`pipeline-stages-changes-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pipeline_stages'
        },
        (payload) => {
          console.log('Estágio alterado:', payload);
          fetchStages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    stages,
    loading,
    addStage,
    updateStage,
    deleteStage,
    fetchStages
  };
};
