'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

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
  id: string;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  role_in_org: 'OWNER' | 'ADMIN' | 'USER';
  is_org_admin: boolean;
  joined_at: string;
  created_at: string;
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
}

interface OrganizationContextType {
  // State
  organization: Organization | null;
  eventSpaces: EventSpace[];
  members: OrganizationMember[];
  stats: OrganizationStats | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
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

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

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
  const [stats, setStats] = useState<OrganizationStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load organization data for a user
  const loadOrganization = async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Get user's organization
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      if (!userData?.organization_id) {
        setOrganization(null);
        setEventSpaces([]);
        setMembers([]);
        setStats(null);
        return;
      }

      // Get organization details
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', userData.organization_id)
        .single();

      if (orgError) throw orgError;

      setOrganization(orgData);
    } catch (err) {
      console.error('Error loading organization:', err);
      setError(err instanceof Error ? err.message : 'Failed to load organization');
    } finally {
      setIsLoading(false);
    }
  };

  // Load organization data directly by organization ID (more efficient when we already have the ID)
  const loadOrganizationById = async (organizationId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Get organization details directly
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
      setEventSpaces([]);
      setMembers([]);
      setStats(null);
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
    } catch (err) {
      console.error('Error loading event spaces:', err);
      setError(err instanceof Error ? err.message : 'Failed to load event spaces');
    }
  };

  // Load organization members
  const loadMembers = async () => {
    if (!organization) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('organization_id', organization.id)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      console.error('Error loading members:', err);
      setError(err instanceof Error ? err.message : 'Failed to load members');
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
    } catch (err) {
      console.error('Error loading stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load stats');
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

  // Invite member to organization
  const inviteMember = async (email: string, role: 'ADMIN' | 'USER') => {
    if (!organization) throw new Error('No organization selected');

    try {
      // This would typically involve creating an invitation record
      // For now, we'll use the add_user_to_organization function
      const { error } = await supabase.rpc('add_user_to_organization', {
        p_user_id: null, // This would need to be handled differently for invitations
        p_organization_id: organization.id,
        p_added_by: organization.created_by,
        p_role_in_org: role
      });

      if (error) throw error;

      // Refresh members list
      await loadMembers();
    } catch (err) {
      console.error('Error inviting member:', err);
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
        .from('users')
        .update({
          role_in_org: role,
          is_org_admin: role === 'OWNER' || role === 'ADMIN'
        })
        .eq('id', userId)
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
    if (!organization) return;

    await Promise.all([
      loadOrganization(organization.created_by),
      loadEventSpaces(),
      loadMembers(),
      loadStats()
    ]);
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
    if (organization) {
      loadEventSpaces();
      loadMembers();
      loadStats();
    }
  }, [organization?.id]);

  const value: OrganizationContextType = {
    // State
    organization,
    eventSpaces,
    members,
    stats,
    isLoading,
    error,
    
    // Actions
    loadOrganization,
    loadOrganizationById,
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