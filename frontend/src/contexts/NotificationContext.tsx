'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'EVENT_CREATED' | 'EVENT_REMINDER' | 'BOOKING_CONFIRMED' | 'BOOKING_REMINDER' | 'FOLLOW_UPDATE' | 'CATEGORY_UPDATE';
  data: any;
  is_read: boolean;
  is_sent: boolean;
  scheduled_at?: string;
  sent_at?: string;
  created_at: string;
  updated_at: string;
}

interface NotificationPreferences {
  id: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  event_reminders: boolean;
  booking_reminders: boolean;
  follow_updates: boolean;
  category_updates: boolean;
  reminder_hours: number;
  created_at: string;
  updated_at: string;
}

interface NotificationSummary {
  user_id: string;
  total_notifications: number;
  unread_count: number;
  reminder_count: number;
  booking_count: number;
  latest_notification?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  preferences: NotificationPreferences | null;
  summary: NotificationSummary | null;
  loading: boolean;
  unreadCount: number;
  
  // Actions
  loadNotifications: () => Promise<void>;
  loadPreferences: () => Promise<void>;
  loadSummary: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<boolean>;
  markAllAsRead: () => Promise<number>;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<boolean>;
  createNotification: (notification: Partial<Notification>) => Promise<string>;
  deleteNotification: (notificationId: string) => Promise<boolean>;
  clearOldNotifications: () => Promise<number>;
  
  // Real-time
  subscribeToNotifications: () => void;
  unsubscribeFromNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [summary, setSummary] = useState<NotificationSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);

  // Load notifications for the current user
  const loadNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load notification preferences
  const loadPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      
      if (data) {
        setPreferences(data);
      } else {
        // Create default preferences if none exist
        const { data: newPrefs, error: createError } = await supabase
          .from('notification_preferences')
          .insert({
            user_id: user.id,
            email_notifications: true,
            push_notifications: true,
            event_reminders: true,
            booking_reminders: true,
            follow_updates: true,
            category_updates: true,
            reminder_hours: 24
          })
          .select()
          .single();

        if (createError) throw createError;
        setPreferences(newPrefs);
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  };

  // Load notification summary
  const loadSummary = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notification_summary')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setSummary(data || null);
    } catch (error) {
      console.error('Error loading notification summary:', error);
    }
  };

  // Mark a notification as read
  const markAsRead = async (notificationId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase.rpc('mark_notification_read', {
        p_notification_id: notificationId
      });

      if (error) throw error;

      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true }
            : notification
        )
      );

      // Reload summary
      await loadSummary();
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async (): Promise<number> => {
    if (!user) return 0;

    try {
      const { data, error } = await supabase.rpc('mark_all_notifications_read', {
        p_user_id: user.id
      });

      if (error) throw error;

      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );

      // Reload summary
      await loadSummary();
      return data || 0;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return 0;
    }
  };

  // Update notification preferences
  const updatePreferences = async (newPreferences: Partial<NotificationPreferences>): Promise<boolean> => {
    if (!user || !preferences) return false;

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .update(newPreferences)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setPreferences(data);
      return true;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return false;
    }
  };

  // Create a new notification
  const createNotification = async (notification: Partial<Notification>): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase.rpc('create_notification', {
        p_user_id: user.id,
        p_title: notification.title || '',
        p_message: notification.message || '',
        p_type: notification.type || 'EVENT_CREATED',
        p_data: notification.data || {},
        p_scheduled_at: notification.scheduled_at || null
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  };

  // Delete a notification
  const deleteNotification = async (notificationId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Reload summary
      await loadSummary();
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  };

  // Clear old notifications
  const clearOldNotifications = async (): Promise<number> => {
    if (!user) return 0;

    try {
      const { data, error } = await supabase.rpc('clean_old_notifications', {
        days_to_keep: 30
      });

      if (error) throw error;

      // Reload notifications and summary
      await loadNotifications();
      await loadSummary();
      return data || 0;
    } catch (error) {
      console.error('Error clearing old notifications:', error);
      return 0;
    }
  };

  // Subscribe to real-time notifications
  const subscribeToNotifications = () => {
    if (!user || subscription) return;

    const sub = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          loadSummary();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const updatedNotification = payload.new as Notification;
          setNotifications(prev => 
            prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
          );
          loadSummary();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const deletedNotification = payload.old as Notification;
          setNotifications(prev => prev.filter(n => n.id !== deletedNotification.id));
          loadSummary();
        }
      )
      .subscribe();

    setSubscription(sub);
  };

  // Unsubscribe from real-time notifications
  const unsubscribeFromNotifications = () => {
    if (subscription) {
      supabase.removeChannel(subscription);
      setSubscription(null);
    }
  };

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Load data when user changes
  useEffect(() => {
    if (user) {
      loadNotifications();
      loadPreferences();
      loadSummary();
      subscribeToNotifications();
    } else {
      setNotifications([]);
      setPreferences(null);
      setSummary(null);
      unsubscribeFromNotifications();
    }

    return () => {
      unsubscribeFromNotifications();
    };
  }, [user]);

  const value: NotificationContextType = {
    notifications,
    preferences,
    summary,
    loading,
    unreadCount,
    loadNotifications,
    loadPreferences,
    loadSummary,
    markAsRead,
    markAllAsRead,
    updatePreferences,
    createNotification,
    deleteNotification,
    clearOldNotifications,
    subscribeToNotifications,
    unsubscribeFromNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 