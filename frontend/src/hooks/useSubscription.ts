'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useOrganization } from '@/contexts/OrganizationContext';

export interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  max_events: number;
  max_users: number;
  max_storage_mb: number;
  features: any;
  is_active: boolean;
}

export interface OrganizationUsage {
  current_events_count: number;
  current_users_count: number;
  current_storage_mb: number;
  max_events: number;
  max_users: number;
  max_storage_mb: number;
}

export function useSubscription() {
  const { organization } = useOrganization();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);
  const [usage, setUsage] = useState<OrganizationUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all subscription plans
  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Fetch current plan and usage
  const fetchCurrentPlanAndUsage = async () => {
    if (!organization) return;

    try {
      // Get current plan details
      const { data: planData, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('name', organization.subscription_plan)
        .single();

      if (planError) throw planError;
      setCurrentPlan(planData);

      // Set usage data from organization
      setUsage({
        current_events_count: organization.current_events_count,
        current_users_count: organization.current_users_count,
        current_storage_mb: organization.current_storage_mb,
        max_events: organization.max_events,
        max_users: organization.max_users,
        max_storage_mb: organization.max_storage_mb,
      });

    } catch (err: any) {
      setError(err.message);
    }
  };

  // Update organization subscription plan
  const updateSubscriptionPlan = async (newPlanName: string) => {
    if (!organization) throw new Error('No organization context');

    try {
      // Get new plan details
      const { data: newPlan, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('name', newPlanName)
        .single();

      if (planError) throw planError;

      // Update organization with new plan
      const { error: updateError } = await supabase
        .from('organizations')
        .update({
          subscription_plan: newPlanName,
          max_events: newPlan.max_events,
          max_users: newPlan.max_users,
          max_storage_mb: newPlan.max_storage_mb,
          updated_at: new Date().toISOString(),
        })
        .eq('id', organization.id);

      if (updateError) throw updateError;

      // Update local state
      setCurrentPlan(newPlan);
      if (usage) {
        setUsage({
          ...usage,
          max_events: newPlan.max_events,
          max_users: newPlan.max_users,
          max_storage_mb: newPlan.max_storage_mb,
        });
      }

      return { success: true };
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  // Calculate usage percentages
  const getUsagePercentages = () => {
    if (!usage) return { events: 0, users: 0, storage: 0 };

    return {
      events: (usage.current_events_count / usage.max_events) * 100,
      users: (usage.current_users_count / usage.max_users) * 100,
      storage: (usage.current_storage_mb / usage.max_storage_mb) * 100,
    };
  };

  // Get usage alerts
  const getUsageAlerts = () => {
    const percentages = getUsagePercentages();
    const alerts = [];

    if (percentages.events > 80) {
      alerts.push(`You are using ${percentages.events.toFixed(0)}% of your event limit.`);
    }
    if (percentages.users > 80) {
      alerts.push(`You are using ${percentages.users.toFixed(0)}% of your user limit.`);
    }
    if (percentages.storage > 80) {
      alerts.push(`You are using ${percentages.storage.toFixed(0)}% of your storage limit.`);
    }

    return alerts;
  };

  // Update real-time usage (call this after events/users/storage changes)
  const updateUsage = async () => {
    if (!organization) return;

    try {
      // Get current counts from database
      const [eventsResult, usersResult] = await Promise.all([
        supabase
          .from('events')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', organization.id),
        supabase
          .from('users')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', organization.id)
      ]);

      const eventCount = eventsResult.count || 0;
      const userCount = usersResult.count || 0;

      // Update organization usage counts
      const { error } = await supabase
        .from('organizations')
        .update({
          current_events_count: eventCount,
          current_users_count: userCount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', organization.id);

      if (error) throw error;

      // Update local usage state
      if (usage) {
        setUsage({
          ...usage,
          current_events_count: eventCount,
          current_users_count: userCount,
        });
      }

    } catch (err: any) {
      console.error('Error updating usage:', err.message);
    }
  };

  useEffect(() => {
    const initializeSubscription = async () => {
      setLoading(true);
      await Promise.all([fetchPlans(), fetchCurrentPlanAndUsage()]);
      setLoading(false);
    };

    initializeSubscription();
  }, [organization]);

  return {
    plans,
    currentPlan,
    usage,
    loading,
    error,
    updateSubscriptionPlan,
    getUsagePercentages,
    getUsageAlerts,
    updateUsage,
    refetch: () => Promise.all([fetchPlans(), fetchCurrentPlanAndUsage()]),
  };
}
