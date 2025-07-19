import { supabase } from './supabase';

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  register: async (userData: { 
    email: string; 
    password: string; 
    username?: string;
    firstName?: string;
    lastName?: string;
    contactNumber?: string;
    city?: string;
    pincode?: string;
    streetAddress?: string;
    role?: string;
  }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            username: userData.username || userData.email.split('@')[0],
            first_name: userData.firstName || '',
            last_name: userData.lastName || '',
            contact_number: userData.contactNumber || '',
            city: userData.city || '',
            pincode: userData.pincode || '',
            street_address: userData.streetAddress || '',
            role: userData.role || 'USER'
          }
        }
      });
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  getCurrentUser: async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  },
  
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }
};

// Events API
export const eventsAPI = {
  getAllEvents: async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*, categories(*), created_by:users(*)');
        
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
        .select('*, categories(*), created_by:users(*)')
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
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');
      
      // Handle image upload if provided
      let imageUrl = null;
      if (eventData.image) {
        const file = eventData.image;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('event-images')
          .upload(filePath, file);
          
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('event-images')
          .getPublicUrl(filePath);
          
        imageUrl = publicUrl;
      }
      
      // Remove image property to avoid issues with the insert
      const { image, ...eventDataWithoutImage } = eventData;
      
      // Create event
      const { data, error } = await supabase
        .from('events')
        .insert([{
          ...eventDataWithoutImage,
          image_url: imageUrl,
          created_by: user.id
        }])
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Create event error:', error);
      throw error;
    }
  },
  
  updateEvent: async (id: string, eventData: any) => {
    try {
      // Handle image upload if provided
      let imageUrl = eventData.image_url;
      if (eventData.image && typeof eventData.image !== 'string') {
        const file = eventData.image;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('event-images')
          .upload(filePath, file);
          
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('event-images')
          .getPublicUrl(filePath);
          
        imageUrl = publicUrl;
      }
      
      // Remove image property to avoid issues with the update
      const { image, ...eventDataWithoutImage } = eventData;
      
      // Update event
      const { data, error } = await supabase
        .from('events')
        .update({
          ...eventDataWithoutImage,
          image_url: imageUrl
        })
        .eq('id', id)
        .select()
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
};

// Bookings API
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
        .select('*, event:events(*), user:users(*)');
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get all bookings error:', error);
      throw error;
    }
  },
  
  createBooking: async (eventId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('bookings')
        .insert([{
          event_id: eventId,
          user_id: user.id,
          status: 'CONFIRMED'
        }])
        .select()
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
      const { data, error } = await supabase
        .from('bookings')
        .update({ status: 'CANCELLED' })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Cancel booking error:', error);
      throw error;
    }
  },
};

// Categories API
export const categoriesAPI = {
  getAllCategories: async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*');
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get categories error:', error);
      throw error;
    }
  },
  
  getCategoryById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get category error:', error);
      throw error;
    }
  },
  
  createCategory: async (categoryData: any) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([categoryData])
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Create category error:', error);
      throw error;
    }
  },
  
  updateCategory: async (id: string, categoryData: any) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update category error:', error);
      throw error;
    }
  },
  
  deleteCategory: async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Delete category error:', error);
      throw error;
    }
  },
};

export default {
  auth: authAPI,
  events: eventsAPI,
  bookings: bookingsAPI,
  categories: categoriesAPI
}; 