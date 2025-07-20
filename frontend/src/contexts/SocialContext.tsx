'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { socialAPI } from '../lib/api';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface Follow {
  id: string;
  follower_id: string;
  target_id: string;
  target_type: 'USER' | 'EVENT' | 'CATEGORY';
  created_at: string;
  target_user?: any;
  target_event?: any;
  target_category?: any;
  follower?: any;
}

interface UserProfile {
  id: string;
  email: string;
  username: string;
  role: string;
  created_at: string;
  follower_count: number;
  following_count: number;
}

interface SocialContextType {
  // Follow state
  userFollows: Follow[];
  userFollowers: Follow[];
  isLoading: boolean;
  
  // Follow actions
  followUser: (targetUserId: string) => Promise<void>;
  unfollowUser: (targetUserId: string) => Promise<void>;
  followEvent: (eventId: string) => Promise<void>;
  unfollowEvent: (eventId: string) => Promise<void>;
  followCategory: (categoryId: string) => Promise<void>;
  unfollowCategory: (categoryId: string) => Promise<void>;
  
  // Check follow status
  isFollowing: (targetId: string, targetType: 'USER' | 'EVENT' | 'CATEGORY') => Promise<boolean>;
  
  // Get data
  getUserFollows: (targetType?: 'USER' | 'EVENT' | 'CATEGORY') => Promise<Follow[]>;
  getUserFollowers: (userId: string) => Promise<Follow[]>;
  getUserProfile: (userId: string) => Promise<UserProfile>;
  
  // Real-time subscriptions
  subscribeToFollows: () => void;
  unsubscribeFromFollows: () => void;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (context === undefined) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
};

interface SocialProviderProps {
  children: ReactNode;
}

export const SocialProvider: React.FC<SocialProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [userFollows, setUserFollows] = useState<Follow[]>([]);
  const [userFollowers, setUserFollowers] = useState<Follow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [followsSubscription, setFollowsSubscription] = useState<any>(null);

  // Load user's follows on mount
  useEffect(() => {
    if (user) {
      loadUserFollows();
      loadUserFollowers();
      subscribeToFollows();
    } else {
      setUserFollows([]);
      setUserFollowers([]);
      unsubscribeFromFollows();
    }
  }, [user]);

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => {
      unsubscribeFromFollows();
    };
  }, []);

  const loadUserFollows = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const follows = await socialAPI.getUserFollows();
      setUserFollows(follows);
    } catch (error) {
      console.error('Error loading user follows:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserFollowers = async () => {
    if (!user) return;
    
    try {
      const followers = await socialAPI.getUserFollowers(user.id);
      setUserFollowers(followers);
    } catch (error) {
      console.error('Error loading user followers:', error);
    }
  };

  const followUser = async (targetUserId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      setIsLoading(true);
      await socialAPI.followUser(targetUserId);
      await loadUserFollows(); // Refresh follows
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const unfollowUser = async (targetUserId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      setIsLoading(true);
      await socialAPI.unfollowUser(targetUserId);
      await loadUserFollows(); // Refresh follows
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const followEvent = async (eventId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      setIsLoading(true);
      await socialAPI.followEvent(eventId);
      await loadUserFollows(); // Refresh follows
    } catch (error) {
      console.error('Error following event:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const unfollowEvent = async (eventId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      setIsLoading(true);
      await socialAPI.unfollowEvent(eventId);
      await loadUserFollows(); // Refresh follows
    } catch (error) {
      console.error('Error unfollowing event:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const followCategory = async (categoryId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      setIsLoading(true);
      await socialAPI.followCategory(categoryId);
      await loadUserFollows(); // Refresh follows
    } catch (error) {
      console.error('Error following category:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const unfollowCategory = async (categoryId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      setIsLoading(true);
      await socialAPI.unfollowCategory(categoryId);
      await loadUserFollows(); // Refresh follows
    } catch (error) {
      console.error('Error unfollowing category:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const isFollowing = async (targetId: string, targetType: 'USER' | 'EVENT' | 'CATEGORY') => {
    if (!user) return false;
    
    try {
      return await socialAPI.isFollowing(targetId, targetType);
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  };

  const getUserFollows = async (targetType?: 'USER' | 'EVENT' | 'CATEGORY') => {
    if (!user) return [];
    
    try {
      return await socialAPI.getUserFollows(targetType);
    } catch (error) {
      console.error('Error getting user follows:', error);
      return [];
    }
  };

  const getUserFollowers = async (userId: string) => {
    try {
      return await socialAPI.getUserFollowers(userId);
    } catch (error) {
      console.error('Error getting user followers:', error);
      return [];
    }
  };

  const getUserProfile = async (userId: string) => {
    try {
      return await socialAPI.getUserProfile(userId);
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  };

  const subscribeToFollows = () => {
    if (!user) return;

    // Subscribe to follows table changes
    const subscription = supabase
      .channel('follows_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'follows',
          filter: `follower_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Follows change detected:', payload);
          // Refresh follows data
          loadUserFollows();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'follows',
          filter: `target_id=eq.${user.id} AND target_type=eq.USER`
        },
        (payload) => {
          console.log('Followers change detected:', payload);
          // Refresh followers data
          loadUserFollowers();
        }
      )
      .subscribe();

    setFollowsSubscription(subscription);
  };

  const unsubscribeFromFollows = () => {
    if (followsSubscription) {
      supabase.removeChannel(followsSubscription);
      setFollowsSubscription(null);
    }
  };

  const value: SocialContextType = {
    userFollows,
    userFollowers,
    isLoading,
    followUser,
    unfollowUser,
    followEvent,
    unfollowEvent,
    followCategory,
    unfollowCategory,
    isFollowing,
    getUserFollows,
    getUserFollowers,
    getUserProfile,
    subscribeToFollows,
    unsubscribeFromFollows,
  };

  return (
    <SocialContext.Provider value={value}>
      {children}
    </SocialContext.Provider>
  );
}; 