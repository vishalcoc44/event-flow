import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../src/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { organizationId } = req.body;

  if (!organizationId) {
    return res.status(400).json({ error: 'Organization ID is required' });
  }

  try {
    // Get current usage counts from database
    const [eventsResult, usersResult] = await Promise.all([
      supabase
        .from('events')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', organizationId),
      supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
    ]);

    const eventCount = eventsResult.count || 0;
    const userCount = usersResult.count || 0;

    // Update organization usage counts
    const { error: updateError } = await supabase
      .from('organizations')
      .update({
        current_events_count: eventCount,
        current_users_count: userCount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', organizationId);

    if (updateError) {
      throw updateError;
    }

    // Get updated organization data
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select(`
        current_events_count,
        current_users_count,
        current_storage_mb,
        max_events,
        max_users,
        max_storage_mb
      `)
      .eq('id', organizationId)
      .single();

    if (orgError) {
      throw orgError;
    }

    return res.status(200).json({
      success: true,
      usage: organization
    });

  } catch (error: any) {
    console.error('Usage update error:', error);
    return res.status(500).json({ 
      error: 'Failed to update usage',
      message: error.message 
    });
  }
}
