import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

interface EventData {
  title: string
  description: string
  category_id?: string | null
  event_space_id?: string | null
  location?: string
  price?: number
  date?: string
  time?: string
  image_url?: string
  is_public?: boolean
  requires_approval?: boolean
  // Note: max_attendees and registration_deadline are not supported in the current schema
}

interface CreateEventRequest {
  event_data: EventData
  organization_id: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')

    // Get user from JWT token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body
    const { event_data, organization_id }: CreateEventRequest = await req.json()

    // Validate required fields
    if (!event_data.title || !event_data.description || !organization_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: title, description, organization_id' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if user is a member of the organization
    const { data: userOrg, error: userOrgError } = await supabase
      .from('users')
      .select('organization_id, role_in_org')
      .eq('id', user.id)
      .eq('organization_id', organization_id)
      .single()

    if (userOrgError || !userOrg) {
      return new Response(
        JSON.stringify({ error: 'User is not a member of this organization' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate event space belongs to the same organization (if provided)
    if (event_data.event_space_id) {
      const { data: eventSpace, error: spaceError } = await supabase
        .from('event_spaces')
        .select('organization_id')
        .eq('id', event_data.event_space_id)
        .single()

      if (spaceError || !eventSpace) {
        return new Response(
          JSON.stringify({ error: 'Event space not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      if (eventSpace.organization_id !== organization_id) {
        return new Response(
          JSON.stringify({ error: 'Event space does not belong to this organization' }),
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    // Use the RPC function for proper validation and business logic
    const { data: eventId, error: eventError } = await supabase
      .rpc('create_organization_event', {
        p_title: event_data.title,
        p_description: event_data.description,
        p_category_id: event_data.category_id || null,
        p_location: event_data.location,
        p_price: event_data.price || 0,
        p_date: event_data.date,
        p_time: event_data.time,
        p_image_url: event_data.image_url,
        p_organization_id: organization_id,
        p_created_by: user.id
      })

    if (eventError) {
      console.error('Error creating event:', eventError)
      return new Response(
        JSON.stringify({ error: 'Failed to create event', details: eventError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Fetch the created event details
    const { data: newEvent, error: fetchError } = await supabase
      .from('events')
      .select(`
        *,
        created_by_user:users!events_created_by_fkey(first_name, last_name, username),
        category:categories(name),
        event_space:event_spaces(name)
      `)
      .eq('id', eventId)
      .single()

    if (fetchError) {
      console.error('Error fetching created event:', fetchError)
      // Don't fail the request, just return the ID
      return new Response(
        JSON.stringify({
          success: true,
          event_id: eventId,
          message: 'Event created successfully'
        }),
        {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Return the created event
    return new Response(
      JSON.stringify({
        success: true,
        event: newEvent,
        message: 'Event created successfully'
      }),
      {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
