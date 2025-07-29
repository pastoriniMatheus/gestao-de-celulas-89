
import { useUserPermissions } from './useUserPermissions';

export const useLeaderPermissions = () => {
  const { 
    isLeader, 
    isAdmin, 
    isUser, 
    userProfile, 
    ministryAccess, 
    canDeleteContacts, 
    isKidsMinistryMember 
  } = useUserPermissions();

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
    isKidsMinistryMember ||
    (isUser && ministryAccess?.can_access_kids);

  return {
    filterCellsForLeader,
    filterContactsForLeader,
    canAccessSettings,
    canManageAllCells,
    canManageAllContacts,
    canAccessKids,
    canDeleteContacts, // Garantir que esta permissão está sendo retornada
    isLeader,
    isAdmin,
    isUser,
    userProfile,
    ministryAccess,
    isKidsMinistryMember
  };
};
