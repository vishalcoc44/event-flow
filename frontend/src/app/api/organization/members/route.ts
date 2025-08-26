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

    // Get organization members
    const { data: members, error: membersError } = await supabase
      .from('users')
      .select('id, email, username, first_name, last_name, role_in_org, is_org_admin, joined_at, created_at')
      .eq('organization_id', userData.organization_id)
      .order('joined_at', { ascending: true });

    if (membersError) {
      console.error('Error fetching members:', membersError);
      return NextResponse.json({ error: membersError.message }, { status: 400 });
    }

    return NextResponse.json(members || []);
  } catch (error) {
    console.error('Error in members API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 