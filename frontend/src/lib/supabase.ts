import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with proper auth configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
}

// Create Supabase client with enhanced auth configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Enable automatic token refresh
    autoRefreshToken: true,
    // Persist session in localStorage
    persistSession: true,
    // Disable automatic session detection for security (we handle password reset manually)
    detectSessionInUrl: false,
    // Storage key for session persistence
    storageKey: 'supabase.auth.token',
    // Flow type for better token handling
    flowType: 'pkce',
    // Custom storage implementation to handle edge cases
    storage: {
      getItem: (key: string) => {
        if (typeof window === 'undefined') return null;
        try {
          return localStorage.getItem(key);
        } catch (error) {
          console.warn('Failed to get item from localStorage:', error);
          return null;
        }
      },
      setItem: (key: string, value: string) => {
        if (typeof window === 'undefined') return;
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          console.warn('Failed to set item in localStorage:', error);
        }
      },
      removeItem: (key: string) => {
        if (typeof window === 'undefined') return;
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn('Failed to remove item from localStorage:', error);
        }
      },
    },
  },
  // Global configuration
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web',
    },
  },
});

// Utility function to handle token refresh errors
export const handleAuthError = (error: any) => {
  if (error?.message?.includes('Invalid Refresh Token') ||
      error?.message?.includes('Refresh Token Not Found') ||
      error?.message?.includes('invalid_grant')) {
    console.log('🔄 Refresh token error detected, clearing session...');

    // Clear all auth-related storage
    if (typeof window !== 'undefined') {
      try {
        // Clear Supabase storage
        localStorage.removeItem('supabase.auth.token');
        // Clear any other Supabase-related localStorage items
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('supabase.auth.')) {
            localStorage.removeItem(key);
          }
        });
        // Clear sessionStorage as well
        sessionStorage.clear();
      } catch (storageError) {
        console.warn('Failed to clear storage:', storageError);
      }
    }

    return { shouldSignOut: true, error: error.message };
  }

  return { shouldSignOut: false, error: error.message };
};

// Enhanced session recovery function
export const recoverSession = async () => {
  try {
    console.log('🔄 Attempting to recover session...');

    // First try to get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      const result = handleAuthError(sessionError);
      if (result.shouldSignOut) {
        await supabase.auth.signOut();
        return { success: false, error: result.error };
      }
      throw sessionError;
    }

    if (session) {
      console.log('✅ Session recovered successfully');
      return { success: true, session };
    }

    // If no session, try to refresh
    const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();

    if (refreshError) {
      const result = handleAuthError(refreshError);
      if (result.shouldSignOut) {
        await supabase.auth.signOut();
        return { success: false, error: result.error };
      }
      throw refreshError;
    }

    if (refreshedSession) {
      console.log('✅ Session refreshed successfully');
      return { success: true, session: refreshedSession };
    }

    return { success: false, error: 'No active session found' };
  } catch (error: any) {
    console.error('Session recovery failed:', error);
    return { success: false, error: error.message };
  }
};

// Auth functions
export const supabaseAuth = {
  signUp: async (email: string, password: string) => {
    try {
      const result = await supabase.auth.signUp({ email, password });
      return result;
    } catch (error: any) {
      const result = handleAuthError(error);
      if (result.shouldSignOut) {
        await supabase.auth.signOut();
      }
      throw error;
    }
  },
  
  signIn: async (email: string, password: string) => {
    try {
      const result = await supabase.auth.signInWithPassword({ email, password });
      return result;
    } catch (error: any) {
      const result = handleAuthError(error);
      if (result.shouldSignOut) {
        await supabase.auth.signOut();
      }
      throw error;
    }
  },
  
  signOut: async () => {
    try {
      // Clear all auth-related storage before signing out
      if (typeof window !== 'undefined') {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('supabase.auth.')) {
            localStorage.removeItem(key);
          }
        });
        sessionStorage.clear();
      }

      const result = await supabase.auth.signOut();
      return result;
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw error;
    }
  },
  
  getUser: async () => {
    try {
      const result = await supabase.auth.getUser();
      return result;
    } catch (error: any) {
      const result = handleAuthError(error);
      if (result.shouldSignOut) {
        await supabase.auth.signOut();
      }
      throw error;
    }
  },

  // Add new utility functions
  recoverSession,
  handleAuthError,
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