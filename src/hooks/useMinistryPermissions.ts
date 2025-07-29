
import { useUserPermissions } from './useUserPermissions';
import { useMinistries } from './useMinistries';

export const useMinistryPermissions = () => {
  const { isLeader, isAdmin, isUser, userProfile, ministryAccess } = useUserPermissions();
  const { ministries } = useMinistries();

  const getLeaderMinistries = () => {
    if (isAdmin) return ministries;
    if (isLeader && userProfile?.id) {
      return ministries.filter(ministry => ministry.leader_id === userProfile.id);
    }
    if (isUser && ministryAccess?.can_access_ministries) {
      // Usuários com permissão podem ver todos os ministérios, mas não podem editar
      return ministries;
    }
    return [];
  };

  const canEditMinistry = (ministryId: string) => {
    if (isAdmin) return true;
    if (isLeader && userProfile?.id) {
      const ministry = ministries.find(m => m.id === ministryId);
      return ministry?.leader_id === userProfile.id;
    }
    // Usuários nunca podem editar ministérios
    return false;
  };

  const canCreateMinistry = isAdmin;
  const canDeleteMinistry = isAdmin;
  const canManageMinistryMembers = (ministryId: string) => {
    if (isAdmin) return true;
    if (isLeader && userProfile?.id) {
      const ministry = ministries.find(m => m.id === ministryId);
      return ministry?.leader_id === userProfile.id;
    }
    return false;
  };

  return {
    getLeaderMinistries,
    canEditMinistry,
    canCreateMinistry,
    canDeleteMinistry,
    canManageMinistryMembers,
    isLeader,
    isAdmin,
    isUser,
    ministryAccess
  };
};
