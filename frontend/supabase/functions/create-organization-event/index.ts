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
  max_attendees?: number | null
  registration_deadline?: string | null
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

    // Create the event
    const { data: newEvent, error: eventError } = await supabase
      .from('events')
      .insert({
        title: event_data.title,
        description: event_data.description,
        category_id: event_data.category_id || null,
        event_space_id: event_data.event_space_id || null,
        location: event_data.location || null,
        price: event_data.price || 0,
        date: event_data.date || null,
        time: event_data.time || null,
        image_url: event_data.image_url || null,
        organization_id: organization_id,
        created_by: user.id,
        is_public: event_data.is_public ?? true,
        requires_approval: event_data.requires_approval ?? false,
        max_attendees: event_data.max_attendees || null,
        registration_deadline: event_data.registration_deadline || null,
        is_approved: !(event_data.requires_approval ?? false), // Auto-approve unless requires approval
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

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

    // Create notifications for organization members
    try {
      // Get all organization members except the creator
      const { data: orgMembers, error: membersError } = await supabase
        .from('users')
        .select('id')
        .eq('organization_id', organization_id)
        .neq('id', user.id)

      if (membersError) {
        console.error('Error fetching organization members:', membersError)
      } else if (orgMembers && orgMembers.length > 0) {
        // Create notification records for each member
        const notifications = orgMembers.map(member => ({
          user_id: member.id,
          type: 'EVENT_CREATED',
          title: `New Event: ${event_data.title}`,
          message: `A new event has been created in your organization: ${event_data.title}`,
          data: {
            event_id: newEvent.id,
            event_title: event_data.title,
            organization_id: organization_id,
            created_by: user.id
          },
          is_read: false,
          created_at: new Date().toISOString()
        }))

        const { error: notificationError } = await supabase
          .from('notifications')
          .insert(notifications)

        if (notificationError) {
          console.error('Error creating notifications:', notificationError)
          // Don't fail the request if notifications fail
        }
      }
    } catch (notificationError) {
      console.error('Notification creation failed:', notificationError)
      // Don't fail the request if notifications fail
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
