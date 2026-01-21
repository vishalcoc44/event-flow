import { supabase } from '../supabase';

export const bookingsAPI = {
	getUserBookings: async () => {
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) throw new Error('User not authenticated');

			const { data, error } = await supabase
				.from('bookings')
				.select('*, event:events(*)')
				.eq('user_id', user.id);

			if (error) throw error;
			return data;
		} catch (error) {
			console.error('Get user bookings error:', error);
			throw error;
		}
	},

	getAllBookings: async () => {
		try {
			const { data, error } = await supabase
				.from('bookings')
				.select('*, event:events(*), user:users(id, email, first_name, last_name, role, created_at, follower_count)');

			if (error) throw error;
			return data;
		} catch (error) {
			console.error('Get all bookings error:', error);
			throw error;
		}
	},

	createBooking: async (eventId: string, ticketTypeId?: string | null) => {
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) throw new Error('User not authenticated');

			const { data, error } = await supabase
				.from('bookings')
				.insert([{
					event_id: eventId,
					user_id: user.id,
					status: 'CONFIRMED',
					ticket_type_id: ticketTypeId ?? null
				}])
				.select('*')
				.single();

			if (error) throw error;
			return data;
		} catch (error) {
			console.error('Create booking error:', error);
			throw error;
		}
	},

	cancelBooking: async (id: string) => {
		try {
			// First, check if the booking exists
			const { data: existingBooking, error: fetchError } = await supabase
				.from('bookings')
				.select('id, status, user_id')
				.eq('id', id)
				.single();

			if (fetchError) throw new Error(`Failed to find booking: ${fetchError.message}`);
			if (existingBooking.status === 'CANCELLED') return existingBooking;

			// Try Edge Function approach first
			const { data: { session } } = await supabase.auth.getSession();
			if (session?.access_token) {
				const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
				try {
					const response = await fetch(`${supabaseUrl}/functions/v1/cancel-booking-admin`, {
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${session.access_token}`,
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({ booking_id: id }),
					});

					if (response.ok) return await response.json();
				} catch (e) {
					console.warn('Edge Function failed, falling back to direct update');
				}
			}

			// Fallback to direct update
			const { data, error } = await supabase
				.from('bookings')
				.update({ status: 'CANCELLED' })
				.eq('id', id)
				.select('*')
				.single();

			if (error) throw error;
			return data;
		} catch (error: any) {
			console.error('Cancel booking error:', error);
			throw error;
		}
	}
};
