
import { useAuth } from '@/components/AuthProvider';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserMinistryAccess {
  can_access_ministries: boolean;
  can_access_kids: boolean;
}

export const useUserPermissions = () => {
  const { userProfile } = useAuth();
  const [ministryAccess, setMinistryAccess] = useState<UserMinistryAccess>({
    can_access_ministries: false,
    can_access_kids: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMinistryAccess = async () => {
      if (!userProfile?.user_id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_ministry_access')
          .select('can_access_ministries, can_access_kids')
          .eq('user_id', userProfile.user_id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Erro ao buscar permissões:', error);
        }

        if (data) {
          setMinistryAccess(data);
        }
      } catch (error) {
        console.error('Erro ao buscar permissões:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMinistryAccess();
  }, [userProfile]);

  console.log('useUserPermissions - userProfile:', userProfile);
  console.log('useUserPermissions - role:', userProfile?.role);

  // Admin tem acesso a tudo
  const isAdmin = userProfile?.role === 'admin';
  const isLeader = userProfile?.role === 'leader';

  console.log('useUserPermissions - isAdmin:', isAdmin);
  console.log('useUserPermissions - isLeader:', isLeader);

  // Permissões específicas
  const canAccessUserManagement = isAdmin;
  const canAccessSettings = isAdmin; // Apenas admin pode acessar configurações
  const canAccessEvents = isAdmin;
  const canAccessQRCodes = isAdmin;
  const canAccessMessaging = isAdmin || isLeader; // Líderes agora têm acesso
  const canAccessContacts = true; // Sempre permitir acesso aos contatos
  const canAccessDashboard = true; // Sempre permitir acesso ao dashboard
  const canAccessCells = true; // Sempre permitir acesso às células
  const canAccessPipeline = true; // Sempre permitir acesso ao pipeline
  const canAccessMinistries = isAdmin || ministryAccess.can_access_ministries;
  const canAccessKids = isAdmin || ministryAccess.can_access_kids;

  const permissions = {
    canAccessUserManagement,
    canAccessSettings,
    canAccessEvents,
    canAccessQRCodes,
    canAccessMessaging,
    canAccessContacts,
    canAccessDashboard,
    canAccessCells,
    canAccessPipeline,
    canAccessMinistries,
    canAccessKids,
    isLeader,
    isAdmin,
    userProfile,
    loading
  };

  console.log('useUserPermissions - todas as permissões:', permissions);

  return permissions;
};
