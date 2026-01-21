import { supabase } from '../supabase';
import type { EventSpace } from '@/types/database';

export const eventsAPI = {
	getAllEvents: async () => {
		try {
			const { data, error } = await supabase
				.from('events')
				.select(`
					*,
					categories(*),
					created_by_user:users(id, email, first_name, last_name, username, role, created_at, follower_count),
					event_tags(tag:tags(id, name, slug))
				`)
				.order('created_at', { ascending: false });

			if (error) throw error;
			return data;
		} catch (error) {
			console.error('Get events error:', error);
			throw error;
		}
	},

	getEventById: async (id: string) => {
		try {
			const { data, error } = await supabase
				.from('events')
				.select(`
					*,
					categories(*),
					created_by_user:users(id, email, first_name, last_name, username, role, created_at, follower_count),
					event_tags(tag:tags(id, name, slug))
				`)
				.eq('id', id)
				.single();

			if (error) throw error;
			return data;
		} catch (error) {
			console.error('Get event error:', error);
			throw error;
		}
	},

	createEvent: async (eventData: any) => {
		try {
			const { data: { user }, error: userError } = await supabase.auth.getUser();
			if (!user) throw new Error('User not authenticated');
			if (userError) throw userError;

			let imageUrl = null;
			if (eventData.image) {
				const file = eventData.image;
				const fileExt = file.name.split('.').pop();
				const filePath = `${Date.now()}.${fileExt}`;

				const { error: uploadError } = await supabase.storage
					.from('event-images')
					.upload(filePath, file);

				if (uploadError) throw uploadError;

				const { data: { publicUrl } } = supabase.storage
					.from('event-images')
					.getPublicUrl(filePath);

				imageUrl = publicUrl;
			}

			const { data, error: rpcError } = await supabase.rpc('create_event_safely', {
				p_title: eventData.title,
				p_description: eventData.description,
				p_category_id: eventData.category_id,
				p_location: eventData.location,
				p_price: eventData.price,
				p_date: eventData.date,
				p_time: eventData.time,
				p_image_url: imageUrl,
				p_created_by: user.id,
				p_is_public: eventData.is_public,
				p_requires_approval: eventData.requires_approval,
				p_event_space_id: eventData.event_space_id,
				p_organization_id: eventData.organization_id,
				p_max_attendees: eventData.max_attendees ?? null,
				p_venue_id: eventData.venue_id ?? null,
				p_tags: Array.isArray(eventData.tags) ? eventData.tags : null,
			});

			if (rpcError) throw rpcError;
			return data[0];
		} catch (error: any) {
			console.error('Create event error:', error);
			throw error;
		}
	},

	updateEvent: async (id: string, eventData: any) => {
		try {
			let imageUrl = eventData.image_url;
			if (eventData.image && typeof eventData.image !== 'string') {
				const file = eventData.image;
				const fileExt = file.name.split('.').pop();
				const filePath = `${Date.now()}.${fileExt}`;

				const { error: uploadError } = await supabase.storage
					.from('event-images')
					.upload(filePath, file);

				if (uploadError) throw uploadError;

				const { data: { publicUrl } } = supabase.storage
					.from('event-images')
					.getPublicUrl(filePath);

				imageUrl = publicUrl;
			}

			const { image, ...eventDataWithoutImage } = eventData;

			const { data, error } = await supabase
				.from('events')
				.update({
					...eventDataWithoutImage,
					image_url: imageUrl
				})
				.eq('id', id)
				.select('*, categories(*)')
				.single();

			if (error) throw error;
			return data;
		} catch (error) {
			console.error('Update event error:', error);
			throw error;
		}
	},

	deleteEvent: async (id: string) => {
		try {
			// Logic for cancelling bookings before deletion is handled in the frontend context or could be moved here
			// For now keeping it consistent with existing lib/api.ts logic

			const { data: bookings } = await supabase
				.from('bookings')
				.select('id')
				.eq('event_id', id);

			if (bookings && bookings.length > 0) {
				await supabase
					.from('bookings')
					.update({ status: 'CANCELLED' })
					.eq('event_id', id);
			}

			const { error } = await supabase
				.from('events')
				.delete()
				.eq('id', id);

			if (error) throw error;
			return { success: true };
		} catch (error) {
			console.error('Delete event error:', error);
			throw error;
		}
	},

	getOrganizationEvents: async (organizationId: string) => {
		try {
			const { data, error } = await supabase
				.from('events')
				.select(`
					*,
					categories(*),
					created_by_user:users(*),
					event_tags(tag:tags(id, name, slug))
				`)
				.eq('organization_id', organizationId)
				.order('created_at', { ascending: false });

			if (error) throw error;
			return data;
		} catch (error) {
			console.error('Get organization events error:', error);
			throw error;
		}
	}
};
