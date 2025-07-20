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
        .select('*');
        
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

// Social Features API
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
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Follow user error:', error);
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
    } catch (error) {
      console.error('Unfollow user error:', error);
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
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Follow event error:', error);
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
    } catch (error) {
      console.error('Unfollow event error:', error);
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
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Follow category error:', error);
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
    } catch (error) {
      console.error('Unfollow category error:', error);
      throw error;
    }
  },
  
  // Check follow status
  isFollowing: async (targetId: string, targetType: 'USER' | 'EVENT' | 'CATEGORY') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
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
    } catch (error) {
      console.error('Check follow status error:', error);
      return false;
    }
  },
  
  // Get user's follows
  getUserFollows: async (targetType?: 'USER' | 'EVENT' | 'CATEGORY') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');
      
      let query = supabase
        .from('follows')
        .select('*')
        .eq('follower_id', user.id);
        
      if (targetType) {
        query = query.eq('target_type', targetType);
      }
      
      const { data, error } = await query;
        
      if (error) throw error;
      
      // Fetch related data separately to avoid foreign key issues
      const followsWithData = await Promise.all(
        data.map(async (follow) => {
          let targetData = null;
          
          if (follow.target_type === 'USER') {
            const { data: userData } = await supabase
              .from('users')
              .select('*')
              .eq('id', follow.target_id)
              .single();
            targetData = userData;
          } else if (follow.target_type === 'EVENT') {
            const { data: eventData } = await supabase
              .from('events')
              .select('*')
              .eq('id', follow.target_id)
              .single();
            targetData = eventData;
          } else if (follow.target_type === 'CATEGORY') {
            const { data: categoryData } = await supabase
              .from('categories')
              .select('*')
              .eq('id', follow.target_id)
              .single();
            targetData = categoryData;
          }
          
          return {
            ...follow,
            target_user: follow.target_type === 'USER' ? targetData : null,
            target_event: follow.target_type === 'EVENT' ? targetData : null,
            target_category: follow.target_type === 'CATEGORY' ? targetData : null,
          };
        })
      );
      
      return followsWithData;
    } catch (error) {
      console.error('Get user follows error:', error);
      throw error;
    }
  },
  
  // Get user's followers
  getUserFollowers: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('*')
        .eq('target_id', userId)
        .eq('target_type', 'USER');
        
      if (error) throw error;
      
      // Fetch follower data separately
      const followersWithData = await Promise.all(
        data.map(async (follow) => {
          const { data: followerData } = await supabase
            .from('users')
            .select('*')
            .eq('id', follow.follower_id)
            .single();
          
          return {
            ...follow,
            follower: followerData,
          };
        })
      );
      
      return followersWithData;
    } catch (error) {
      console.error('Get user followers error:', error);
      throw error;
    }
  },
  
  // Get event followers
  getEventFollowers: async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('*')
        .eq('target_id', eventId)
        .eq('target_type', 'EVENT');
        
      if (error) throw error;
      
      // Fetch follower data separately
      const followersWithData = await Promise.all(
        data.map(async (follow) => {
          const { data: followerData } = await supabase
            .from('users')
            .select('*')
            .eq('id', follow.follower_id)
            .single();
          
          return {
            ...follow,
            follower: followerData,
          };
        })
      );
      
      return followersWithData;
    } catch (error) {
      console.error('Get event followers error:', error);
      throw error;
    }
  },
  
  // Get category followers
  getCategoryFollowers: async (categoryId: string) => {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('*')
        .eq('target_id', categoryId)
        .eq('target_type', 'CATEGORY');
        
      if (error) throw error;
      
      // Fetch follower data separately
      const followersWithData = await Promise.all(
        data.map(async (follow) => {
          const { data: followerData } = await supabase
            .from('users')
            .select('*')
            .eq('id', follow.follower_id)
            .single();
          
          return {
            ...follow,
            follower: followerData,
          };
        })
      );
      
      return followersWithData;
    } catch (error) {
      console.error('Get category followers error:', error);
      throw error;
    }
  },
  
  // Get user profile with follower counts
  getUserProfile: async (userId: string) => {
    try {
      // Get user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (userError) throw userError;
      
      // Get follower count
      const { count: followerCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('target_id', userId)
        .eq('target_type', 'USER');
      
      // Get following count
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
  
  // Get events with follower counts
  getEventsWithFollowCounts: async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*, categories(*), created_by:users(*)');
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get events with follow counts error:', error);
      throw error;
    }
  },
  
  // Get categories with follower counts
  getCategoriesWithFollowCounts: async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*');
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get categories with follow counts error:', error);
      throw error;
    }
  },
};

export default {
  auth: authAPI,
  events: eventsAPI,
  bookings: bookingsAPI,
  categories: categoriesAPI,
  social: socialAPI
}; 