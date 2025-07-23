
import { useAuth } from '@/components/AuthProvider';
import { useUserMinistryAccess } from './useUserMinistryAccess';

export const useUserPermissions = () => {
  const { userProfile } = useAuth();
  const { canAccessMinistries, canAccessKids } = useUserMinistryAccess();

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
  const canAccessMessaging = isAdmin || isLeader; // Líderes podem acessar mensagens
  const canAccessContacts = true; // Sempre permitir acesso aos contatos
  const canAccessDashboard = true; // Sempre permitir acesso ao dashboard
  const canAccessCells = true; // Sempre permitir acesso às células
  const canAccessPipeline = true; // Sempre permitir acesso ao pipeline
  const canAccessMinistriesPage = isAdmin || canAccessMinistries(); // Admin ou usuários com permissão específica
  const canAccessKidsPage = isAdmin || canAccessKids(); // Admin ou usuários com permissão específica

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
    canAccessMinistriesPage,
    canAccessKidsPage,
    isLeader,
    isAdmin,
    userProfile
  };

  console.log('useUserPermissions - todas as permissões:', permissions);

  return permissions;
};
