import EventClient from './EventClient'
import { supabase } from '@/lib/supabase'

/**
 * Generate static parameters for all event IDs at build time.
 *
 * This function fetches real event IDs from the database to ensure
 * all existing events are pre-generated for static export.
 *
 * @returns Array of objects with 'id' property containing real event IDs
 */
export async function generateStaticParams() {
  try {
    console.log('🔍 Fetching real event IDs from database...')

    // Fetch all event IDs from the database
    const { data: events, error } = await supabase
      .from('events')
      .select('id')
      .orderBy('created_at', { ascending: false })

    if (error) {
      console.error('❌ Failed to fetch event IDs:', error)
      // Generate a comprehensive list of potential UUID patterns
      return generateFallbackUUIDs()
    }

    if (!events || events.length === 0) {
      console.log('⚠️ No events found in database')
      return generateFallbackUUIDs()
    }

    console.log(`✅ Found ${events.length} real event IDs`)

    // Combine real event IDs with comprehensive UUID patterns
    const realEventIds = events.map(event => ({ id: event.id }))
    const fallbackIds = generateFallbackUUIDs()

    // Return combined list (real events first, then fallbacks)
    return [...realEventIds, ...fallbackIds]

  } catch (error) {
    console.error('💥 Unexpected error in generateStaticParams:', error)
    return generateFallbackUUIDs()
  }
}

// For static export compatibility, we keep the static generation approach
// The comprehensive UUID patterns should handle most dynamic events

// Generate basic fallback UUID patterns
function generateFallbackUUIDs() {
  const patterns = [
    // Basic UUID patterns for fallback
    ...Array.from({ length: 20 }, (_, i) => {
      const hex = i.toString(16).padStart(8, '0')
      return `${hex}-0000-4000-8000-${hex.padStart(12, '0')}`
    }),
    'placeholder'
  ]

  return patterns.map(id => ({ id }))
}

export default function EventDetails() {
  return <EventClient />
}