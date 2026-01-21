import { useEffect, useContext, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization, OrganizationContext } from '@/contexts/OrganizationContext';

// Hook to automatically load organization data when user is authenticated
export const useOrganizationData = () => {
  const { user, isLoading: userLoading } = useAuth();

  // Directly use useContext to avoid the "must be used within provider" throw
  // since we intentionally omit providers on some public pages for performance
  const orgContext = useContext(OrganizationContext);

  const {
    loadOrganizationById,
    organization,
    isLoading,
    error,
    updateOrganization,
    loadUserMemberships
  } = orgContext || {
    loadOrganizationById: undefined,
    organization: null,
    isLoading: false,
    error: null,
    updateOrganization: async () => ({}),
    loadUserMemberships: async () => { }
  } as any;

  // Use a ref to track if loading is already in progress to prevent loops
  const loadingRef = useRef<{ [key: string]: boolean }>({});
  const membershipsLoadingRef = useRef<boolean>(false);

  useEffect(() => {
    // Only load organization data if AuthContext hasn't already provided it in user object
    // and we actually need the full organization details
    if (!userLoading && user?.organization_id && !organization && loadOrganizationById) {
      if (!loadingRef.current[user.organization_id]) {
        console.log('Loading organization details by ID:', user.organization_id);
        loadingRef.current[user.organization_id] = true;
        loadOrganizationById(user.organization_id).finally(() => {
          // Keep it true for a bit to prevent immediate retry if it failed
          setTimeout(() => {
            if (loadingRef.current) loadingRef.current[user!.organization_id!] = false;
          }, 5000);
        });
      }
    }

    // Load user memberships if we have a user but no memberships loaded
    if (!userLoading && user?.id && loadUserMemberships && orgContext?.userMemberships?.length === 0) {
      if (!membershipsLoadingRef.current) {
        console.log('Loading user memberships for:', user.id);
        membershipsLoadingRef.current = true;
        loadUserMemberships(user.id).finally(() => {
          setTimeout(() => {
            membershipsLoadingRef.current = false;
          }, 5000);
        });
      }
    }
  }, [user?.id, user?.organization_id, userLoading, organization, loadOrganizationById, loadUserMemberships, orgContext?.userMemberships?.length]);

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

  // Directly use useContext to avoid the "must be used within provider" throw
  const orgContext = useContext(OrganizationContext);
  const { organization, isLoading: orgLoading } = orgContext || {
    organization: null,
    isLoading: false
  };

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
  const orgContext = useContext(OrganizationContext);
  const { organization, stats } = orgContext || {
    organization: null,
    stats: null
  };

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
  const orgContext = useContext(OrganizationContext);
  const { organization } = orgContext || { organization: null };

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