
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Ministry {
  id: string;
  name: string;
  leader_id: string | null;
  description: string | null;
  active: boolean;
  is_system_ministry?: boolean;
  created_at: string;
  updated_at: string;
  leader?: {
    id: string;
    name: string;
  };
  members?: {
    id: string;
    name: string;
    joined_at: string;
  }[];
  member_count?: number;
}

interface MinistryMember {
  id: string;
  ministry_id: string;
  contact_id: string;
  joined_at: string;
  active: boolean;
  contact: {
    id: string;
    name: string;
  };
}

export const useMinistries = () => {
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMinistries = async () => {
    try {
      setLoading(true);
      console.log('Buscando ministérios...');
      
      const { data, error } = await supabase
        .from('ministries')
        .select(`
          *,
          leader:contacts!ministries_leader_id_fkey(id, name),
          ministry_members(
            id,
            contact:contacts!ministry_members_contact_id_fkey(id, name),
            joined_at
          )
        `)
        .eq('active', true)
        .order('name');

      if (error) {
        console.error('Erro ao buscar ministérios:', error);
        throw error;
      }

      console.log('Ministérios encontrados:', data);

      const transformedData = (data || []).map(ministry => ({
        ...ministry,
        member_count: ministry.ministry_members?.length || 0,
        members: ministry.ministry_members?.map((member: any) => ({
          id: member.contact.id,
          name: member.contact.name,
          joined_at: member.joined_at
        })) || []
      }));

      setMinistries(transformedData);
    } catch (error) {
      console.error('Erro ao buscar ministérios:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar ministérios",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createMinistry = async (ministryData: {
    name: string;
    leader_id?: string;
    description?: string;
  }) => {
    try {
      console.log('Criando ministério:', ministryData);
      
      const dataToInsert = {
        name: ministryData.name,
        leader_id: ministryData.leader_id && ministryData.leader_id !== '' ? ministryData.leader_id : null,
        description: ministryData.description && ministryData.description !== '' ? ministryData.description : null,
        active: true
      };

      console.log('Dados para inserir:', dataToInsert);

      const { data, error } = await supabase
        .from('ministries')
        .insert([dataToInsert])
        .select(`
          *,
          leader:contacts!ministries_leader_id_fkey(id, name)
        `)
        .single();

      if (error) {
        console.error('Erro ao criar ministério:', error);
        throw error;
      }

      console.log('Ministério criado:', data);

      toast({
        title: "Sucesso",
        description: "Ministério criado com sucesso!"
      });

      await fetchMinistries();
      return data;
    } catch (error) {
      console.error('Erro ao criar ministério:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar ministério",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateMinistry = async (id: string, updates: Partial<Ministry>) => {
    try {
      console.log('Atualizando ministério:', { id, updates });
      
      const dataToUpdate = {
        name: updates.name,
        leader_id: updates.leader_id || null,
        description: updates.description || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('ministries')
        .update(dataToUpdate)
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar ministério:', error);
        throw error;
      }

      console.log('Ministério atualizado com sucesso');

      toast({
        title: "Sucesso",
        description: "Ministério atualizado com sucesso!"
      });

      await fetchMinistries();
    } catch (error) {
      console.error('Erro ao atualizar ministério:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar ministério",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteMinistry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ministries')
        .update({ active: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Ministério removido com sucesso!"
      });

      await fetchMinistries();
    } catch (error) {
      console.error('Erro ao remover ministério:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover ministério",
        variant: "destructive"
      });
      throw error;
    }
  };

  const addMemberToMinistry = async (ministryId: string, contactId: string) => {
    try {
      const { error } = await supabase
        .from('ministry_members')
        .insert([{
          ministry_id: ministryId,
          contact_id: contactId
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Membro adicionado ao ministério!"
      });

      await fetchMinistries();
    } catch (error) {
      console.error('Erro ao adicionar membro:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar membro ao ministério",
        variant: "destructive"
      });
      throw error;
    }
  };

  const removeMemberFromMinistry = async (ministryId: string, contactId: string) => {
    try {
      const { error } = await supabase
        .from('ministry_members')
        .delete()
        .eq('ministry_id', ministryId)
        .eq('contact_id', contactId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Membro removido do ministério!"
      });

      await fetchMinistries();
    } catch (error) {
      console.error('Erro ao remover membro:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover membro do ministério",
        variant: "destructive"
      });
      throw error;
    }
  };

  const getMinistryMembers = async (ministryId: string) => {
    try {
      const { data, error } = await supabase
        .from('ministry_members')
        .select(`
          *,
          contact:contacts!ministry_members_contact_id_fkey(id, name, whatsapp)
        `)
        .eq('ministry_id', ministryId)
        .eq('active', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar membros do ministério:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchMinistries();
  }, []);

  return {
    ministries,
    loading,
    createMinistry,
    updateMinistry,
    deleteMinistry,
    addMemberToMinistry,
    removeMemberFromMinistry,
    getMinistryMembers,
    fetchMinistries
  };
};
