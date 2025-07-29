
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
    } else {
      // Resetar estados quando não há usuário
      setMinistryAccess(null);
      setUserMinistries([]);
      setIsKidsMinistryMember(false);
    }
  }, [userProfile?.user_id]);

  const fetchMinistryAccess = async () => {
    if (!userProfile?.user_id) return;
    
    try {
      console.log('Buscando permissões para user_id:', userProfile.user_id);
      
      const { data, error } = await supabase
        .from('user_ministry_access')
        .select('*')
        .eq('user_id', userProfile.user_id)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar permissões de ministério:', error);
        // Se der erro de permissão, assumir que não tem acesso especial
        setMinistryAccess(null);
        return;
      }

      console.log('Permissões encontradas:', data);
      setMinistryAccess(data);
    } catch (error) {
      console.error('Erro geral ao buscar permissões de ministério:', error);
      setMinistryAccess(null);
    }
  };

  const fetchUserMinistries = async () => {
    if (!userProfile?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('ministries')
        .select('*')
        .eq('leader_id', userProfile.id)
        .eq('active', true);

      if (error) {
        console.error('Erro ao buscar ministérios do usuário:', error);
        setUserMinistries([]);
        return;
      }

      console.log('Ministérios liderados:', data);
      setUserMinistries(data || []);
    } catch (error) {
      console.error('Erro ao buscar ministérios do usuário:', error);
      setUserMinistries([]);
    }
  };

  const checkKidsMinistryMembership = async () => {
    if (!userProfile?.id) return;
    
    try {
      console.log('Verificando participação em ministérios Kids para profile_id:', userProfile.id);
      
      // Verificar se o usuário é membro de ministérios Kids ou Jovens
      const { data: memberData, error: memberError } = await supabase
        .from('ministry_members')
        .select(`
          ministry:ministries!inner(name, id)
        `)
        .eq('contact_id', userProfile.id)
        .eq('active', true);

      if (memberError) {
        console.error('Erro ao buscar membros de ministério:', memberError);
      } else {
        console.log('Membros de ministério encontrados:', memberData);
      }

      // Verificar se é líder de ministérios Kids ou Jovens
      const { data: leaderData, error: leaderError } = await supabase
        .from('ministries')
        .select('name, id')
        .eq('leader_id', userProfile.id)
        .eq('active', true);

      if (leaderError) {
        console.error('Erro ao buscar ministérios liderados:', leaderError);
      } else {
        console.log('Ministérios liderados encontrados:', leaderData);
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

      const kidsAccess = isMemberOfKids || isLeaderOfKids;
      console.log('Acesso ao Kids - Membro:', isMemberOfKids, 'Líder:', isLeaderOfKids, 'Total:', kidsAccess);
      
      setIsKidsMinistryMember(kidsAccess);
      
    } catch (error) {
      console.error('Erro ao verificar participação em ministérios Kids:', error);
      setIsKidsMinistryMember(false);
    }
  };

  // Verificar se o usuário está carregado
  if (!userProfile) {
    return {
      canAccessUserManagement: false,
      canAccessSettings: false,
      canAccessEvents: false,
      canAccessQRCodes: false,
      canAccessMessaging: false,
      canAccessContacts: false,
      canAccessDashboard: false,
      canAccessCells: false,
      canAccessPipeline: false,
      canAccessMinistries: false,
      canAccessKids: false,
      canDeleteContacts: false,
      isLeader: false,
      isAdmin: false,
      isUser: false,
      userProfile: null,
      ministryAccess: null,
      userMinistries: [],
      isKidsMinistryMember: false
    };
  }

  // Admin tem acesso a tudo
  const isAdmin = userProfile?.role === 'admin';
  const isLeader = userProfile?.role === 'leader';
  const isUser = userProfile?.role === 'user';

  console.log('useUserPermissions - isAdmin:', isAdmin);
  console.log('useUserPermissions - isLeader:', isLeader);
  console.log('useUserPermissions - isUser:', isUser);
  console.log('useUserPermissions - isKidsMinistryMember:', isKidsMinistryMember);
  console.log('useUserPermissions - ministryAccess:', ministryAccess);

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
  const canDeleteContacts = isAdmin; // Apenas admin pode deletar contatos
  
  // Ministérios: Admin tem acesso completo, líderes só aos seus ministérios, usuários só se tiverem permissão
  const canAccessMinistries = isAdmin || 
    (isLeader && userMinistries.length > 0) || 
    (isUser && ministryAccess?.can_access_ministries);
  
  // Kids: Admin tem acesso completo, líderes/usuários que participam de ministérios Kids, ou usuários com permissão especial
  const canAccessKids = isAdmin || 
    isKidsMinistryMember ||
    (isUser && ministryAccess?.can_access_kids);

  console.log('useUserPermissions - canAccessKids final:', canAccessKids);
  console.log('useUserPermissions - ministryAccess.can_access_kids:', ministryAccess?.can_access_kids);

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
