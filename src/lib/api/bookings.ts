import { supabase } from '../supabase';
import { cancelBookingAdminSchema } from '../validations/rpc';

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
			// Validate input
			const rpcInput = cancelBookingAdminSchema.parse({ booking_id: id });

			// Use the RPC for proper validation and business logic (Thick Database pattern)
			const { data, error } = await supabase.rpc('cancel_booking_admin', rpcInput);

			if (error) throw error;
			return data;
		} catch (error: any) {
			console.error('Cancel booking error:', error);
			throw error;
		}
	}
};
