import { supabase, handleAuthError } from './supabase';
import { createClient } from '@supabase/supabase-js';

// Simple cache for organization data to avoid repeated DB calls
const orgDataCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Auth timeout configuration
const AUTH_TIMEOUT_CONFIG = {
  baseTimeout: 4000, // 4 seconds base timeout
  maxTimeout: 8000,  // Maximum 8 seconds timeout
  maxRetries: 2      // Maximum number of retries
};

const getCachedOrgData = (userId: string) => {
  const cached = orgDataCache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedOrgData = (userId: string, data: any) => {
  orgDataCache.set(userId, { data, timestamp: Date.now() });
};

const clearCachedOrgData = (userId: string) => {
  orgDataCache.delete(userId);
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting login for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.log('❌ Supabase auth error:', error);
        // Return error result instead of throwing to prevent console popup
        return {
          success: false,
          data: null,
          error: error.message
        };
      }

      console.log('✅ Supabase auth success:', data?.user?.email);
      return {
        success: true,
        data: data,
        error: null
      };
    } catch (error: any) {
      console.log('💥 Supabase auth exception:', error);
      // Return error result instead of throwing
      return {
        success: false,
        data: null,
        error: error.message || 'Login failed'
      };
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
      // Add timeout to prevent hanging beyond 3 seconds
      const userPromise = supabase.auth.getUser();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('User fetch timeout')), 2000)
      );

      const { data, error } = await Promise.race([userPromise, timeoutPromise]) as { data: any; error: any };
      if (error) throw error;
      return data.user;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  },

  // Optimized auth status check with caching and timeouts
  checkAuthStatus: async (customRetries?: number) => {
    const maxRetries = customRetries ?? AUTH_TIMEOUT_CONFIG.maxRetries;

    console.log(`🔍 Starting auth status check with ${maxRetries + 1} attempts...`);

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Adaptive timeout based on attempt
        const timeoutMs = Math.min(
          AUTH_TIMEOUT_CONFIG.baseTimeout * (attempt + 1),
          AUTH_TIMEOUT_CONFIG.maxTimeout
        );

        console.log(`🔄 Auth check attempt ${attempt + 1}/${maxRetries + 1} (timeout: ${timeoutMs}ms)`);

        const startTime = performance.now();
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Auth check timeout (${timeoutMs}ms) - attempt ${attempt + 1}/${maxRetries + 1}`)), timeoutMs)
        );

        const { data, error } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        const endTime = performance.now();

        console.log(`⚡ Auth check attempt ${attempt + 1} completed in ${(endTime - startTime).toFixed(2)}ms`);

        if (error) {
          // Check if it's a refresh token error that should be handled specially
          const authErrorResult = handleAuthError(error);
          if (authErrorResult.shouldSignOut) {
            console.log('🔄 Refresh token error detected during auth check, clearing session...');
            // Clear the session and return unauthenticated
            await supabase.auth.signOut();
            return {
              isAuthenticated: false,
              user: null,
              session: null,
              error: authErrorResult.error
            };
          }

          // If it's the last attempt, throw the error
          if (attempt === maxRetries) {
            throw error;
          }
          // Otherwise, log and retry
          console.warn(`Auth check attempt ${attempt + 1} failed:`, error.message);
          continue;
        }

        console.log(`✅ Auth check successful - authenticated: ${!!data.session}`);
        return {
          isAuthenticated: !!data.session,
          user: data.session?.user || null,
          session: data.session
        };
      } catch (error: any) {
        const isLastAttempt = attempt === maxRetries;

        if (isLastAttempt) {
          console.error(`❌ Auth status check failed after ${maxRetries + 1} attempts:`, error);
          return {
            isAuthenticated: false,
            user: null,
            session: null,
            error: error.message
          };
        }

        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt), 3000);
        console.log(`🔄 Auth check failed, retrying in ${delay}ms... (${error.message})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // This should never be reached, but just in case
    return {
      isAuthenticated: false,
      user: null,
      session: null,
      error: 'Auth check failed after all retries'
    };
  },

  // Optimized organization data loading with caching
  getUserOrganizationData: async (userId: string, useCache: boolean = true) => {
    try {
      // Check cache first
      if (useCache) {
        const cachedData = getCachedOrgData(userId);
        if (cachedData) {
          return cachedData;
        }
      }

      // Add timeout to prevent hanging
      const orgPromise = supabase
        .from('users')
        .select('organization_id, role_in_org, is_org_admin, joined_at')
        .eq('id', userId)
        .single();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Organization data timeout')), 1500)
      );

      const { data, error } = await Promise.race([orgPromise, timeoutPromise]) as any;

      if (error) throw error;

      // Cache the result
      if (useCache) {
        setCachedOrgData(userId, data);
      }

      return data;
    } catch (error) {
      console.error('Get organization data error:', error);
      return null; // Return null instead of throwing to make it non-blocking
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
  },

  // Clear user's organization cache (useful after leaving organization)
  clearUserOrganizationCache: (userId: string) => {
    clearCachedOrgData(userId);
  }
};

// Organization API
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

  // Get organization members
  getMembers: async (organizationId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('organization_id', organizationId)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get members error:', error);
      throw error;
    }
  },

  // Create event space
  createEventSpace: async (spaceData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('event_spaces')
        .insert([{
          ...spaceData,
          created_by: user.id
        }])
        .select('id, follower_id, target_id, target_type, created_at')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Create event space error:', error);
      throw error;
    }
  },

  // Update organization
  updateOrganization: async (organizationId: string, updateData: any) => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .update(updateData)
        .eq('id', organizationId)
        .select('id, follower_id, target_id, target_type, created_at')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update organization error:', error);
      throw error;
    }
  },

  // Invite member to organization (now using secure invitation system)
  inviteMember: async (organizationId: string, email: string, role: 'ADMIN' | 'USER', message?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

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

  // Remove member from organization
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
        .select('id, follower_id, target_id, target_type, created_at')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update member role error:', error);
      throw error;
    }
  },

  // Leave organization (for current user)
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
  }
};

// Events API
export const eventsAPI = {
  getAllEvents: async () => {
    try {
      // Let RLS policies handle the visibility - don't add restrictive filters
      // RLS will ensure users only see events they're allowed to see
      const { data, error } = await supabase
        .from('events')
        .select('*, categories(*), created_by:users(id, email, first_name, last_name, role, created_at, follower_count)')
        .order('created_at', { ascending: false }); // Show newest events first

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
        .select('*, categories(*), created_by:users(id, email, first_name, last_name, role, created_at, follower_count)')
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
      console.log('🔍 Getting current user...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('👤 User data:', { user: user?.id, error: userError });

      if (!user) throw new Error('User not authenticated');
      if (userError) throw userError;

      // Get user's organization_id for proper association (restored with targeted query)
      let userOrganizationId = null;
      try {
        // Use minimal query to avoid RLS circular dependency
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('organization_id, role_in_org') // Also get role for debugging
          .eq('id', user.id)
          .single();

        console.log('👥 User organization data:', { userData, userError });

        if (!userError && userData?.organization_id) {
          userOrganizationId = userData.organization_id;
        }
      } catch (orgError) {
        console.warn('Could not fetch user organization, proceeding without association:', orgError);
      }

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

      // Remove image property
      const { image, ...eventDataWithoutImage } = eventData;

      // INSERT WITHOUT organization_id COLUMN to avoid RLS circular dependency
      const eventInsertData = {
        title: eventDataWithoutImage.title,
        description: eventDataWithoutImage.description || null,
        category_id: eventDataWithoutImage.category_id || null,
        location: eventDataWithoutImage.location || null,
        price: eventDataWithoutImage.price || null,
        date: eventDataWithoutImage.date,
        time: eventDataWithoutImage.time,
        image_url: imageUrl,
        created_by: user.id,
        event_space_id: eventDataWithoutImage.event_space_id || null,
        is_public: eventDataWithoutImage.is_public !== undefined ? eventDataWithoutImage.is_public : true,
        requires_approval: eventDataWithoutImage.requires_approval !== undefined ? eventDataWithoutImage.requires_approval : false,
        is_approved: true
        // NOTE: organization_id is COMPLETELY OMITTED to avoid RLS issues
      };

      console.log('📋 Event data to insert (organization_id omitted):', eventInsertData);

      // Validate foreign keys before insert
      if (eventInsertData.category_id) {
        console.log('🔍 Validating category_id:', eventInsertData.category_id);
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('id')
          .eq('id', eventInsertData.category_id)
          .single();

        if (categoryError || !categoryData) {
          console.error('❌ Invalid category_id:', eventInsertData.category_id, categoryError);
          throw new Error(`Invalid category ID: ${eventInsertData.category_id}`);
        }
        console.log('✅ Category validation passed');
      }

      if (eventInsertData.event_space_id) {
        console.log('🔍 Validating event_space_id:', eventInsertData.event_space_id);
        const { data: spaceData, error: spaceError } = await supabase
          .from('event_spaces')
          .select('id')
          .eq('id', eventInsertData.event_space_id)
          .single();

        if (spaceError || !spaceData) {
          console.error('❌ Invalid event_space_id:', eventInsertData.event_space_id, spaceError);
          throw new Error(`Invalid event space ID: ${eventInsertData.event_space_id}`);
        }
        console.log('✅ Event space validation passed');
      }

      console.log("📝 Attempting comprehensive event creation approach...");

      const createdBy = user?.id;
      if (!createdBy) {
        throw new Error("User not authenticated for event creation.");
      }

      try {
        console.log("🔄 Strategy: Using create_event_safely RPC function");
        const { data, error: rpcError } = await supabase.rpc('create_event_safely', {
          p_title: eventData.title,
          p_description: eventData.description,
          p_category_id: eventData.category_id,
          p_location: eventData.location,
          p_price: eventData.price,
          p_date: eventData.date,
          p_time: eventData.time,
          p_image_url: imageUrl, // Use the uploaded imageUrl instead of eventData.image_url
          p_created_by: createdBy,
          p_is_public: eventData.is_public,
          p_requires_approval: eventData.requires_approval,
          p_event_space_id: eventData.event_space_id,
          p_organization_id: eventData.organization_id,
        });

        if (rpcError) {
          console.error("❌ RPC create_event_safely failed:", rpcError);
          throw new Error(rpcError.message || "Failed to create event using RPC.");
        }

        return data[0]; // rpc now returns SETOF events, so return the first element directly

      } catch (error: any) {
        console.error("❌ Event creation failed:", error.message);
        // Re-throw the error for centralized handling in EventContext
        throw new Error(`Event creation failed: ${error.message}`);
      }
    } catch (error: any) {
      console.error('Create event error:', error);
      console.error('Error details:', {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code,
        status: error?.status
      });

      // Throw a more descriptive error
      const errorMessage = error?.message || 'Failed to create event';
      const enhancedError = new Error(errorMessage);
      (enhancedError as any).originalError = error;
      throw enhancedError;
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
        .select('id, title, description, date, time, location, price, image_url, created_by, created_at')
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
      // First, check if there are any bookings for this event
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('id, status, user_id')
        .eq('event_id', id);

      if (bookingsError) {
        console.error('Error checking bookings:', bookingsError);
        throw bookingsError;
      }

      // If there are bookings, handle them first
      if (bookings && bookings.length > 0) {
        console.log(`Found ${bookings.length} bookings for event ${id}, cancelling them...`);

        // Cancel all bookings for this event
        const { error: cancelError } = await supabase
          .from('bookings')
          .update({ status: 'CANCELLED' })
          .eq('event_id', id);

        if (cancelError) {
          console.error('Error cancelling bookings:', cancelError);
          throw cancelError;
        }

        console.log('Successfully cancelled all bookings for the event');
      }

      // Now delete the event
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        success: true,
        cancelledBookings: bookings?.length || 0
      };
    } catch (error) {
      console.error('Delete event error:', error);
      throw error;
    }
  },

  // Get organization events
  getOrganizationEvents: async (organizationId: string) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*, categories(*), created_by:users(*)')
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
        .select('*, event:events(*), user:users(id, email, first_name, last_name, role, created_at, follower_count)');
        
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
        .select('id, follower_id, target_id, target_type, created_at')
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
      console.log('🔄 Attempting to cancel booking with ID:', id);

      // First, let's check if the booking exists and get its current status
      const { data: existingBooking, error: fetchError } = await supabase
        .from('bookings')
        .select('id, status, user_id')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('❌ Error fetching booking:', fetchError);
        throw new Error(`Failed to find booking: ${fetchError.message}`);
      }

      if (!existingBooking) {
        console.error('❌ Booking not found with ID:', id);
        throw new Error('Booking not found');
      }

      console.log('📋 Current booking status:', existingBooking.status);

      if (existingBooking.status === 'CANCELLED') {
        console.log('⚠️ Booking is already cancelled');
        return existingBooking;
      }

      // Try to call the Supabase Edge Function for admin booking cancellation
      try {
        console.log('🔄 Trying Edge Function approach for booking cancellation');

        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error('No authentication token available');
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
        const response = await fetch(`${supabaseUrl}/functions/v1/cancel-booking-admin`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ booking_id: id }),
        });

        if (response.ok) {
          const functionData = await response.json();
          console.log('✅ Booking cancelled via Edge Function:', functionData);
          return functionData;
        } else {
          const errorData = await response.json();
          console.log('⚠️ Edge Function failed:', errorData);
          throw new Error(errorData.error || 'Edge Function failed');
        }
      } catch (functionError: any) {
        console.log('⚠️ Edge Function approach failed, using direct update:', functionError.message);
      }

      // Fallback to direct update (this might fail due to RLS)
      const { data, error } = await supabase
        .from('bookings')
        .update({ status: 'CANCELLED' })
        .eq('id', id)
        .select('id, event_id, user_id, booking_date, status, created_at')
        .single();

      if (error) {
        console.error('❌ Supabase update error:', error);

        // If it's an RLS error, provide a more helpful message
        if (error.message?.includes('policy') || error.code === 'PGRST116' || error.message?.includes('violates row level security policy')) {
          console.error('🔒 RLS Policy Violation - Admin may not have proper permissions');
          throw new Error('Permission denied: Admin permissions needed to cancel this booking. Please run the SQL migration in fix_booking_cancellation_rls.sql to add the necessary RLS policies.');
        }

        throw new Error(`Failed to cancel booking: ${error.message}`);
      }

      console.log('✅ Booking cancelled successfully:', data);
      return data;
    } catch (error: any) {
      console.error('💥 Cancel booking error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        status: error.status
      });

      // Re-throw with more specific error message
      const errorMessage = error.message || 'Unknown error occurred while cancelling booking';
      throw new Error(errorMessage);
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
        .select('id, name, description, created_at, follower_count')
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
        .select('id, name, description, created_at, follower_count')
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
        .select('id, follower_id, target_id, target_type, created_at')
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
        .select('id, follower_id, target_id, target_type, created_at')
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
        .select('id, follower_id, target_id, target_type, created_at')
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
              .select('id, email, first_name, last_name, role, created_at, follower_count')
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
            .select('id, email, first_name, last_name, role, created_at, follower_count')
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
            .select('id, email, first_name, last_name, role, created_at, follower_count')
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
            .select('id, email, first_name, last_name, role, created_at, follower_count')
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
        .select('id, email, first_name, last_name, role, created_at, follower_count')
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
        .select('*, categories(*), created_by:users(id, email, first_name, last_name, role, created_at, follower_count)');
        
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