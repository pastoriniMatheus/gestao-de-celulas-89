
import { useUserPermissions } from './useUserPermissions';

export const useLeaderPermissions = () => {
  const { isLeader, isAdmin, userProfile } = useUserPermissions();

  const filterCellsForLeader = (cells: any[]) => {
    if (isAdmin) return cells;
    if (isLeader && userProfile?.id) {
      return cells.filter(cell => cell.leader_id === userProfile.id);
    }
    return [];
  };

  const filterContactsForLeader = (contacts: any[]) => {
    if (isAdmin) return contacts;
    if (isLeader && userProfile?.id) {
      // Aqui assumimos que os contatos já vêm filtrados pelo hook useLeaderContacts
      return contacts;
    }
    return [];
  };

  const canAccessSettings = isAdmin;
  const canManageAllCells = isAdmin;
  const canManageAllContacts = isAdmin;

  return {
    filterCellsForLeader,
    filterContactsForLeader,
    canAccessSettings,
    canManageAllCells,
    canManageAllContacts,
    isLeader,
    isAdmin,
    userProfile
  };
};
