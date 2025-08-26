import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';

// Hook to automatically load organization data when user is authenticated
export const useOrganizationData = () => {
  const { user, isLoading: userLoading } = useAuth();
  const { loadOrganization, loadOrganizationById, organization, isLoading, error, updateOrganization } = useOrganization();

  useEffect(() => {
    // Optimization: If we already have the organization_id in user data, load organization directly
    // This skips the extra database call to look up the user's organization_id
    if (!userLoading && user?.organization_id && !organization) {
      console.log('Loading organization directly by ID:', user.organization_id);
      loadOrganizationById(user.organization_id);
    } else if (!userLoading && user?.id && !user?.organization_id && !organization) {
      // Fallback: user exists but no organization_id in user data, use the original method
      console.log('Loading organization via user lookup for user:', user.id);
      loadOrganization(user.id);
    }
  }, [user?.id, user?.organization_id, userLoading, organization, loadOrganization, loadOrganizationById]);

  return {
    organization,
    orgLoading: userLoading || isLoading,
    error,
    hasOrganization: !!organization,
    isOrganizationOwner: organization?.created_by === user?.id,
    isOrganizationAdmin: user?.is_org_admin || false,
    userRoleInOrg: user?.role_in_org || 'USER',
    updateOrganization,
  };
};

// Hook to check if user has specific permissions in organization
export const useOrganizationPermissions = () => {
  const { user, isLoading: userLoading } = useAuth();
  const { organization, isLoading: orgLoading } = useOrganization();

  const isOwner = organization?.created_by === user?.id;
  const isAdmin = user?.is_org_admin || false;
  const isUser = user?.role_in_org === 'USER';
  const hasOrganization = !!organization;
  const isLoadingPermissions = userLoading || orgLoading;

  const canManageMembers = isOwner || isAdmin;
  const canManageEventSpaces = isOwner || isAdmin;
  const canManageOrganization = isOwner;
  const canCreateEvents = hasOrganization;
  const canInviteUsers = isOwner || isAdmin;
  const canRemoveUsers = isOwner;
  const canUpdateUserRoles = isOwner;

  return {
    isOwner,
    isAdmin,
    isUser,
    hasOrganization,
    isLoadingPermissions,
    canManageMembers,
    canManageEventSpaces,
    canManageOrganization,
    canCreateEvents,
    canInviteUsers,
    canRemoveUsers,
    canUpdateUserRoles
  };
};

// Hook to get organization usage information
export const useOrganizationUsage = () => {
  const { organization, stats } = useOrganization();

  if (!organization || !stats) {
    return {
      eventsUsage: { current: 0, max: 0, percentage: 0 },
      usersUsage: { current: 0, max: 0, percentage: 0 },
      storageUsage: { current: 0, max: 0, percentage: 0 },
      isNearLimit: false,
      isOverLimit: false
    };
  }

  const eventsUsage = {
    current: organization.current_events_count,
    max: organization.max_events,
    percentage: Math.round((organization.current_events_count / organization.max_events) * 100)
  };

  const usersUsage = {
    current: organization.current_users_count,
    max: organization.max_users,
    percentage: Math.round((organization.current_users_count / organization.max_users) * 100)
  };

  const storageUsage = {
    current: organization.current_storage_mb,
    max: organization.max_storage_mb,
    percentage: Math.round((organization.current_storage_mb / organization.max_storage_mb) * 100)
  };

  const isNearLimit = eventsUsage.percentage >= 80 || usersUsage.percentage >= 80 || storageUsage.percentage >= 80;
  const isOverLimit = eventsUsage.percentage > 100 || usersUsage.percentage > 100 || storageUsage.percentage > 100;

  return {
    eventsUsage,
    usersUsage,
    storageUsage,
    isNearLimit,
    isOverLimit
  };
};

// Hook to get subscription information
export const useSubscriptionInfo = () => {
  const { organization } = useOrganization();

  if (!organization) {
    return {
      plan: 'FREE' as const,
      status: 'ACTIVE' as const,
      isActive: true,
      isSuspended: false,
      isCancelled: false,
      isExpired: false,
      canUpgrade: false,
      canDowngrade: false,
      daysUntilExpiry: null
    };
  }

  const isActive = organization.subscription_status === 'ACTIVE';
  const isSuspended = organization.subscription_status === 'SUSPENDED';
  const isCancelled = organization.subscription_status === 'CANCELLED';
  const isExpired = organization.subscription_status === 'EXPIRED';

  const canUpgrade = organization.subscription_plan !== 'ENTERPRISE';
  const canDowngrade = organization.subscription_plan !== 'FREE';

  let daysUntilExpiry = null;
  if (organization.subscription_end_date) {
    const endDate = new Date(organization.subscription_end_date);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  return {
    plan: organization.subscription_plan,
    status: organization.subscription_status,
    isActive,
    isSuspended,
    isCancelled,
    isExpired,
    canUpgrade,
    canDowngrade,
    daysUntilExpiry
  };
}; 