import { supabase } from '../supabase';

export const socialAPI = {
	// Follow/Unfollow functionality
	followUser: async (targetUserId: string) => {
		try {
			const { data: { user } } = await supabase.auth.getUser();

			if (!user) throw new Error('User not authenticated');
			if (user.id === targetUserId) throw new Error('Cannot follow yourself');

			const { data, error } = await supabase
				.from('follows')
				.insert([{
					follower_id: user.id,
					target_id: targetUserId,
					target_type: 'USER'
				}])
				.select('*')
				.single();

			if (error) {
				if (error.code === '23505') {
					// Already following, return existing record
					const { data: existing } = await supabase
						.from('follows')
						.select('*')
						.eq('follower_id', user.id)
						.eq('target_id', targetUserId)
						.eq('target_type', 'USER')
						.single();
					return existing;
				}
				throw error;
			}
			return data;
		} catch (error: any) {
			console.error('Follow user error:', JSON.stringify(error, null, 2));
			throw error;
		}
	},

	unfollowUser: async (targetUserId: string) => {
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) throw new Error('User not authenticated');

			const { error } = await supabase
				.from('follows')
				.delete()
				.eq('follower_id', user.id)
				.eq('target_id', targetUserId)
				.eq('target_type', 'USER');

			if (error) throw error;
			return { success: true };
		} catch (error: any) {
			console.error('Unfollow user error:', JSON.stringify(error, null, 2));
			throw error;
		}
	},

	followEvent: async (eventId: string) => {
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) throw new Error('User not authenticated');

			const { data, error } = await supabase
				.from('follows')
				.insert([{
					follower_id: user.id,
					target_id: eventId,
					target_type: 'EVENT'
				}])
				.select('*')
				.single();

			if (error) {
				if (error.code === '23505') {
					const { data: existing } = await supabase
						.from('follows')
						.select('*')
						.eq('follower_id', user.id)
						.eq('target_id', eventId)
						.eq('target_type', 'EVENT')
						.single();
					return existing;
				}
				throw error;
			}
			return data;
		} catch (error: any) {
			console.error('Follow event error:', JSON.stringify(error, null, 2));
			throw error;
		}
	},

	unfollowEvent: async (eventId: string) => {
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) throw new Error('User not authenticated');

			const { error } = await supabase
				.from('follows')
				.delete()
				.eq('follower_id', user.id)
				.eq('target_id', eventId)
				.eq('target_type', 'EVENT');

			if (error) throw error;
			return { success: true };
		} catch (error: any) {
			console.error('Unfollow event error:', JSON.stringify(error, null, 2));
			throw error;
		}
	},

	followCategory: async (categoryId: string) => {
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) throw new Error('User not authenticated');

			const { data, error } = await supabase
				.from('follows')
				.insert([{
					follower_id: user.id,
					target_id: categoryId,
					target_type: 'CATEGORY'
				}])
				.select('*')
				.single();

			if (error) {
				if (error.code === '23505') {
					const { data: existing } = await supabase
						.from('follows')
						.select('*')
						.eq('follower_id', user.id)
						.eq('target_id', categoryId)
						.eq('target_type', 'CATEGORY')
						.single();
					return existing;
				}
				throw error;
			}
			return data;
		} catch (error: any) {
			console.error('Follow category error:', JSON.stringify(error, null, 2));
			throw error;
		}
	},

	unfollowCategory: async (categoryId: string) => {
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) throw new Error('User not authenticated');

			const { error } = await supabase
				.from('follows')
				.delete()
				.eq('follower_id', user.id)
				.eq('target_id', categoryId)
				.eq('target_type', 'CATEGORY');

			if (error) throw error;
			return { success: true };
		} catch (error: any) {
			console.error('Unfollow category error:', JSON.stringify(error, null, 2));
			throw error;
		}
	},

	isFollowing: async (targetId: string, targetType: 'USER' | 'EVENT' | 'CATEGORY') => {
		try {
			const { data: { session } } = await supabase.auth.getSession();
			const user = session?.user;
			if (!user) return false;

			const { data, error } = await supabase
				.from('follows')
				.select('id')
				.eq('follower_id', user.id)
				.eq('target_id', targetId)
				.eq('target_type', targetType)
				.single();

			if (error && error.code !== 'PGRST116') throw error;
			return !!data;
		} catch (error: any) {
			console.error('Check follow status error:', JSON.stringify(error, null, 2));
			return false;
		}
	},

	getUserProfile: async (userId: string) => {
		try {
			const { data: userData, error: userError } = await supabase
				.from('users')
				.select('*, follower_count')
				.eq('id', userId)
				.single();

			if (userError) throw userError;

			const { count: followerCount } = await supabase
				.from('follows')
				.select('*', { count: 'exact', head: true })
				.eq('target_id', userId)
				.eq('target_type', 'USER');

			const { count: followingCount } = await supabase
				.from('follows')
				.select('*', { count: 'exact', head: true })
				.eq('follower_id', userId);

			return {
				...userData,
				follower_count: followerCount || 0,
				following_count: followingCount || 0,
			};
		} catch (error) {
			console.error('Get user profile error:', error);
			throw error;
		}
	},

	getUserFollows: async (userId?: string, targetType?: 'USER' | 'EVENT' | 'CATEGORY') => {
		try {
			let followerId = userId;

			if (!followerId) {
				const { data: { user } } = await supabase.auth.getUser();
				if (!user) throw new Error('User not authenticated');
				followerId = user.id;
			}

			// First get the follows without joins to avoid polymorphic relation errors
			let query = supabase
				.from('follows')
				.select('*')
				.eq('follower_id', followerId);

			if (targetType) {
				query = query.eq('target_type', targetType);
			}

			const { data: follows, error } = await query;
			if (error) throw error;
			if (!follows || follows.length === 0) return [];

			// Group target IDs by type for batch fetching
			const userIds = follows.filter(f => f.target_type === 'USER').map(f => f.target_id);
			const eventIds = follows.filter(f => f.target_type === 'EVENT').map(f => f.target_id);
			const catIds = follows.filter(f => f.target_type === 'CATEGORY').map(f => f.target_id);

			// Fetch related data in parallel
			const [usersData, eventsData, catsData] = await Promise.all([
				userIds.length > 0
					? supabase.from('users').select('*').in('id', userIds)
					: Promise.resolve({ data: [] }),
				eventIds.length > 0
					? supabase.from('events').select('*').in('id', eventIds)
					: Promise.resolve({ data: [] }),
				catIds.length > 0
					? supabase.from('categories').select('*').in('id', catIds)
					: Promise.resolve({ data: [] })
			]);

			// Create lookup maps
			const usersMap = new Map(usersData.data?.map(u => [u.id, u]) || []);
			const eventsMap = new Map(eventsData.data?.map(e => [e.id, e]) || []);
			const catsMap = new Map(catsData.data?.map(c => [c.id, c]) || []);

			// Merge data
			return follows.map(follow => ({
				...follow,
				target_user: follow.target_type === 'USER' ? (usersMap.get(follow.target_id) || null) : null,
				target_event: follow.target_type === 'EVENT' ? (eventsMap.get(follow.target_id) || null) : null,
				target_category: follow.target_type === 'CATEGORY' ? (catsMap.get(follow.target_id) || null) : null
			}));
		} catch (error) {
			console.error('Get user follows error:', error);
			throw error;
		}
	},

	getUserFollowers: async (userId: string) => {
		try {
			const { data, error } = await supabase
				.from('follows')
				.select(`
					*,
					follower:users!follows_follower_id_fkey(*)
				`)
				.eq('target_id', userId)
				.eq('target_type', 'USER');

			if (error) throw error;
			return data || [];
		} catch (error) {
			console.error('Get user followers error:', error);
			throw error;
		}
	}
};
