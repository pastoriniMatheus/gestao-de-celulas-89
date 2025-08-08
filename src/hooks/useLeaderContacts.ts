
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
      
      console.log('fetchContacts: Iniciando busca com perfil:', { isAdmin, isLeader, userProfile });
      
      // Com as novas políticas RLS, podemos simplesmente fazer a consulta
      // O banco já vai filtrar automaticamente baseado no role do usuário
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar contatos:', error);
        // Se há erro, pode ser problema de permissão
        if (error.code === '42501') {
          console.log('Erro de permissão - usuário pode não ter acesso aos contatos');
          setContacts([]);
        }
        return;
      }

      console.log('fetchContacts: Contatos encontrados:', data?.length);
      setContacts(data || []);
      
    } catch (error) {
      console.error('Erro geral ao buscar contatos:', error);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Só buscar se o usuário tem permissão para acessar contatos
    if (userProfile && (isAdmin || isLeader)) {
      fetchContacts();
    } else {
      console.log('useLeaderContacts: Usuário não tem permissão para ver contatos');
      setContacts([]);
      setLoading(false);
    }
  }, [userProfile?.id, isLeader, isAdmin]);

  return {
    contacts,
    loading,
    fetchContacts
  };
};
