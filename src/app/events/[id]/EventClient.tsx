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
import { LivePolls } from '@/components/LivePolls'
import { EventNetworking } from '@/components/EventNetworking'
import { supabase } from '@/lib/supabase'
import { GlassTile } from '@/components/ui/glass-tile'
import { cn, slugify } from '@/lib/utils'
import { EventRating } from '@/components/EventRating'
import { MessageSquare } from 'lucide-react'

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
    is_networking_enabled?: boolean
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
    const [isNetworkingEnabled, setIsNetworkingEnabled] = useState(false)
    const [isChatOpen, setIsChatOpen] = useState(false)
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
                        max_attendees: directEvent.max_attendees ?? null,
                        is_networking_enabled: directEvent.is_networking_enabled ?? false
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
            setSpeakers((sp || []).map((row: any) => ({
                ...row,
                speaker: Array.isArray(row.speaker) ? row.speaker[0] : row.speaker
            })))
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

            // Check if any confirmed booking has networking enabled
            const networkingActive = confirmedBookings.some(b => b.is_networking_enabled)
            setIsNetworkingEnabled(networkingActive)
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
                <div className="container mx-auto px-4 max-w-7xl mb-12">
                    <Link href="/events" className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 hover:text-black dark:hover:text-white transition-colors mb-6 group">
                        <ArrowLeft className="h-3 w-3 mr-2 transition-transform group-hover:-translate-x-1" />
                        Back to Matrix
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Event Visuals */}
                        <motion.div
                            className="lg:col-span-8"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="relative h-[400px] rounded-[2rem] overflow-hidden shadow-2xl group mb-8">
                                <img
                                    src={event.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop'}
                                    alt={event.title}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                                <div className="absolute bottom-8 left-8 right-8">
                                    <div className="flex gap-3 mb-4">
                                        {event.categories && (
                                            <span className="px-3 py-1 rounded-lg bg-white/10 text-white text-[9px] font-black uppercase tracking-widest backdrop-blur-md border border-white/10">
                                                {event.categories.name}
                                            </span>
                                        )}
                                        {isPastEvent && (
                                            <span className="px-3 py-1 rounded-lg bg-white/10 text-white text-[9px] font-black uppercase tracking-widest backdrop-blur-md border border-white/10">
                                                Past Event
                                            </span>
                                        )}
                                    </div>
                                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-3 leading-[0.9]">
                                        {event.title}
                                    </h1>
                                    <div className="flex flex-wrap gap-6 text-white/80 font-bold text-xs uppercase tracking-wide">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-white" />
                                            {eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-white" />
                                            {event.location}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex gap-6 border-b border-neutral-100 dark:border-white/5 pb-2">
                                    <button
                                        onClick={() => setActiveTab('overview')}
                                        className={cn("text-[10px] font-black uppercase tracking-widest pb-3 relative transition-colors", activeTab === 'overview' ? 'text-black dark:text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-black dark:after:bg-white' : 'text-neutral-400 hover:text-neutral-600')}
                                    >
                                        Overview
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('speakers')}
                                        className={cn("text-[10px] font-black uppercase tracking-widest pb-3 relative transition-colors", activeTab === 'speakers' ? 'text-black dark:text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-black dark:after:bg-white' : 'text-neutral-400 hover:text-neutral-600')}
                                    >
                                        Speakers
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('schedule')}
                                        className={cn("text-[10px] font-black uppercase tracking-widest pb-3 relative transition-colors", activeTab === 'schedule' ? 'text-black dark:text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-black dark:after:bg-white' : 'text-neutral-400 hover:text-neutral-600')}
                                    >
                                        Schedule
                                    </button>
                                </div>
                                {activeTab === 'overview' && (
                                    <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none">
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-wrap font-medium">
                                            {event.description}
                                        </p>
                                    </div>
                                )}

                                {activeTab === 'speakers' && (
                                    <div className="space-y-3">
                                        {speakers.length === 0 ? (
                                            <GlassTile className="p-6" interactive={false}>
                                                <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400">No speakers listed yet.</div>
                                            </GlassTile>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {speakers.map((row, idx) => {
                                                    const sp = row.speaker
                                                    if (!sp) return null
                                                    return (
                                                        <GlassTile key={sp.id} className="p-4" interactive={false}>
                                                            <div className="flex items-start gap-3">
                                                                <div className="h-10 w-10 rounded-xl overflow-hidden bg-neutral-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                                                                    {sp.avatar_url ? (
                                                                        <img src={sp.avatar_url} className="h-full w-full object-cover" alt={sp.name} />
                                                                    ) : (
                                                                        <Mic className="h-4 w-4 text-neutral-400" />
                                                                    )}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <div className="text-sm font-black tracking-tight leading-tight">{sp.name}</div>
                                                                    {row.role && (
                                                                        <div className="text-[8px] font-black uppercase tracking-widest text-blue-500 mt-0.5">
                                                                            {row.role}
                                                                        </div>
                                                                    )}
                                                                    {sp.bio && (
                                                                        <p className="text-xs text-neutral-500 font-medium mt-1.5 line-clamp-2">
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
                                    <div className="space-y-3">
                                        {sessions.length === 0 ? (
                                            <GlassTile className="p-6" interactive={false}>
                                                <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400">No sessions scheduled yet.</div>
                                            </GlassTile>
                                        ) : (
                                            <div className="space-y-2">
                                                {sessions.map(s => {
                                                    const start = s.start_at ? new Date(s.start_at) : null
                                                    const end = s.end_at ? new Date(s.end_at) : null
                                                    return (
                                                        <GlassTile key={s.id} className="p-4" interactive={false}>
                                                            <div className="flex items-start justify-between gap-4">
                                                                <div className="min-w-0">
                                                                    <div className="text-sm font-black tracking-tight leading-tight">{s.title}</div>
                                                                    {s.description && (
                                                                        <p className="text-xs text-neutral-500 font-medium mt-1 whitespace-pre-wrap line-clamp-2">
                                                                            {s.description}
                                                                        </p>
                                                                    )}
                                                                    {(s.location || start) && (
                                                                        <div className="mt-2 flex flex-wrap gap-3 text-[8px] font-black uppercase tracking-widest text-neutral-400">
                                                                            {start && (
                                                                                <span className="inline-flex items-center gap-1.5">
                                                                                    <Clock className="h-3 w-3 text-blue-500" />
                                                                                    {start.toLocaleString([], { hour: '2-digit', minute: '2-digit' })}
                                                                                    {end ? ` → ${end.toLocaleString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                                                                                </span>
                                                                            )}
                                                                            {s.location && (
                                                                                <span className="inline-flex items-center gap-1.5">
                                                                                    <MapPin className="h-3 w-3 text-blue-500" />
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
                                        <div className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-2">
                                            Tags
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {event.event_tags
                                                .map(et => et?.tag)
                                                .filter(Boolean)
                                                .map((tag: any) => (
                                                    <span
                                                        key={tag.id}
                                                        className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-white/5 border border-transparent text-[8px] font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-300"
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
                            <GlassTile className="p-6 mb-4 rounded-[2rem]" interactive={false}>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="text-[9px] font-black uppercase tracking-widest text-neutral-400">
                                            Hosted by <span className="text-black dark:text-white">{hostLabel}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={handleToggleSave}
                                                className={cn(
                                                    'h-8 w-8 rounded-xl border flex items-center justify-center transition-all',
                                                    isSaved
                                                        ? 'bg-red-500/10 border-red-500/20 text-red-500'
                                                        : 'bg-transparent border-neutral-200 dark:border-white/10 text-neutral-400 hover:text-red-500'
                                                )}
                                                aria-label={isSaved ? 'Unsave event' : 'Save event'}
                                            >
                                                <Heart className={cn('h-3.5 w-3.5', isSaved ? 'fill-red-500' : '')} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleShare}
                                                className="h-8 w-8 rounded-xl border border-neutral-200 dark:border-white/10 text-neutral-400 hover:text-black dark:hover:text-white flex items-center justify-center transition-colors"
                                                aria-label="Share event"
                                            >
                                                <Share2 className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleAddToCalendar}
                                                className="h-8 w-8 rounded-xl border border-neutral-200 dark:border-white/10 text-neutral-400 hover:text-black dark:hover:text-white flex items-center justify-center transition-colors"
                                                aria-label="Add to calendar"
                                            >
                                                <CalendarDays className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-1">Admission</div>
                                        <div className="text-4xl font-black tracking-tighter">
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
                                            className="text-[9px] font-black uppercase tracking-widest text-neutral-400"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center p-3 rounded-xl bg-neutral-100/50 dark:bg-white/5 border border-transparent">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-neutral-400" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Time</span>
                                            </div>
                                            <span className="text-xs font-bold text-black dark:text-white">{event.time}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 rounded-xl bg-neutral-100/50 dark:bg-white/5 border border-transparent">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-neutral-400" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Capacity</span>
                                            </div>
                                            <span className="text-xs font-bold text-black dark:text-white">
                                                {maxAttendees ? `${attendeesCount}/${maxAttendees}` : `${attendeesCount}`}
                                            </span>
                                        </div>

                                        {maxAttendees && (
                                            <div className="h-1.5 rounded-full bg-neutral-100 dark:bg-white/5 overflow-hidden">
                                                <div
                                                    className="h-full bg-black dark:bg-white rounded-full transition-all"
                                                    style={{ width: `${Math.min(100, Math.round((attendeesCount / maxAttendees) * 100))}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2 pt-2">
                                        {!isPastEvent && !isBooked && !isSoldOut ? (
                                            <Link href={`/customer/book-event/${event.id}${ticketTypes[0]?.id ? `?ticketTypeId=${ticketTypes[0].id}` : ''}`} className="block">
                                                <Button className="w-full h-12 rounded-xl bg-black dark:bg-white text-white dark:text-black text-sm font-black uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-xl">
                                                    Secure Ticket
                                                </Button>
                                            </Link>
                                        ) : isSoldOut ? (
                                            <Button
                                                onClick={handleJoinWaitlist}
                                                className="w-full h-12 rounded-xl bg-blue-600 text-white text-sm font-black uppercase tracking-widest hover:scale-[1.02] transition-transform"
                                            >
                                                {waitlistStatus === 'joined' ? 'Waitlist Joined' : 'Join Waitlist'}
                                            </Button>
                                        ) : isBooked ? (
                                            <Link href="/customer/bookings" className="block">
                                                <Button variant="outline" className="w-full h-12 rounded-xl border-green-500/30 text-green-600 dark:text-green-400 font-black uppercase tracking-widest bg-green-500/5 hover:bg-green-500/10">
                                                    Access Ticket
                                                </Button>
                                            </Link>
                                        ) : (
                                            <Button disabled className="w-full h-12 rounded-xl bg-neutral-100 dark:bg-white/5 text-neutral-400 font-black uppercase tracking-widest cursor-not-allowed">
                                                Mission Ended
                                            </Button>
                                        )}
                                    </div>

                                    {/* Ticket tiers */}
                                    {ticketTypes.length > 0 && (
                                        <div className="pt-4 space-y-2 border-t border-neutral-100 dark:border-white/5">
                                            <div className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-2">
                                                Available Tiers
                                            </div>
                                            <div className="space-y-2">
                                                {ticketTypes.slice(0, 3).map(t => (
                                                    <div
                                                        key={t.id}
                                                        className="p-3 rounded-xl bg-neutral-100/50 dark:bg-white/5 border border-transparent"
                                                    >
                                                        <div className="flex items-center justify-between gap-3">
                                                            <div className="min-w-0">
                                                                <div className="text-xs font-black tracking-tight leading-tight">{t.name}</div>
                                                            </div>
                                                            <div className="text-right shrink-0">
                                                                <div className="text-xs font-black text-black dark:text-white">
                                                                    {t.price === 0 ? 'Free' : `$${t.price}`}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <p className="text-[8px] text-center text-neutral-400 font-bold uppercase tracking-widest leading-relaxed">
                                        Instant Access • Secure Processing
                                    </p>
                                </div>
                            </GlassTile>

                            <GlassTile className="p-5 rounded-[2rem]" interactive={false}>
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Location Focus</h4>
                                    <MapPin className="h-3 w-3 text-neutral-400" />
                                </div>
                                <div className="h-24 rounded-xl bg-neutral-100 dark:bg-white/5 relative border border-transparent flex items-center justify-center overflow-hidden">
                                    <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=40.7128,-74.0060&zoom=13&size=600x300&maptype=roadmap&style=feature:all|element:all|saturation:-100&key=YOUR_API_KEY')] bg-cover opacity-20 grayscale" />
                                    <div className="relative z-10 flex flex-col items-center">
                                        <MapPin className="h-5 w-5 text-black dark:text-white mb-1" />
                                        <div className="text-[9px] font-black uppercase text-center max-w-[150px] leading-tight px-2">
                                            {event.location}
                                        </div>
                                    </div>
                                </div>
                            </GlassTile>
                        </motion.div>
                    </div>
                </div>

                {/* Live Polls Section */}
                <div className="container mx-auto px-4 max-w-5xl mt-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <LivePolls
                            eventId={event.id}
                            isOrganizer={user?.id === event.created_by}
                            isAttendee={isBooked}
                        />
                    </motion.div>
                </div>

                {/* Reviews Section */}
                <div className="container mx-auto px-4 max-w-5xl mt-12">
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

            {/* Networking Chat Button */}
            {event.is_networking_enabled && isNetworkingEnabled && (
                <div className="fixed bottom-8 right-8 z-40">
                    <Button
                        onClick={() => setIsChatOpen(true)}
                        className="h-16 w-16 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-2xl shadow-blue-500/40 group relative overflow-hidden"
                    >
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <MessageSquare className="h-6 w-6" />
                        </motion.div>
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
                        </span>
                    </Button>
                </div>
            )}

            {/* Chat Sidebar */}
            <EventNetworking
                eventId={event.id}
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
            />
        </div>
    )
}
