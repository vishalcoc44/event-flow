'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { useEvents } from '@/contexts/EventContext'
import { useBookings } from '@/contexts/BookingContext'
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, DollarSign, ArrowLeft, Users, CalendarDays } from 'lucide-react'
import { ReviewSystem } from '@/components/ReviewSystem'
import { supabase } from '@/lib/supabase'
import { GlassTile } from '@/components/ui/glass-tile'
import { cn } from '@/lib/utils'

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
    created_at?: string
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
                        event_spaces:event_space_id(name)
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
                        created_at: directEvent.created_at
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
                                    <button className="text-sm font-bold uppercase tracking-widest pb-4 text-blue-500 relative">
                                        Overview
                                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                                    </button>
                                    <button className="text-sm font-bold uppercase tracking-widest pb-4 text-neutral-400">
                                        Speakers
                                    </button>
                                    <button className="text-sm font-bold uppercase tracking-widest pb-4 text-neutral-400">
                                        Schedule
                                    </button>
                                </div>
                                <div className="prose prose-neutral dark:prose-invert max-w-none">
                                    <h3 className="text-2xl font-bold mb-4">About the Event</h3>
                                    <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-wrap font-medium">
                                        {event.description}
                                    </p>
                                </div>
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
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Admission</div>
                                        <div className="text-5xl font-black tracking-tighter">
                                            {event.price === 0 ? 'Free' : `$${event.price}`}
                                        </div>
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
                                                <span className="text-sm font-bold uppercase tracking-widest">Type</span>
                                            </div>
                                            <span className="text-sm font-bold text-neutral-500">Public</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {!isPastEvent && !isBooked ? (
                                            <Link href={`/customer/book-event/${event.id}`}>
                                                <Button className="w-full h-16 rounded-[1.25rem] bg-black dark:bg-white text-white dark:text-black text-lg font-black tracking-tight hover:scale-[1.02] transition-transform">
                                                    Secure Your Ticket
                                                </Button>
                                            </Link>
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
