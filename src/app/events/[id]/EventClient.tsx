'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useEvents } from '@/contexts/EventContext'
import { useBookings } from '@/contexts/BookingContext'
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, ArrowLeft, Users, CalendarDays, Heart, Share2, Ticket, Mic } from 'lucide-react'
import { ReviewSystem } from '@/components/ReviewSystem'
import { supabase } from '@/lib/supabase'
import { GlassTile } from '@/components/ui/glass-tile'
import { cn, slugify } from '@/lib/utils'
import { EventRating } from '@/components/EventRating'

type Event = {
    id: string
    title: string
    description: string
    date: string
    time: string
    location: string
    price: number
    image_url?: string
    categories?: {
        name: string
    }
    created_by?: string
    created_by_user?: {
        id: string
        first_name?: string | null
        last_name?: string | null
        username?: string | null
        follower_count?: number | null
    } | null
    event_tags?: Array<{ tag?: { id: string; name: string; slug: string } | null }> | null
    max_attendees?: number | null
    created_at?: string
}

type TicketType = {
    id: string
    name: string
    description: string | null
    price: number
    currency: string
    quantity_available: number | null
}

type EventSession = {
    id: string
    title: string
    description: string | null
    start_at: string | null
    end_at: string | null
    location: string | null
}

type SpeakerRow = {
    role: string | null
    sort_order: number
    speaker: {
        id: string
        name: string
        bio: string | null
        avatar_url: string | null
        website_url: string | null
    } | null
}

export default function EventClient() {
    const params = useParams()
    const router = useRouter()
    const { user } = useAuth()
    const { events, loading: eventsLoading } = useEvents()
    const { bookings } = useBookings()

    const [event, setEvent] = useState<Event | null>(null)
    const [isBooked, setIsBooked] = useState(false)
    const [userBookings, setUserBookings] = useState<any[]>([])
    const [loadingDirect, setLoadingDirect] = useState(false)
    const [isSaved, setIsSaved] = useState(false)
    const [eventStats, setEventStats] = useState<{ attendees_count: number; average_rating: number; total_reviews: number } | null>(null)
    const [activeTab, setActiveTab] = useState<'overview' | 'speakers' | 'schedule'>('overview')
    const [ticketTypes, setTicketTypes] = useState<TicketType[]>([])
    const [sessions, setSessions] = useState<EventSession[]>([])
    const [speakers, setSpeakers] = useState<SpeakerRow[]>([])
    const [waitlistStatus, setWaitlistStatus] = useState<'idle' | 'joined' | 'error'>('idle')

    useEffect(() => {
        const fetchEvent = async () => {
            if (!params.id) return

            console.log('🔍 Looking for event:', params.id)

            // First try to find the event in the context
            if (events) {
                const foundEvent = events.find(e => e.id === params.id)
                if (foundEvent) {
                    console.log('✅ Event found in context:', foundEvent.title)
                    setEvent(foundEvent)
                    return
                }
            }

            // If not found in context, try to fetch directly from Supabase
            console.log('🔍 Event not found in context, fetching directly from database...')
            setLoadingDirect(true)

            try {
                // Try the full query with joins
                const { data: directEvent, error } = await supabase
                    .from('events')
                    .select(`
                        *,
                        categories:category_id(name),
                        event_spaces:event_space_id(name),
                        created_by_user:users(id, first_name, last_name, username, follower_count),
                        event_tags(tag:tags(id, name, slug))
                    `)
                    .eq('id', params.id)
                    .single()

                if (error) {
                    console.error('❌ Full event fetch failed, trying simple fetch...', error)
                    const { data: simpleEvent, error: simpleError } = await supabase
                        .from('events')
                        .select('*')
                        .eq('id', params.id)
                        .single()

                    if (simpleEvent) {
                        setEvent({
                            id: simpleEvent.id,
                            title: simpleEvent.title || 'Untitled Event',
                            description: simpleEvent.description || '',
                            date: simpleEvent.date || '',
                            time: simpleEvent.time || '',
                            location: simpleEvent.location || '',
                            price: simpleEvent.price || 0,
                            image_url: simpleEvent.image_url,
                            created_by: simpleEvent.created_by,
                            created_at: simpleEvent.created_at
                        })
                    }
                    return
                }

                if (directEvent) {
                    setEvent({
                        id: directEvent.id,
                        title: directEvent.title,
                        description: directEvent.description,
                        date: directEvent.date,
                        time: directEvent.time,
                        location: directEvent.location,
                        price: directEvent.price,
                        image_url: directEvent.image_url,
                        categories: directEvent.categories ? { name: directEvent.categories.name } : undefined,
                        created_by: directEvent.created_by,
                        created_at: directEvent.created_at,
                        created_by_user: directEvent.created_by_user ?? null,
                        event_tags: directEvent.event_tags ?? null,
                        max_attendees: directEvent.max_attendees ?? null
                    })
                }
            } catch (error) {
                console.error('💥 Unexpected error in direct event fetch:', error)
            } finally {
                setLoadingDirect(false)
            }
        }

        fetchEvent()
    }, [params.id, events])

    useEffect(() => {
        const loadSaved = async () => {
            if (!user?.id || !event?.id) {
                setIsSaved(false)
                return
            }

            const { data, error } = await supabase
                .from('follows')
                .select('id')
                .eq('follower_id', user.id)
                .eq('target_type', 'EVENT')
                .eq('target_id', event.id)
                .maybeSingle()

            if (error) {
                console.error('Failed to load saved state:', error)
                return
            }

            setIsSaved(Boolean(data?.id))
        }

        loadSaved()
    }, [user?.id, event?.id])

    useEffect(() => {
        const loadStats = async () => {
            if (!event?.id) {
                setEventStats(null)
                return
            }

            const { data, error } = await supabase
                .from('event_discovery_stats')
                .select('attendees_count, average_rating, total_reviews')
                .eq('event_id', event.id)
                .maybeSingle()

            if (error) {
                console.error('Failed to load event stats:', error)
                return
            }

            setEventStats({
                attendees_count: Number(data?.attendees_count ?? 0),
                average_rating: Number(data?.average_rating ?? 0),
                total_reviews: Number(data?.total_reviews ?? 0),
            })
        }

        loadStats()
    }, [event?.id])

    useEffect(() => {
        const loadExtras = async () => {
            if (!event?.id) return

            const [{ data: tiers, error: tiersError }, { data: sess, error: sessError }, { data: sp, error: spError }] = await Promise.all([
                supabase
                    .from('ticket_types')
                    .select('id, name, description, price, currency, quantity_available')
                    .eq('event_id', event.id)
                    .eq('is_active', true)
                    .order('price', { ascending: true }),
                supabase
                    .from('event_sessions')
                    .select('id, title, description, start_at, end_at, location')
                    .eq('event_id', event.id)
                    .order('start_at', { ascending: true }),
                supabase
                    .from('event_speakers')
                    .select('role, sort_order, speaker:speakers(id, name, bio, avatar_url, website_url)')
                    .eq('event_id', event.id)
                    .order('sort_order', { ascending: true }),
            ])

            if (tiersError) console.error('Failed to load ticket tiers:', tiersError)
            if (sessError) console.error('Failed to load sessions:', sessError)
            if (spError) console.error('Failed to load speakers:', spError)

            setTicketTypes((tiers || []).map((t: any) => ({ ...t, price: Number(t.price ?? 0) })))
            setSessions(sess || [])
            setSpeakers(sp || [])
        }

        loadExtras()
    }, [event?.id])

    useEffect(() => {
        if (user && bookings && event) {
            const userEventBookings = bookings.filter(booking =>
                booking.user_id === user.id && booking.event?.id === event.id
            )
            setUserBookings(userEventBookings)
            const confirmedBookings = userEventBookings.filter(booking => booking.status === 'CONFIRMED')
            setIsBooked(confirmedBookings.length > 0)
        }
    }, [user, bookings, event])

    if (eventsLoading || loadingDirect) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />
                <main className="flex-grow flex items-center justify-center">
                    <motion.div
                        className="w-16 h-16 border-4 border-t-blue-500 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                </main>
                <Footer />
            </div>
        )
    }

    if (!event) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />
                <main className="flex-grow container mx-auto px-4 flex flex-col items-center justify-center text-center">
                    <GlassTile className="p-12 max-w-2xl" interactive={false}>
                        <h1 className="text-4xl font-black tracking-tighter mb-4">Event Not Found</h1>
                        <p className="text-neutral-500 mb-8 font-medium">
                            The event you're looking for doesn't exist or has been removed.
                        </p>
                        <Link href="/events">
                            <Button className="h-14 px-8 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-bold">
                                Back to Events
                            </Button>
                        </Link>
                    </GlassTile>
                </main>
                <Footer />
            </div>
        )
    }

    const eventDate = new Date(event.date)
    const isPastEvent = eventDate < new Date()
    const maxAttendees = typeof event.max_attendees === 'number' ? event.max_attendees : null
    const attendeesCount = eventStats?.attendees_count ?? 0
    const isSoldOut = Boolean(maxAttendees && attendeesCount >= maxAttendees)

    const hostLabel = event.created_by_user
        ? (event.created_by_user.first_name || event.created_by_user.last_name
            ? `${event.created_by_user.first_name || ''} ${event.created_by_user.last_name || ''}`.trim()
            : (event.created_by_user.username || 'Host'))
        : 'Host'

    const handleToggleSave = async () => {
        if (!user?.id) {
            router.push('/auth')
            return
        }

        if (isSaved) {
            const { error } = await supabase
                .from('follows')
                .delete()
                .eq('follower_id', user.id)
                .eq('target_type', 'EVENT')
                .eq('target_id', event.id)

            if (!error) setIsSaved(false)
        } else {
            const { error } = await supabase
                .from('follows')
                .insert({ follower_id: user.id, target_type: 'EVENT', target_id: event.id })

            if (!error) setIsSaved(true)
        }
    }

    const handleShare = async () => {
        const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
        try {
            if (navigator.share) {
                await navigator.share({
                    title: event.title,
                    text: `Check out "${event.title}"`,
                    url: shareUrl,
                })
            } else if (navigator.clipboard && shareUrl) {
                await navigator.clipboard.writeText(shareUrl)
            }
        } catch (e) {
            // user cancelled share or clipboard failed; ignore
        }
    }

    const handleAddToCalendar = () => {
        try {
            const rawTime = (event.time || '00:00').trim()
            const normalizedTime = rawTime.split(':').length === 2 ? `${rawTime}:00` : rawTime
            const start = new Date(`${event.date}T${normalizedTime}`)
            const end = new Date(start)
            end.setHours(end.getHours() + 2)

            const formatICS = (d: Date) =>
                d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')

            const ics = [
                'BEGIN:VCALENDAR',
                'VERSION:2.0',
                'PRODID:-//EventFlow//EN',
                'CALSCALE:GREGORIAN',
                'METHOD:PUBLISH',
                'BEGIN:VEVENT',
                `UID:${event.id}@eventflow`,
                `DTSTAMP:${formatICS(new Date())}`,
                `DTSTART:${formatICS(start)}`,
                `DTEND:${formatICS(end)}`,
                `SUMMARY:${event.title.replace(/\n/g, ' ')}`,
                `LOCATION:${(event.location || '').replace(/\n/g, ' ')}`,
                `DESCRIPTION:${(event.description || '').replace(/\n/g, '\\n')}`,
                'END:VEVENT',
                'END:VCALENDAR',
            ].join('\r\n')

            const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${slugify(event.title || 'event')}.ics`
            document.body.appendChild(a)
            a.click()
            a.remove()
            URL.revokeObjectURL(url)
        } catch (e) {
            // ignore
        }
    }

    const handleJoinWaitlist = async () => {
        if (!user?.id || !event?.id) {
            router.push('/auth')
            return
        }

        setWaitlistStatus('idle')
        const { error } = await supabase
            .from('waitlist_entries')
            .insert({ event_id: event.id, user_id: user.id, status: 'WAITING' })

        if (error) {
            console.error('Failed to join waitlist:', error)
            setWaitlistStatus('error')
            return
        }
        setWaitlistStatus('joined')
    }

    return (
        <div className="min-h-screen flex flex-col bg-background relative overflow-x-hidden">
            {/* Mesh Background */}
            <div className="fixed inset-0 z-[-1] opacity-30 dark:opacity-20 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-400/20 blur-[120px]" />
            </div>

            <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />

            <main className="flex-grow pt-32 pb-20">
                {/* Hero Section */}
                <div className="container mx-auto px-4 mb-16">
                    <Link href="/events" className="inline-flex items-center text-sm font-bold uppercase tracking-widest text-neutral-500 hover:text-blue-500 transition-colors mb-8 group">
                        <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
                        Back to Collection
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                        {/* Event Visuals */}
                        <motion.div
                            className="lg:col-span-8"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="relative h-[600px] rounded-[3rem] overflow-hidden shadow-2xl group">
                                <img
                                    src={event.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop'}
                                    alt={event.title}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                <div className="absolute bottom-12 left-12 right-12">
                                    <div className="flex gap-4 mb-6">
                                        {event.categories && (
                                            <span className="px-4 py-2 rounded-xl bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
                                                {event.categories.name}
                                            </span>
                                        )}
                                        {isPastEvent && (
                                            <span className="px-4 py-2 rounded-xl bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest backdrop-blur-md border border-white/20">
                                                Past Event
                                            </span>
                                        )}
                                    </div>
                                    <h1 className="text-4xl md:text-7xl font-bold text-white tracking-tighter mb-4 leading-[0.9]">
                                        {event.title}
                                    </h1>
                                    <div className="flex flex-wrap gap-8 text-white/80 font-medium">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-5 w-5 text-blue-400" />
                                            {eventDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-5 w-5 text-blue-400" />
                                            {event.location}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 space-y-8">
                                <div className="flex gap-8 border-b border-neutral-100 dark:border-neutral-800 pb-4">
                                        <button
                                            onClick={() => setActiveTab('overview')}
                                            className={cn("text-sm font-bold uppercase tracking-widest pb-4 relative", activeTab === 'overview' ? 'text-blue-500' : 'text-neutral-400')}
                                        >
                                        Overview
                                    </button>
                                        <button
                                            onClick={() => setActiveTab('speakers')}
                                            className={cn("text-sm font-bold uppercase tracking-widest pb-4 relative", activeTab === 'speakers' ? 'text-blue-500' : 'text-neutral-400')}
                                        >
                                        Speakers
                                    </button>
                                        <button
                                            onClick={() => setActiveTab('schedule')}
                                            className={cn("text-sm font-bold uppercase tracking-widest pb-4 relative", activeTab === 'schedule' ? 'text-blue-500' : 'text-neutral-400')}
                                        >
                                        Schedule
                                    </button>
                                </div>
                                    {activeTab === 'overview' && (
                                        <div className="prose prose-neutral dark:prose-invert max-w-none">
                                            <h3 className="text-2xl font-bold mb-4">About the Event</h3>
                                            <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-wrap font-medium">
                                                {event.description}
                                            </p>
                                        </div>
                                    )}

                                    {activeTab === 'speakers' && (
                                        <div className="space-y-4">
                                            {speakers.length === 0 ? (
                                                <GlassTile className="p-8" interactive={false}>
                                                    <div className="text-sm font-bold uppercase tracking-widest text-neutral-400">No speakers listed yet.</div>
                                                </GlassTile>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {speakers.map((row, idx) => {
                                                        const sp = row.speaker
                                                        if (!sp) return null
                                                        return (
                                                            <GlassTile key={sp.id} className="p-6" interactive={false}>
                                                                <div className="flex items-start gap-4">
                                                                    <div className="h-14 w-14 rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 flex items-center justify-center">
                                                                        {sp.avatar_url ? (
                                                                            <img src={sp.avatar_url} className="h-full w-full object-cover" alt={sp.name} />
                                                                        ) : (
                                                                            <Mic className="h-5 w-5 text-neutral-400" />
                                                                        )}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <div className="text-lg font-black tracking-tight">{sp.name}</div>
                                                                        {row.role && (
                                                                            <div className="text-[10px] font-black uppercase tracking-widest text-blue-500 mt-1">
                                                                                {row.role}
                                                                            </div>
                                                                        )}
                                                                        {sp.bio && (
                                                                            <p className="text-sm text-neutral-500 font-medium mt-3 line-clamp-4">
                                                                                {sp.bio}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </GlassTile>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'schedule' && (
                                        <div className="space-y-4">
                                            {sessions.length === 0 ? (
                                                <GlassTile className="p-8" interactive={false}>
                                                    <div className="text-sm font-bold uppercase tracking-widest text-neutral-400">No sessions scheduled yet.</div>
                                                </GlassTile>
                                            ) : (
                                                <div className="space-y-3">
                                                    {sessions.map(s => {
                                                        const start = s.start_at ? new Date(s.start_at) : null
                                                        const end = s.end_at ? new Date(s.end_at) : null
                                                        return (
                                                            <GlassTile key={s.id} className="p-6" interactive={false}>
                                                                <div className="flex items-start justify-between gap-6">
                                                                    <div className="min-w-0">
                                                                        <div className="text-lg font-black tracking-tight">{s.title}</div>
                                                                        {s.description && (
                                                                            <p className="text-sm text-neutral-500 font-medium mt-2 whitespace-pre-wrap">
                                                                                {s.description}
                                                                            </p>
                                                                        )}
                                                                        {(s.location || start) && (
                                                                            <div className="mt-3 flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                                                                                {start && (
                                                                                    <span className="inline-flex items-center gap-2">
                                                                                        <Clock className="h-3.5 w-3.5 text-blue-500" />
                                                                                        {start.toLocaleString()}
                                                                                        {end ? ` → ${end.toLocaleTimeString()}` : ''}
                                                                                    </span>
                                                                                )}
                                                                                {s.location && (
                                                                                    <span className="inline-flex items-center gap-2">
                                                                                        <MapPin className="h-3.5 w-3.5 text-blue-500" />
                                                                                        {s.location}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </GlassTile>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Tags */}
                                    {Array.isArray(event.event_tags) && event.event_tags.length > 0 && (
                                        <div className="pt-2">
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">
                                                Tags
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {event.event_tags
                                                    .map(et => et?.tag)
                                                    .filter(Boolean)
                                                    .map((tag: any) => (
                                                        <span
                                                            key={tag.id}
                                                            className="px-3 py-1 rounded-full bg-white/40 dark:bg-black/40 border border-white/60 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-300"
                                                        >
                                                            {tag.name}
                                                        </span>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                            </div>
                        </motion.div>

                        {/* Booking & Info Sidebar */}
                        <motion.div
                            className="lg:col-span-4 sticky top-32"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <GlassTile className="p-8 mb-8" interactive={false}>
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                                            Hosted by <span className="text-neutral-600 dark:text-neutral-300">{hostLabel}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={handleToggleSave}
                                                className={cn(
                                                    'h-10 w-10 rounded-2xl border flex items-center justify-center transition-all',
                                                    isSaved
                                                        ? 'bg-red-500/10 border-red-500/20 text-red-500'
                                                        : 'bg-white/40 dark:bg-black/40 border-white/60 dark:border-white/10 text-neutral-500 hover:text-red-500'
                                                )}
                                                aria-label={isSaved ? 'Unsave event' : 'Save event'}
                                            >
                                                <Heart className={cn('h-4 w-4', isSaved ? 'fill-red-500' : '')} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleShare}
                                                className="h-10 w-10 rounded-2xl border bg-white/40 dark:bg-black/40 border-white/60 dark:border-white/10 text-neutral-500 hover:text-blue-500 flex items-center justify-center transition-colors"
                                                aria-label="Share event"
                                            >
                                                <Share2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleAddToCalendar}
                                                className="h-10 w-10 rounded-2xl border bg-white/40 dark:bg-black/40 border-white/60 dark:border-white/10 text-neutral-500 hover:text-blue-500 flex items-center justify-center transition-colors"
                                                aria-label="Add to calendar"
                                            >
                                                <CalendarDays className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Admission</div>
                                        <div className="text-5xl font-black tracking-tighter">
                                            {event.price === 0 ? 'Free' : `$${event.price}`}
                                        </div>
                                    </div>

                                    {/* Rating */}
                                    <div className="pt-1">
                                        <EventRating
                                            rating={eventStats?.average_rating ?? 0}
                                            reviewCount={eventStats?.total_reviews ?? 0}
                                            size="sm"
                                            showCount={true}
                                            className="text-[10px] font-black uppercase tracking-widest text-neutral-400"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-4 rounded-2xl bg-white/40 dark:bg-black/40 border border-white/60 dark:border-white/10">
                                            <div className="flex items-center gap-3">
                                                <Clock className="h-5 w-5 text-blue-500" />
                                                <span className="text-sm font-bold uppercase tracking-widest">Time</span>
                                            </div>
                                            <span className="text-sm font-bold text-neutral-500">{event.time}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 rounded-2xl bg-white/40 dark:bg-black/40 border border-white/60 dark:border-white/10">
                                            <div className="flex items-center gap-3">
                                                <Users className="h-5 w-5 text-blue-500" />
                                                <span className="text-sm font-bold uppercase tracking-widest">Capacity</span>
                                            </div>
                                            <span className="text-sm font-bold text-neutral-500">
                                                {maxAttendees ? `${attendeesCount}/${maxAttendees}` : `${attendeesCount}`}
                                            </span>
                                        </div>

                                        {maxAttendees && (
                                            <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500 rounded-full transition-all"
                                                    style={{ width: `${Math.min(100, Math.round((attendeesCount / maxAttendees) * 100))}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        {!isPastEvent && !isBooked && !isSoldOut ? (
                                            <Link href={`/customer/book-event/${event.id}${ticketTypes[0]?.id ? `?ticketTypeId=${ticketTypes[0].id}` : ''}`}>
                                                <Button className="w-full h-16 rounded-[1.25rem] bg-black dark:bg-white text-white dark:text-black text-lg font-black tracking-tight hover:scale-[1.02] transition-transform">
                                                    Secure Your Ticket
                                                </Button>
                                            </Link>
                                        ) : isSoldOut ? (
                                            <Button
                                                onClick={handleJoinWaitlist}
                                                className="w-full h-16 rounded-[1.25rem] bg-blue-600 text-white text-lg font-black tracking-tight hover:scale-[1.02] transition-transform"
                                            >
                                                {waitlistStatus === 'joined' ? 'Waitlist Joined' : 'Join Waitlist'}
                                            </Button>
                                        ) : isBooked ? (
                                            <Link href="/customer/bookings">
                                                <Button variant="outline" className="w-full h-16 rounded-[1.25rem] border-green-500/50 text-green-500 font-black tracking-tight bg-green-500/5 hover:bg-green-500/10 transition-colors">
                                                    Reserved → View Details
                                                </Button>
                                            </Link>
                                        ) : (
                                            <Button disabled className="w-full h-16 rounded-[1.25rem] bg-neutral-100 dark:bg-neutral-800 text-neutral-400 font-black tracking-tight cursor-not-allowed">
                                                Event Completed
                                            </Button>
                                        )}
                                    </div>

                                    {/* Ticket tiers */}
                                    {ticketTypes.length > 0 && (
                                        <div className="pt-2 space-y-3">
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                                                Ticket Tiers
                                            </div>
                                            <div className="space-y-2">
                                                {ticketTypes.slice(0, 4).map(t => (
                                                    <div
                                                        key={t.id}
                                                        className="p-4 rounded-2xl bg-white/40 dark:bg-black/40 border border-white/60 dark:border-white/10"
                                                    >
                                                        <div className="flex items-center justify-between gap-3">
                                                            <div className="min-w-0">
                                                                <div className="text-sm font-black tracking-tight">{t.name}</div>
                                                                {t.description && (
                                                                    <div className="text-xs text-neutral-500 font-medium mt-1 line-clamp-2">
                                                                        {t.description}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-sm font-black text-blue-500">
                                                                    {t.price === 0 ? 'Free' : `$${t.price}`}
                                                                </div>
                                                                <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                                                                    {t.currency}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <p className="text-[10px] text-center text-neutral-400 font-bold uppercase tracking-widest leading-relaxed">
                                        Instant confirmation • Digital Mobile Entry<br /> Secure checkout via EventFlow Pay
                                    </p>
                                </div>
                            </GlassTile>

                            <GlassTile className="p-6" interactive={false}>
                                <h4 className="text-sm font-bold uppercase tracking-widest mb-4">Location Focus</h4>
                                <div className="h-40 rounded-2xl bg-neutral-100 dark:bg-neutral-900 overflow-hidden relative border border-neutral-100 dark:border-neutral-800">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <MapPin className="h-8 w-8 text-red-500 animate-bounce" />
                                    </div>
                                    <div className="absolute bottom-0 inset-x-0 p-3 bg-white/60 dark:bg-black/60 backdrop-blur-md text-[10px] font-bold uppercase text-center border-t border-white/20">
                                        {event.location}
                                    </div>
                                </div>
                            </GlassTile>
                        </motion.div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="container mx-auto px-4 mt-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <ReviewSystem
                            eventId={event.id}
                            eventTitle={event.title}
                            eventDate={event.date}
                            userBookings={userBookings}
                        />
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
