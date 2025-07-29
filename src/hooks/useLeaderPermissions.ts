
import { useUserPermissions } from './useUserPermissions';

export const useLeaderPermissions = () => {
  const { isLeader, isAdmin, isUser, userProfile, ministryAccess } = useUserPermissions();

  const filterCellsForLeader = (cells: any[]) => {
    if (isAdmin) return cells;
    if (isLeader && userProfile?.id) {
      return cells.filter(cell => cell.leader_id === userProfile.id);
    }
    // Usuários não têm acesso a células
    return [];
  };

  const filterContactsForLeader = (contacts: any[]) => {
    if (isAdmin) return contacts;
    if (isLeader && userProfile?.id) {
      // Líderes veem apenas contatos das suas células
      return contacts;
    }
    // Usuários não têm acesso a contatos
    return [];
  };

  const canAccessSettings = isAdmin;
  const canManageAllCells = isAdmin;
  const canManageAllContacts = isAdmin;
  const canAccessKids = isAdmin || 
    (isLeader && ministryAccess?.can_access_kids) || 
    (isUser && ministryAccess?.can_access_kids);

  return {
    filterCellsForLeader,
    filterContactsForLeader,
    canAccessSettings,
    canManageAllCells,
    canManageAllContacts,
    canAccessKids,
    isLeader,
    isAdmin,
    isUser,
    userProfile,
    ministryAccess
  };
};
