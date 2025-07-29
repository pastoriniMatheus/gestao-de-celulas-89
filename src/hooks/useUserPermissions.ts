
import { useAuth } from '@/components/AuthProvider';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUserPermissions = () => {
  const { userProfile } = useAuth();
  const [ministryAccess, setMinistryAccess] = useState<any>(null);
  const [userMinistries, setUserMinistries] = useState<any[]>([]);

  console.log('useUserPermissions - userProfile:', userProfile);
  console.log('useUserPermissions - role:', userProfile?.role);

  useEffect(() => {
    if (userProfile?.user_id) {
      fetchMinistryAccess();
      fetchUserMinistries();
    }
  }, [userProfile?.user_id]);

  const fetchMinistryAccess = async () => {
    if (!userProfile?.user_id) return;
    
    try {
      const { data, error } = await supabase
        .from('user_ministry_access')
        .select('*')
        .eq('user_id', userProfile.user_id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar permissões de ministério:', error);
        return;
      }

      setMinistryAccess(data);
    } catch (error) {
      console.error('Erro ao buscar permissões de ministério:', error);
    }
  };

  const fetchUserMinistries = async () => {
    if (!userProfile?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('ministries')
        .select('*')
        .eq('leader_id', userProfile.id);

      if (error) {
        console.error('Erro ao buscar ministérios do usuário:', error);
        return;
      }

      setUserMinistries(data || []);
    } catch (error) {
      console.error('Erro ao buscar ministérios do usuário:', error);
    }
  };

  // Admin tem acesso a tudo
  const isAdmin = userProfile?.role === 'admin';
  const isLeader = userProfile?.role === 'leader';
  const isUser = userProfile?.role === 'user';

  console.log('useUserPermissions - isAdmin:', isAdmin);
  console.log('useUserPermissions - isLeader:', isLeader);
  console.log('useUserPermissions - isUser:', isUser);

  // Permissões específicas baseadas nas regras
  const canAccessUserManagement = isAdmin;
  const canAccessSettings = isAdmin; // Apenas admin pode acessar configurações
  const canAccessEvents = isAdmin;
  const canAccessQRCodes = isAdmin;
  const canAccessMessaging = isAdmin || isLeader; // Admin e líderes podem acessar mensagens
  const canAccessContacts = isAdmin || isLeader; // Admin e líderes podem acessar contatos
  const canAccessDashboard = true; // Todos podem acessar o dashboard
  const canAccessCells = isAdmin || isLeader; // Admin e líderes podem acessar células
  const canAccessPipeline = isAdmin || isLeader; // Admin e líderes podem acessar pipeline
  
  // Ministérios: Admin tem acesso completo, líderes só aos seus ministérios, usuários só se tiverem permissão
  const canAccessMinistries = isAdmin || 
    (isLeader && userMinistries.length > 0) || 
    (isUser && ministryAccess?.can_access_ministries);
  
  // Kids: Admin tem acesso completo, líderes só se tiverem ministério kids, usuários só se tiverem permissão
  const canAccessKids = isAdmin || 
    (isLeader && ministryAccess?.can_access_kids) || 
    (isUser && ministryAccess?.can_access_kids);

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
    isUser,
    userProfile,
    ministryAccess,
    userMinistries
  };

  console.log('useUserPermissions - todas as permissões:', permissions);

  return permissions;
};
