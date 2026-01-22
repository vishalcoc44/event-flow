import { supabase } from '../supabase';
import type { Organization, EventSpace } from '@/types/database';

export const organizationAPI = {
	// Get organization by user ID
	getOrganizationByUser: async (userId: string) => {
		try {
			const { data: userData, error: userError } = await supabase
				.from('users')
				.select('organization_id')
				.eq('id', userId)
				.single();

			if (userError) throw userError;
			if (!userData?.organization_id) return null;

			const { data: orgData, error: orgError } = await supabase
				.from('organizations')
				.select('*')
				.eq('id', userData.organization_id)
				.single();

			if (orgError) throw orgError;
			return orgData;
		} catch (error) {
			console.error('Get organization error:', error);
			throw error;
		}
	},

	// Get organization stats
	getOrganizationStats: async (organizationId: string) => {
		try {
			const { data, error } = await supabase
				.from('organization_dashboard_stats')
				.select('*')
				.eq('organization_id', organizationId)
				.single();

			if (error) throw error;
			return data;
		} catch (error) {
			console.error('Get organization stats error:', error);
			throw error;
		}
	},

	// Get organization event spaces
	getEventSpaces: async (organizationId: string) => {
		try {
			const { data, error } = await supabase
				.from('event_spaces')
				.select('*')
				.eq('organization_id', organizationId)
				.order('created_at', { ascending: true });

			if (error) throw error;
			return data;
		} catch (error) {
			console.error('Get event spaces error:', error);
			throw error;
		}
	},

	// Get organization members (Enhanced with RPC)
	getMembers: async (organizationId: string) => {
		try {
			const { data, error } = await supabase.rpc('get_organization_members', {
				org_id: organizationId
			});

			if (error) throw error;
			return data;
		} catch (error) {
			console.error('Get members error:', error);
			throw error;
		}
	},

	// Create event space
	createEventSpace: async (spaceData: Partial<EventSpace>): Promise<EventSpace> => {
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) throw new Error('User not authenticated');

			if (!spaceData.name || !spaceData.slug || !spaceData.organization_id) {
				throw new Error('Name, slug, and organization_id are required');
			}

			const { data, error } = await supabase
				.from('event_spaces')
				.insert([{
					name: spaceData.name,
					description: spaceData.description || null,
					slug: spaceData.slug,
					organization_id: spaceData.organization_id,
					is_public: spaceData.is_public ?? true,
					allow_public_events: spaceData.allow_public_events ?? true,
					require_approval_for_events: spaceData.require_approval_for_events ?? false,
					created_by: user.id
				}])
				.select('*')
				.single();

			if (error) throw error;
			return data as EventSpace;
		} catch (error) {
			console.error('Create event space error:', error);
			throw error;
		}
	},

	// Update organization
	updateOrganization: async (organizationId: string, updateData: Partial<Organization>): Promise<Organization> => {
		try {
			const { data, error } = await supabase
				.from('organizations')
				.update(updateData)
				.eq('id', organizationId)
				.select('*')
				.single();

			if (error) throw error;
			return data as Organization;
		} catch (error) {
			console.error('Update organization error:', error);
			throw error;
		}
	},

	// Invite member
	inviteMember: async (organizationId: string, email: string, role: 'ADMIN' | 'USER', message?: string) => {
		try {
			const { error } = await supabase.rpc('send_organization_invitation', {
				p_organization_id: organizationId,
				p_email: email,
				p_role: role,
				p_message: message
			});

			if (error) throw error;
			return true;
		} catch (error) {
			console.error('Invite member error:', error);
			throw error;
		}
	},

	// Remove member
	removeMember: async (organizationId: string, userId: string) => {
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) throw new Error('User not authenticated');

			const { error } = await supabase.rpc('remove_user_from_organization', {
				p_user_id: userId,
				p_organization_id: organizationId,
				p_removed_by: user.id
			});

			if (error) throw error;
			return true;
		} catch (error) {
			console.error('Remove member error:', error);
			throw error;
		}
	},

	// Update member role
	updateMemberRole: async (userId: string, role: 'OWNER' | 'ADMIN' | 'USER') => {
		try {
			const { data, error } = await supabase
				.from('users')
				.update({
					role_in_org: role,
					is_org_admin: role === 'OWNER' || role === 'ADMIN'
				})
				.eq('id', userId)
				.select('*')
				.single();

			if (error) throw error;
			return data;
		} catch (error) {
			console.error('Update member role error:', error);
			throw error;
		}
	},

	// Leave organization
	leaveOrganization: async () => {
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) throw new Error('User not authenticated');

			const { error } = await supabase.rpc('leave_organization', {
				p_user_id: user.id
			});

			if (error) throw error;
			return true;
		} catch (error) {
			console.error('Leave organization error:', error);
			throw error;
		}
	},

	// Safe delete organization (RPC)
	deleteOrganization: async (organizationId: string) => {
		try {
			const { data, error } = await supabase.rpc('delete_organization', {
				p_organization_id: organizationId
			});

			if (error) throw error;
			if (data && !data.success) throw new Error(data.error || 'Failed to delete organization');

			return data;
		} catch (error) {
			console.error('Delete organization error:', error);
			throw error;
		}
	},

	// Delete event space (RPC)
	deleteEventSpace: async (spaceId: string) => {
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) throw new Error('User not authenticated');

			const { data, error } = await supabase.rpc('delete_event_space', {
				p_space_id: spaceId,
				p_user_id: user.id
			});

			if (error) throw error;
			return data;
		} catch (error) {
			console.error('Delete event space error:', error);
			throw error;
		}
	},

	// Get user memberships (Enhanced RPC)
	getUserMemberships: async (userId: string) => {
		try {
			const { data, error } = await supabase.rpc('get_user_memberships', {
				user_uuid: userId
			});

			if (error) throw error;
			return data;
		} catch (error) {
			console.error('Get memberships error:', error);
			throw error;
		}
	},

	// Get organization activity log
	getActivityLog: async (organizationId: string, limit: number = 20) => {
		try {
			const { data, error } = await supabase
				.from('organization_activity_log')
				.select('*, actor:users!actor_id(first_name, last_name, email, avatar_url)')
				.eq('organization_id', organizationId)
				.order('created_at', { ascending: false })
				.limit(limit);

			if (error) throw error;
			return data;
		} catch (error) {
			console.error('Get activity log error:', error);
			throw error;
		}
	}
};
