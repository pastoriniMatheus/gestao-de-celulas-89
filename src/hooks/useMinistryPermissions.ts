
import { useUserPermissions } from './useUserPermissions';
import { useMinistries } from './useMinistries';

export const useMinistryPermissions = () => {
  const { isLeader, isAdmin, userProfile } = useUserPermissions();
  const { ministries } = useMinistries();

  const getLeaderMinistries = () => {
    if (isAdmin) return ministries;
    if (isLeader && userProfile?.id) {
      return ministries.filter(ministry => ministry.leader_id === userProfile.id);
    }
    return [];
  };

  const canEditMinistry = (ministryId: string) => {
    if (isAdmin) return true;
    if (isLeader && userProfile?.id) {
      const ministry = ministries.find(m => m.id === ministryId);
      return ministry?.leader_id === userProfile.id;
    }
    return false;
  };

  const canCreateMinistry = isAdmin;
  const canDeleteMinistry = isAdmin;

  return {
    getLeaderMinistries,
    canEditMinistry,
    canCreateMinistry,
    canDeleteMinistry,
    isLeader,
    isAdmin
  };
};
