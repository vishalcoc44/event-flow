import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const { data: userData, error: orgError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (orgError || !userData?.organization_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    // Get organization stats from the view
    const { data: stats, error: statsError } = await supabase
      .from('organization_dashboard_stats')
      .select('*')
      .eq('organization_id', userData.organization_id)
      .single();

    if (statsError) {
      console.error('Error fetching stats:', statsError);
      // If view doesn't exist or no data, return default stats
      const { data: orgData, error: orgDataError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', userData.organization_id)
        .single();

      if (orgDataError) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
      }

      // Return basic stats from organization table
      const defaultStats = {
        organization_id: userData.organization_id,
        organization_name: orgData.name,
        subscription_plan: orgData.subscription_plan,
        subscription_status: orgData.subscription_status,
        max_events: orgData.max_events,
        max_users: orgData.max_users,
        current_events_count: orgData.current_events_count,
        current_users_count: orgData.current_users_count,
        total_event_spaces: 0,
        total_events: orgData.current_events_count,
        total_bookings: 0,
        total_users: orgData.current_users_count,
        events_last_30_days: 0,
        bookings_last_30_days: 0
      };

      return NextResponse.json(defaultStats);
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error in stats API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 