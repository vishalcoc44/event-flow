'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

// Types
export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  subscription_plan: 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';
  subscription_status: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'EXPIRED';
  subscription_start_date?: string;
  subscription_end_date?: string;
  max_events: number;
  max_users: number;
  max_storage_mb: number;
  current_events_count: number;
  current_users_count: number;
  current_storage_mb: number;
  is_public: boolean;
  allow_public_events: boolean;
  require_approval_for_events: boolean;
  allow_user_registration: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EventSpace {
  id: string;
  name: string;
  description?: string;
  slug: string;
  organization_id: string;
  created_by: string;
  is_public: boolean;
  allow_public_events: boolean;
  require_approval_for_events: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string; // membership id
  user_id: string;
  organization_id: string;
  role_in_org: 'OWNER' | 'ADMIN' | 'USER';
  is_org_admin: boolean;
  joined_at: string;
  // User details
  profiles?: {
    email: string;
    username?: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
  // Organization details (joined)
  organizations?: Organization;
}

export interface UserMembership {
  id: string;
  organization_id: string;
  role_in_org: 'OWNER' | 'ADMIN' | 'USER';
  is_org_admin: boolean;
  joined_at: string;
  organizations: {
    id: string;
    name: string;
    slug: string;
    logo_url?: string;
  };
}

export interface OrganizationStats {
  organization_id: string;
  organization_name: string;
  subscription_plan: string;
  subscription_status: string;
  max_events: number;
  max_users: number;
  current_events_count: number;
  current_users_count: number;
  total_event_spaces: number;
  total_events: number;
  total_bookings: number;
  total_users: number;
  events_last_30_days: number;
  bookings_last_30_days: number;
  total_revenue: number;
  revenue_last_30_days: number;
}

interface OrganizationContextType {
  // State
  organization: Organization | null;
  eventSpaces: EventSpace[];
  members: OrganizationMember[];
  stats: OrganizationStats | null;
  userMemberships: UserMembership[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadUserMemberships: (userId: string) => Promise<void>;
  switchOrganization: (organizationId: string) => Promise<void>;
  loadAllOrganizationData: (userId: string, organizationId?: string) => Promise<void>;
  loadOrganization: (userId: string) => Promise<void>;
  loadOrganizationById: (organizationId: string) => Promise<void>;
  loadEventSpaces: () => Promise<void>;
  loadMembers: () => Promise<void>;
  loadStats: () => Promise<void>;
  createEventSpace: (data: Partial<EventSpace>) => Promise<EventSpace>;
  updateOrganization: (data: Partial<Organization>) => Promise<void>;
  inviteMember: (email: string, role: 'ADMIN' | 'USER') => Promise<void>;
  removeMember: (userId: string) => Promise<void>;
  updateMemberRole: (userId: string, role: 'OWNER' | 'ADMIN' | 'USER') => Promise<void>;
  refreshOrganization: () => Promise<void>;
  clearOrganization: () => void;
}

export const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};

interface OrganizationProviderProps {
  children: ReactNode;
}

export const OrganizationProvider: React.FC<OrganizationProviderProps> = ({ children }) => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [eventSpaces, setEventSpaces] = useState<EventSpace[]>([]);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [userMemberships, setUserMemberships] = useState<UserMembership[]>([]);
  const [stats, setStats] = useState<OrganizationStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [loadingMemberships, setLoadingMemberships] = useState(false);

  // Load all memberships for a user
  const loadUserMemberships = async (userId: string) => {
    if (loadingMemberships) return;

    try {
      setIsLoading(true);
      setLoadingMemberships(true);
      const { data, error } = await supabase.rpc('get_user_memberships', {
        user_uuid: userId
      });

      if (error) throw error;
      setUserMemberships(data || []);
    } catch (err: any) {
      console.error('Error loading memberships:', err);
      setError(err.message || 'Failed to load organization memberships');
    } finally {
      setIsLoading(false);
      setLoadingMemberships(false);
    }
  };

  // Consolidate all loading into one atomic operation to prevent waterfalls (Bug #20)
  const loadAllOrganizationData = async (userId: string, targetOrgId?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. Get user memberships first
      const { data: memberships, error: memsError } = await supabase.rpc('get_user_memberships', {
        user_uuid: userId
      });
      if (memsError) throw memsError;
      setUserMemberships(memberships || []);

      // 2. Identify the target organization
      let orgId = targetOrgId;
      if (!orgId) {
        const { data: userData } = await supabase.from('users').select('organization_id').eq('id', userId).single();
        orgId = userData?.organization_id;
      }

      if (!orgId) {
        setOrganization(null);
        return;
      }

      // 3. Batch fetch all organization-linked data (Bug #20 optimization)
      const [orgRes, spacesRes, membersRes, statsRes] = await Promise.all([
        supabase.from('organizations').select('*').eq('id', orgId).single(),
        supabase.from('event_spaces').select('*').eq('organization_id', orgId).order('created_at', { ascending: true }),
        supabase.rpc('get_organization_members', { org_id: orgId }),
        supabase.from('organization_dashboard_stats').select('*').eq('organization_id', orgId).single()
      ]);

      if (orgRes.error) throw orgRes.error;

      setOrganization(orgRes.data);
      setEventSpaces(spacesRes.data || []);
      setMembers(membersRes.data || []);
      setStats(statsRes.data || null);

    } catch (err: any) {
      console.error('Error loading comprehensive org data:', err);
      setError(err.message || 'Failed to load organization workspace');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-load data when user becomes available (RESTORED logic from hook to Provider)
  const { user, isLoading: authLoading } = useAuth();
  const hasAttemptedInitialLoad = useRef(false);

  useEffect(() => {
    if (authLoading) return;

    if (user?.id) {
      // If user is logged in, auto-load their memberships if not already loaded
      if (userMemberships.length === 0 && !isLoading) {
        console.log('🔄 OrganizationProvider: Auto-loading memberships for user:', user.id);
        loadUserMemberships(user.id);
      }

      // If user has an active organization, auto-load its data
      if (user.organization_id && !organization && !isLoading) {
        console.log('🔄 OrganizationProvider: Auto-loading active organization:', user.organization_id);
        loadAllOrganizationData(user.id, user.organization_id);
        hasAttemptedInitialLoad.current = true;
      }
    } else if (!authLoading && !user) {
      // Clear data on logout
      setOrganization(null);
      setUserMemberships([]);
      setEventSpaces([]);
      setMembers([]);
      setStats(null);
      hasAttemptedInitialLoad.current = false;
    }
  }, [user?.id, user?.organization_id, authLoading, isLoading, organization, userMemberships.length]); // Added dependencies

  // Switch the active organization
  const switchOrganization = async (organizationId: string) => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: membership, error: memError } = await supabase
        .from('organization_members')
        .select('*')
        .eq('user_id', user.id)
        .eq('organization_id', organizationId)
        .single();

      if (memError) throw memError;

      const { error: updateError } = await supabase
        .from('users')
        .update({
          organization_id: organizationId,
          role_in_org: membership.role_in_org,
          is_org_admin: membership.is_org_admin,
          last_active_organization_id: organizationId
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Use the consolidated loader for atomic state transition (Bug #19)
      await loadAllOrganizationData(user.id, organizationId);
    } catch (err: any) {
      console.error('Error switching organization:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load organization data for a user
  const loadOrganization = async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Get user's active organization from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      if (!userData?.organization_id) {
        setOrganization(null);
        return;
      }

      await loadOrganizationById(userData.organization_id);
      await loadUserMemberships(userId);
    } catch (err) {
      console.error('Error loading organization:', err);
      setError(err instanceof Error ? err.message : 'Failed to load organization');
    } finally {
      setIsLoading(false);
    }
  };

  // Load organization data directly by organization ID
  const loadOrganizationById = async (organizationId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single();

      if (orgError) throw orgError;
      setOrganization(orgData);
    } catch (err) {
      console.error('Error loading organization by ID:', err);
      setError(err instanceof Error ? err.message : 'Failed to load organization');
      setOrganization(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Load event spaces for the organization
  const loadEventSpaces = async () => {
    if (!organization) return;

    try {
      const { data, error } = await supabase
        .from('event_spaces')
        .select('*')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setEventSpaces(data || []);
    } catch (err: any) {
      console.error('Error loading event spaces:', err);
      setError(err.message || 'Failed to load event spaces');
    }
  };

  // Load organization members from the membership table
  const loadMembers = async () => {
    if (!organization) return;

    try {
      const { data, error } = await supabase.rpc('get_organization_members', {
        org_id: organization.id
      });

      if (error) throw error;
      setMembers(data || []);
    } catch (err: any) {
      console.error('Error loading members:', {
        message: err.message,
        details: err.details,
        hint: err.hint,
        code: err.code,
        full_error: err
      });
      setError(err.message || 'Failed to load organization members');
    }
  };

  // Load organization stats
  const loadStats = async () => {
    if (!organization) return;

    try {
      const { data, error } = await supabase
        .from('organization_dashboard_stats')
        .select('*')
        .eq('organization_id', organization.id)
        .single();

      if (error) throw error;
      setStats(data);
    } catch (err: any) {
      console.error('Error loading stats:', err);
      // Stats failure is less critical, don't set error state
    }
  };

  // Create new event space
  const createEventSpace = async (data: Partial<EventSpace>): Promise<EventSpace> => {
    if (!organization) throw new Error('No organization selected');

    try {
      const { data: newSpace, error } = await supabase
        .from('event_spaces')
        .insert({
          ...data,
          organization_id: organization.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh event spaces list
      await loadEventSpaces();
      return newSpace;
    } catch (err) {
      console.error('Error creating event space:', err);
      throw err;
    }
  };

  // Update organization
  const updateOrganization = async (data: Partial<Organization>) => {
    if (!organization) throw new Error('No organization selected');

    try {
      const { error } = await supabase
        .from('organizations')
        .update(data)
        .eq('id', organization.id);

      if (error) throw error;

      // Refresh organization data
      await loadOrganization(organization.created_by);
    } catch (err) {
      console.error('Error updating organization:', err);
      throw err;
    }
  };

  // Invite member to organization (now using secure invitation system)
  const inviteMember = async (email: string, role: 'ADMIN' | 'USER', message?: string) => {
    if (!organization) throw new Error('No organization selected');

    try {
      // Send invitation instead of directly adding user
      const { error } = await supabase.rpc('send_organization_invitation', {
        p_organization_id: organization.id,
        p_email: email,
        p_role: role,
        p_message: message || `You've been invited to join ${organization.name}`
      });

      if (error) throw error;

      // Note: We don't refresh members list here since invited users aren't members yet
      // They become members only after accepting the invitation
    } catch (err) {
      console.error('Error sending invitation:', err);
      throw err;
    }
  };

  // Remove member from organization
  const removeMember = async (userId: string) => {
    if (!organization) throw new Error('No organization selected');

    try {
      const { error } = await supabase.rpc('remove_user_from_organization', {
        p_user_id: userId,
        p_organization_id: organization.id,
        p_removed_by: organization.created_by
      });

      if (error) throw error;

      // Refresh members list
      await loadMembers();
    } catch (err) {
      console.error('Error removing member:', err);
      throw err;
    }
  };

  // Update member role
  const updateMemberRole = async (userId: string, role: 'OWNER' | 'ADMIN' | 'USER') => {
    if (!organization) throw new Error('No organization selected');

    try {
      const { error } = await supabase
        .from('organization_members')
        .update({
          role_in_org: role,
          is_org_admin: role === 'OWNER' || role === 'ADMIN'
        })
        .eq('user_id', userId)
        .eq('organization_id', organization.id);

      if (error) throw error;

      // Refresh members list
      await loadMembers();
    } catch (err) {
      console.error('Error updating member role:', err);
      throw err;
    }
  };

  // Refresh all organization data
  const refreshOrganization = async () => {
    if (!organization || !organization.created_by) return;
    await loadAllOrganizationData(organization.created_by, organization.id);
  };

  // Clear organization data
  const clearOrganization = () => {
    setOrganization(null);
    setEventSpaces([]);
    setMembers([]);
    setStats(null);
    setError(null);
  };

  // Load organization data when organization changes
  useEffect(() => {
    if (!organization?.id) return;

    loadEventSpaces();
    loadMembers();
    loadStats();

    // Set up Realtime Subscriptions (Bug #14: Cleanup Race Conditions)
    const orgId = organization.id;
    console.log('📡 Setting up realtime listeners for organization:', orgId);

    const channel = supabase
      .channel(`org-updates-${orgId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'organizations',
        filter: `id=eq.${orgId}`
      }, () => {
        console.log('♻️ Organization updated, refreshing...');
        loadAllOrganizationData(organization.created_by, orgId);
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'event_spaces',
        filter: `organization_id=eq.${orgId}`
      }, () => {
        console.log('♻️ Event spaces changed, refreshing...');
        loadEventSpaces();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'organization_members',
        filter: `organization_id=eq.${orgId}`
      }, () => {
        console.log('♻️ Members changed, refreshing...');
        loadMembers();
      })
      .subscribe();

    return () => {
      console.log('🔌 Tearing down realtime listeners for organization:', orgId);
      supabase.removeChannel(channel).then((status) => {
        if (status === 'error') console.error('❌ Error removing channel');
      });
    };
  }, [organization?.id, organization?.created_by]);


  const value: OrganizationContextType = {
    // State
    organization,
    eventSpaces,
    members,
    stats,
    userMemberships,
    isLoading,
    error,

    // Actions
    loadUserMemberships,
    switchOrganization,
    loadAllOrganizationData,
    loadOrganization: (userId: string) => loadAllOrganizationData(userId),
    loadOrganizationById: async (orgId: string) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        await loadAllOrganizationData(user?.id || '', orgId);
      } catch (err) {
        console.error('Error in loadOrganizationById action:', err);
        // Fallback to basic load if user session fails
        await loadOrganizationById(orgId);
      }
    },
    loadEventSpaces,
    loadMembers,
    loadStats,
    createEventSpace,
    updateOrganization,
    inviteMember,
    removeMember,
    updateMemberRole,
    refreshOrganization,
    clearOrganization,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}; 