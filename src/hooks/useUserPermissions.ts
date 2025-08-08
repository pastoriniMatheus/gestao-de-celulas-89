
import { useAuth } from '@/components/AuthProvider';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUserPermissions = () => {
  const { userProfile } = useAuth();
  const [ministryAccess, setMinistryAccess] = useState<any>(null);
  const [isInKidsMinistry, setIsInKidsMinistry] = useState(false);
  const [loading, setLoading] = useState(true);

  console.log('useUserPermissions - userProfile:', userProfile);
  console.log('useUserPermissions - role:', userProfile?.role);

  useEffect(() => {
    const checkMinistryAccess = async () => {
      if (!userProfile?.user_id) {
        setLoading(false);
        return;
      }

      try {
        // Verificar acesso específico na tabela user_ministry_access
        const { data: accessData } = await supabase
          .from('user_ministry_access')
          .select('*')
          .eq('user_id', userProfile.user_id)
          .single();

        setMinistryAccess(accessData);

        // Verificar se o usuário está no ministério Kids
        const { data: kidsMinistryData } = await supabase
          .from('ministries')
          .select('id')
          .eq('name', 'Kids')
          .single();

        if (kidsMinistryData) {
          const { data: memberData } = await supabase
            .from('ministry_members')
            .select('id')
            .eq('ministry_id', kidsMinistryData.id)
            .eq('contact_id', userProfile.id)
            .eq('active', true)
            .single();

          setIsInKidsMinistry(!!memberData);
        }
      } catch (error) {
        console.error('Erro ao verificar permissões de ministério:', error);
      } finally {
        setLoading(false);
      }
    };

    checkMinistryAccess();
  }, [userProfile?.user_id, userProfile?.id]);

  // Admin tem acesso a tudo
  const isAdmin = userProfile?.role === 'admin';
  const isLeader = userProfile?.role === 'leader';

  console.log('useUserPermissions - isAdmin:', isAdmin);
  console.log('useUserPermissions - isLeader:', isLeader);
  console.log('useUserPermissions - ministryAccess:', ministryAccess);
  console.log('useUserPermissions - isInKidsMinistry:', isInKidsMinistry);

  // Permissões específicas
  const canAccessUserManagement = isAdmin;
  const canAccessSettings = isAdmin;
  const canAccessEvents = isAdmin;
  const canAccessQRCodes = isAdmin;
  const canAccessMessaging = isAdmin || isLeader;
  const canAccessContacts = isAdmin || isLeader; // Líderes podem acessar, mas verão apenas seus contatos
  const canAccessDashboard = true;
  const canAccessCells = true;
  const canAccessPipeline = true;
  const canAccessMinistries = isAdmin;
  
  // Acesso ao Kids apenas para quem está no ministério ou é admin
  const canAccessKids = isAdmin || isInKidsMinistry || (ministryAccess?.can_access_kids === true);
  
  // REMOVER acesso à genealogia completamente
  const canAccessGenealogy = false;

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
    canAccessGenealogy, // Sempre false
    isLeader,
    isAdmin,
    userProfile,
    loading
  };

  console.log('useUserPermissions - todas as permissões:', permissions);

  return permissions;
};
