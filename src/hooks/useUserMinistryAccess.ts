
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';

export interface UserMinistryAccess {
  id: string;
  user_id: string;
  can_access_ministries: boolean;
  can_access_kids: boolean;
  created_at: string;
  updated_at: string;
}

export const useUserMinistryAccess = () => {
  const [ministryAccess, setMinistryAccess] = useState<UserMinistryAccess | null>(null);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();

  const fetchMinistryAccess = async () => {
    if (!userProfile?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_ministry_access')
        .select('*')
        .eq('user_id', userProfile.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar acesso aos ministérios:', error);
        return;
      }

      setMinistryAccess(data || null);
    } catch (error) {
      console.error('Erro ao buscar acesso aos ministérios:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMinistryAccess = async (userId: string, canAccessMinistries: boolean, canAccessKids: boolean) => {
    try {
      const { error } = await supabase
        .from('user_ministry_access')
        .upsert({
          user_id: userId,
          can_access_ministries: canAccessMinistries,
          can_access_kids: canAccessKids,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Erro ao atualizar acesso aos ministérios:', error);
        throw error;
      }

      // Atualizar dados locais se for o usuário atual
      if (userId === userProfile?.id) {
        await fetchMinistryAccess();
      }
    } catch (error) {
      console.error('Erro ao atualizar acesso aos ministérios:', error);
      throw error;
    }
  };

  const canAccessMinistries = () => {
    if (userProfile?.role === 'admin') return true;
    return ministryAccess?.can_access_ministries || false;
  };

  const canAccessKids = () => {
    if (userProfile?.role === 'admin') return true;
    return ministryAccess?.can_access_kids || false;
  };

  useEffect(() => {
    fetchMinistryAccess();
  }, [userProfile?.id]);

  return {
    ministryAccess,
    loading,
    canAccessMinistries,
    canAccessKids,
    updateMinistryAccess,
    refreshMinistryAccess: fetchMinistryAccess
  };
};
