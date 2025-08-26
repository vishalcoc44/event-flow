import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (userDataError || !userData?.organization_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    // Get organization details
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', userData.organization_id)
      .single();

    if (orgError || !org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    return NextResponse.json(org);
  } catch (error) {
    console.error('Error fetching organization:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, slug, description, subscription_plan } = body;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    // Create organization using the database function
    const { data, error } = await supabase.rpc('create_organization', {
      p_name: name,
      p_slug: slug,
      p_created_by: user.id,
      p_description: description || '',
      p_subscription_plan: subscription_plan || 'FREE'
    });

    if (error) {
      console.error('Error creating organization:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Update user to be part of this organization
    const { error: updateError } = await supabase
      .from('users')
      .update({
        organization_id: data,
        role_in_org: 'OWNER',
        is_org_admin: true,
        joined_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating user organization:', updateError);
      // Organization was created but user update failed - this should be handled
      return NextResponse.json({ 
        error: 'Organization created but user update failed', 
        organization_id: data 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      organization_id: data,
      message: 'Organization created successfully'
    });
  } catch (error) {
    console.error('Error in organization creation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 