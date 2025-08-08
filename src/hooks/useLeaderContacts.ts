
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserPermissions } from '@/hooks/useUserPermissions';

interface Contact {
  id: string;
  name: string;
  whatsapp: string | null;
  neighborhood: string;
  city_id: string | null;
  cell_id: string | null;
  status: string;
  encounter_with_god: boolean;
  baptized: boolean;
  pipeline_stage_id: string | null;
  age: number | null;
  birth_date: string | null;
  attendance_code: string | null;
  created_at: string;
  updated_at: string;
}

export const useLeaderContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const { userProfile, isLeader, isAdmin } = useUserPermissions();

  const fetchContacts = async () => {
    try {
      setLoading(true);
      
      if (isLeader && !isAdmin && userProfile?.id) {
        // Buscar contatos apenas das células do líder
        const { data: leaderCells } = await supabase
          .from('cells')
          .select('id')
          .eq('leader_id', userProfile.id);

        if (!leaderCells || leaderCells.length === 0) {
          setContacts([]);
          return;
        }

        const cellIds = leaderCells.map(cell => cell.id);
        
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .in('cell_id', cellIds)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao buscar contatos do líder:', error);
          return;
        }

        setContacts(data || []);
      } else if (isAdmin) {
        // Admin vê todos os contatos
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao buscar contatos:', error);
          return;
        }

        setContacts(data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar contatos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Aguardar até que as permissões sejam definidas (não undefined)
    if (typeof isLeader === 'boolean' && typeof isAdmin === 'boolean') {
      fetchContacts();
    } else {
      setLoading(false);
    }
  }, [userProfile?.id, isLeader, isAdmin].filter(dep => dep !== undefined)); // Filtrar undefined das dependências

  return {
    contacts,
    loading,
    fetchContacts
  };
};
