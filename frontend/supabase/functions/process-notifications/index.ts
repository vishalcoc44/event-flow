import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Process scheduled notifications
    const { data: processedCount, error: processError } = await supabase.rpc('process_scheduled_notifications')
    
    if (processError) {
      console.error('Error processing notifications:', processError)
      return new Response(
        JSON.stringify({ error: 'Failed to process notifications' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get notifications that need to be sent
    const { data: notificationsToSend, error: fetchError } = await supabase
      .from('notifications')
      .select(`
        *,
        user:user_id(email, username)
      `)
      .eq('is_sent', false)
      .lte('scheduled_at', new Date().toISOString())
      .limit(50)

    if (fetchError) {
      console.error('Error fetching notifications:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch notifications' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let sentCount = 0
    const results = []

    // Process each notification
    for (const notification of notificationsToSend || []) {
      try {
        // Send email notification (you can integrate with your email service here)
        const emailSent = await sendEmailNotification(notification)
        
        // Mark notification as sent
        const { error: updateError } = await supabase
          .from('notifications')
          .update({ 
            is_sent: true, 
            sent_at: new Date().toISOString() 
          })
          .eq('id', notification.id)

        if (updateError) {
          console.error('Error updating notification:', updateError)
          continue
        }

        sentCount++
        results.push({
          id: notification.id,
          type: notification.type,
          emailSent,
          timestamp: new Date().toISOString()
        })

      } catch (error) {
        console.error('Error processing notification:', error)
        results.push({
          id: notification.id,
          type: notification.type,
          error: error.message,
          timestamp: new Date().toISOString()
        })
      }
    }

    // Clean old notifications (older than 30 days)
    const { data: cleanedCount, error: cleanError } = await supabase.rpc('clean_old_notifications', {
      days_to_keep: 30
    })

    if (cleanError) {
      console.error('Error cleaning old notifications:', cleanError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        processedCount: processedCount || 0,
        sentCount,
        cleanedCount: cleanedCount || 0,
        results,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Email notification function (placeholder - integrate with your email service)
async function sendEmailNotification(notification: any): Promise<boolean> {
  try {
    // This is a placeholder implementation
    // You should integrate with your preferred email service like:
    // - SendGrid
    // - Mailgun
    // - AWS SES
    // - Resend
    // - etc.

    console.log(`Sending email notification to ${notification.user?.email}:`, {
      subject: notification.title,
      message: notification.message,
      type: notification.type
    })

    // Example with a hypothetical email service:
    /*
    const emailService = new EmailService()
    await emailService.send({
      to: notification.user.email,
      subject: notification.title,
      html: `
        <h2>${notification.title}</h2>
        <p>${notification.message}</p>
        <p><small>EventFlow Notification</small></p>
      `,
      text: `${notification.title}\n\n${notification.message}\n\nEventFlow Notification`
    })
    */

    // For now, we'll just simulate success
    return true

  } catch (error) {
    console.error('Error sending email notification:', error)
    return false
  }
}

// Example email service integration (uncomment and configure as needed)
/*
import { Resend } from 'resend'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

async function sendEmailWithResend(notification: any): Promise<boolean> {
  try {
    const { data, error } = await resend.emails.send({
      from: 'EventFlow <notifications@yourapp.com>',
      to: [notification.user.email],
      subject: notification.title,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">${notification.title}</h2>
          <p style="color: #666; line-height: 1.6;">${notification.message}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">
            EventFlow Notification<br>
            <a href="https://yourapp.com/notifications" style="color: #007bff;">Manage notifications</a>
          </p>
        </div>
      `,
      text: `${notification.title}\n\n${notification.message}\n\nEventFlow Notification\nManage notifications: https://yourapp.com/notifications`
    })

    if (error) {
      console.error('Resend error:', error)
      return false
    }

    console.log('Email sent successfully:', data)
    return true

  } catch (error) {
    console.error('Error sending email with Resend:', error)
    return false
  }
}
*/ 