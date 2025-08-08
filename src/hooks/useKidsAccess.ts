
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';

export const useKidsAccess = () => {
  const [hasKidsAccess, setHasKidsAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();

  useEffect(() => {
    const checkKidsAccess = async () => {
      if (!userProfile?.user_id) {
        setHasKidsAccess(false);
        setLoading(false);
        return;
      }

      // Admin sempre tem acesso
      if (userProfile.role === 'admin') {
        setHasKidsAccess(true);
        setLoading(false);
        return;
      }

      try {
        // Verificar se o usuário tem permissão específica para kids
        const { data: accessData, error: accessError } = await supabase
          .from('user_ministry_access')
          .select('can_access_kids')
          .eq('user_id', userProfile.user_id)
          .single();

        if (accessError && accessError.code !== 'PGRST116') {
          console.error('Erro ao verificar acesso ao Kids:', accessError);
          setHasKidsAccess(false);
        } else {
          setHasKidsAccess(accessData?.can_access_kids || false);
        }
      } catch (error) {
        console.error('Erro geral ao verificar acesso ao Kids:', error);
        setHasKidsAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkKidsAccess();
  }, [userProfile]);

  return { hasKidsAccess, loading };
};
