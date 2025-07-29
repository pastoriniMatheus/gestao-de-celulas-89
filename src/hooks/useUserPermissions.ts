
import { useAuth } from '@/components/AuthProvider';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUserPermissions = () => {
  const { userProfile } = useAuth();
  const [ministryAccess, setMinistryAccess] = useState<any>(null);
  const [userMinistries, setUserMinistries] = useState<any[]>([]);
  const [isKidsMinistryMember, setIsKidsMinistryMember] = useState(false);

  console.log('useUserPermissions - userProfile:', userProfile);
  console.log('useUserPermissions - role:', userProfile?.role);

  useEffect(() => {
    if (userProfile?.user_id) {
      fetchMinistryAccess();
      fetchUserMinistries();
      checkKidsMinistryMembership();
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

  const checkKidsMinistryMembership = async () => {
    if (!userProfile?.id) return;
    
    try {
      // Verificar se o usuário é membro ou líder de ministérios Kids ou Jovens
      const { data: memberData, error: memberError } = await supabase
        .from('ministry_members')
        .select(`
          ministry:ministries!inner(name, id)
        `)
        .eq('contact_id', userProfile.id)
        .eq('active', true);

      if (memberError) {
        console.error('Erro ao buscar membros de ministério:', memberError);
        return;
      }

      // Verificar se é líder de ministérios Kids ou Jovens
      const { data: leaderData, error: leaderError } = await supabase
        .from('ministries')
        .select('name, id')
        .eq('leader_id', userProfile.id)
        .eq('active', true);

      if (leaderError) {
        console.error('Erro ao buscar ministérios liderados:', leaderError);
        return;
      }

      // Verificar se algum dos ministérios é Kids ou Jovens
      const kidsMinistryNames = ['kids', 'jovens', 'crianças', 'infantil', 'adolescentes'];
      
      const isMemberOfKids = memberData?.some(member => 
        kidsMinistryNames.some(name => 
          member.ministry.name.toLowerCase().includes(name)
        )
      ) || false;

      const isLeaderOfKids = leaderData?.some(ministry => 
        kidsMinistryNames.some(name => 
          ministry.name.toLowerCase().includes(name)
        )
      ) || false;

      setIsKidsMinistryMember(isMemberOfKids || isLeaderOfKids);
      
    } catch (error) {
      console.error('Erro ao verificar participação em ministérios Kids:', error);
    }
  };

  // Admin tem acesso a tudo
  const isAdmin = userProfile?.role === 'admin';
  const isLeader = userProfile?.role === 'leader';
  const isUser = userProfile?.role === 'user';

  console.log('useUserPermissions - isAdmin:', isAdmin);
  console.log('useUserPermissions - isLeader:', isLeader);
  console.log('useUserPermissions - isUser:', isUser);
  console.log('useUserPermissions - isKidsMinistryMember:', isKidsMinistryMember);

  // Permissões específicas baseadas nas regras
  const canAccessUserManagement = isAdmin;
  const canAccessSettings = isAdmin;
  const canAccessEvents = isAdmin;
  const canAccessQRCodes = isAdmin;
  const canAccessMessaging = isAdmin || isLeader;
  const canAccessContacts = isAdmin || isLeader;
  const canAccessDashboard = true;
  const canAccessCells = isAdmin || isLeader;
  const canAccessPipeline = isAdmin || isLeader;
  const canDeleteContacts = isAdmin; // Admin pode deletar contatos
  
  // Ministérios: Admin tem acesso completo, líderes só aos seus ministérios, usuários só se tiverem permissão
  const canAccessMinistries = isAdmin || 
    (isLeader && userMinistries.length > 0) || 
    (isUser && ministryAccess?.can_access_ministries);
  
  // Kids: Admin tem acesso completo, líderes/usuários que participam de ministérios Kids, ou usuários com permissão especial
  const canAccessKids = isAdmin || 
    isKidsMinistryMember ||
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
    canDeleteContacts,
    isLeader,
    isAdmin,
    isUser,
    userProfile,
    ministryAccess,
    userMinistries,
    isKidsMinistryMember
  };

  console.log('useUserPermissions - todas as permissões:', permissions);

  return permissions;
};
