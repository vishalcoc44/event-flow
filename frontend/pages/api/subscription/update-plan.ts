import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../src/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { organizationId, planName, userId } = req.body;

  if (!organizationId || !planName || !userId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Get the new plan details
    const { data: newPlan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('name', planName)
      .single();

    if (planError || !newPlan) {
      return res.status(404).json({ error: 'Subscription plan not found' });
    }

    // Update organization subscription
    const { error: updateError } = await supabase
      .from('organizations')
      .update({
        subscription_plan: planName,
        max_events: newPlan.max_events,
        max_users: newPlan.max_users,
        max_storage_mb: newPlan.max_storage_mb,
        subscription_start_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', organizationId);

    if (updateError) {
      throw updateError;
    }

    // Return updated plan details
    return res.status(200).json({
      success: true,
      message: `Subscription updated to ${newPlan.display_name}`,
      plan: newPlan
    });

  } catch (error: any) {
    console.error('Subscription update error:', error);
    return res.status(500).json({ 
      error: 'Failed to update subscription',
      message: error.message 
    });
  }
}
