// Simplified Frontend API that calls Supabase Edge Function
// This file exists to resolve build issues - functionality is handled by Edge Function

import { supabase } from './src/lib/supabase';

export async function deleteEventSpace(spaceId: string, moveEventsToSpaceId?: string) {
  try {
    console.log('Calling Edge Function to delete space:', spaceId);

    // Call Edge Function (no need to get session, Edge Function handles auth)
    const { data, error } = await supabase.functions.invoke('delete-event-space', {
      body: { 
        spaceId,
        moveEventsToSpaceId 
      }
    });

    if (error) {
      console.error('Edge Function error:', error);
      throw new Error(error.message || 'Failed to delete event space');
    }

    if (!data?.success) {
      console.error('Delete operation failed:', data?.error);
      throw new Error(data?.error || 'Failed to delete event space');
    }

    console.log('Space deleted successfully:', data);
    return data;

  } catch (error) {
    console.error('Error in deleteEventSpace:', error);
    throw error;
  }
}
