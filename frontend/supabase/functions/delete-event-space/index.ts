import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DeleteEventSpaceRequest {
  spaceId: string
  moveEventsToSpaceId?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get user from JWT
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Parse request body
    const { spaceId, moveEventsToSpaceId }: DeleteEventSpaceRequest = await req.json()

    if (!spaceId) {
      throw new Error('Space ID is required')
    }

    console.log('Delete request for space:', spaceId, 'by user:', user.id)

    // Step 1: Resolve space ID to UUID if needed
    let resolvedSpaceId = spaceId
    let resolvedMoveToSpaceId = moveEventsToSpaceId

    // Check if spaceId is already a UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    
    if (!uuidRegex.test(spaceId)) {
      console.log('Resolving non-UUID space ID:', spaceId)
      
      // Try to find space by ID, slug, or name
      const { data: spaceData, error: spaceError } = await supabaseClient
        .from('event_spaces')
        .select('id, name, slug')
        .or(`id.eq.${spaceId},slug.eq.${spaceId},name.ilike.${spaceId}`)
        .single()

      if (spaceError || !spaceData) {
        console.error('Space lookup error:', spaceError)
        throw new Error(`Event space not found: ${spaceId}`)
      }

      resolvedSpaceId = spaceData.id
      console.log('Resolved space ID:', resolvedSpaceId)
    }

    // Step 2: Resolve move-to space ID if provided
    if (moveEventsToSpaceId && !uuidRegex.test(moveEventsToSpaceId)) {
      const { data: moveToSpaceData, error: moveToSpaceError } = await supabaseClient
        .from('event_spaces')
        .select('id')
        .or(`id.eq.${moveEventsToSpaceId},slug.eq.${moveEventsToSpaceId},name.ilike.${moveEventsToSpaceId}`)
        .single()

      if (moveToSpaceError || !moveToSpaceData) {
        throw new Error(`Target space not found: ${moveEventsToSpaceId}`)
      }

      resolvedMoveToSpaceId = moveToSpaceData.id
    }

    // Step 3: Call the safe delete function
    const { data: result, error: deleteError } = await supabaseClient
      .rpc('safe_delete_event_space', {
        p_space_id: resolvedSpaceId,
        p_user_id: user.id,
        p_move_events_to_space_id: resolvedMoveToSpaceId || null
      })

    if (deleteError) {
      console.error('Delete function error:', deleteError)
      throw new Error(deleteError.message || 'Failed to delete event space')
    }

    console.log('Delete successful:', result)

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        data: result,
        message: `Event space deleted successfully. ${result?.events_moved || 0} events were moved.`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error: any) {
    console.error('Edge function error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
        message: error.message || 'Failed to delete event space'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.message === 'Unauthorized' ? 401 : 400,
      }
    )
  }
})
