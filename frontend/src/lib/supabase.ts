import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth functions
export const supabaseAuth = {
  signUp: async (email: string, password: string) => {
    return await supabase.auth.signUp({ email, password });
  },
  
  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  },
  
  signOut: async () => {
    return await supabase.auth.signOut();
  },
  
  getUser: async () => {
    return await supabase.auth.getUser();
  },
};

// Database functions
export const supabaseDB = {
  // Events
  getEvents: async () => {
    return await supabase.from('events').select('*');
  },
  
  getEventById: async (id: string) => {
    return await supabase.from('events').select('*').eq('id', id).single();
  },
  
  createEvent: async (eventData: any) => {
    return await supabase.from('events').insert(eventData);
  },
  
  updateEvent: async (id: string, eventData: any) => {
    return await supabase.from('events').update(eventData).eq('id', id);
  },
  
  deleteEvent: async (id: string) => {
    return await supabase.from('events').delete().eq('id', id);
  },
  
  // Categories
  getCategories: async () => {
    return await supabase.from('categories').select('*');
  },
  
  getCategoryById: async (id: string) => {
    return await supabase.from('categories').select('*').eq('id', id).single();
  },
  
  createCategory: async (categoryData: any) => {
    return await supabase.from('categories').insert(categoryData);
  },
  
  updateCategory: async (id: string, categoryData: any) => {
    return await supabase.from('categories').update(categoryData).eq('id', id);
  },
  
  deleteCategory: async (id: string) => {
    return await supabase.from('categories').delete().eq('id', id);
  },
  
  // Bookings
  getUserBookings: async (userId: string) => {
    return await supabase.from('bookings').select('*, events(*)').eq('user_id', userId);
  },
  
  getAllBookings: async () => {
    return await supabase.from('bookings').select('*, events(*), users(*)');
  },
  
  createBooking: async (bookingData: any) => {
    return await supabase.from('bookings').insert(bookingData);
  },
  
  cancelBooking: async (id: string) => {
    return await supabase.from('bookings').update({ status: 'CANCELLED' }).eq('id', id);
  },
};

export default supabase; 