'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { useEvents } from '@/contexts/EventContext'
import { useBookings } from '@/contexts/BookingContext'
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, DollarSign, ArrowLeft, Users, User, CalendarDays } from 'lucide-react'
import { ReviewSystem } from '@/components/ReviewSystem'
import { supabase } from '@/lib/supabase'

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
            console.log('📊 Events in context:', events ? events.length : 0)

            // First try to find the event in the context
            if (events) {
            const foundEvent = events.find(e => e.id === params.id)
            if (foundEvent) {
                    console.log('✅ Event found in context:', foundEvent.title)
                setEvent(foundEvent)
                    return
                }
                console.log('❌ Event not found in context, will try database fetch')
            } else {
                console.log('⚠️ No events in context, will try database fetch')
            }

            // If not found in context, try to fetch directly from Supabase
            // This handles the case where the event wasn't pre-generated at build time
            console.log('🔍 Event not found in context, fetching directly from database...')
            setLoadingDirect(true)

            try {
                console.log('🔍 Fetching event with ID:', params.id)

                // Check if Supabase is properly configured
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
                const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

                if (!supabaseUrl || !supabaseKey) {
                    console.error('❌ Supabase configuration missing:', {
                        hasUrl: !!supabaseUrl,
                        hasKey: !!supabaseKey,
                        note: 'Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local'
                    })
                    return
                }

                console.log('✅ Supabase configuration found')

                // Test basic Supabase connectivity
                try {
                    const { data: connectionTest, error: connectionError } = await supabase
                        .from('events')
                        .select('count')
                        .limit(1)

                    if (connectionError) {
                        console.error('❌ Supabase connection test failed:', {
                            error: connectionError,
                            message: connectionError.message,
                            code: connectionError.code
                        })
                        return
                    }

                    console.log('✅ Supabase connection test passed')
                } catch (connectionTestError) {
                    console.error('❌ Supabase connection test error:', connectionTestError)
                    return
                }

                // First, try a simple query to check if the table and column exist
                const { data: testData, error: testError } = await supabase
                    .from('events')
                    .select('id, title')
                    .eq('id', params.id)
                    .single()

                if (testError) {
                    console.error('❌ Basic event fetch failed:', {
                        error: testError,
                        message: testError.message,
                        details: testError.details,
                        hint: testError.hint,
                        code: testError.code
                    })
                    return
                }

                if (!testData) {
                    console.log('ℹ️ Event not found in database:', params.id)
                    return
                }

                // Now try the full query with joins
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
                    console.error('❌ Full event fetch failed:', {
                        error,
                        message: error.message,
                        details: error.details,
                        hint: error.hint,
                        code: error.code
                    })

                    // If join fails, try without joins
                    console.log('🔄 Trying fetch without joins...')
                    const { data: simpleEvent, error: simpleError } = await supabase
                        .from('events')
                        .select('*')
                        .eq('id', params.id)
                        .single()

                    if (simpleError) {
                        console.error('❌ Simple event fetch also failed:', simpleError)
                        return
                    }

                    if (simpleEvent) {
                        console.log('✅ Simple event fetch succeeded')
                        const transformedEvent: Event = {
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
                        }
                        setEvent(transformedEvent)
                        console.log('✅ Event fetched successfully (without joins)')
                    }
                    return
                }

                if (directEvent) {
                    console.log('✅ Full event fetch succeeded with joins')
                    // Transform the data to match our Event type
                    const transformedEvent: Event = {
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
                    }
                    setEvent(transformedEvent)
                    console.log('✅ Event fetched directly from database')
                }
            } catch (error) {
                console.error('💥 Unexpected error in direct event fetch:', {
                    error,
                    message: error instanceof Error ? error.message : 'Unknown error',
                    stack: error instanceof Error ? error.stack : undefined,
                    eventId: params.id
                })
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
            
            // Only consider confirmed bookings for "isBooked" status
            const confirmedBookings = userEventBookings.filter(booking => booking.status === 'CONFIRMED')
            setIsBooked(confirmedBookings.length > 0)
        }
    }, [user, bookings, event])

    if (eventsLoading || loadingDirect) {
        return (
            <div className="min-h-screen flex flex-col bg-white">
                <Header />
                <main className="flex-grow container mx-auto px-4 py-8">
                    <div className="flex flex-col justify-center items-center h-64 space-y-4">
                        <motion.div
                            className="w-12 h-12 border-4 border-t-[#6CDAEC] rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <p className="text-gray-600 text-sm">
                            {loadingDirect ? 'Loading event details...' : 'Loading events...'}
                        </p>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    if (!event) {
        return (
            <div className="min-h-screen flex flex-col bg-white">
                <Header />
                <main className="flex-grow container mx-auto px-4 py-8">
                    <div className="text-center py-12">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                            {loadingDirect ? 'Loading Event...' : 'Event Not Found'}
                        </h1>
                        <p className="text-gray-600 mb-4">
                            {loadingDirect
                                ? 'Please wait while we load the event details...'
                                : 'The event you\'re looking for doesn\'t exist, has been removed, or couldn\'t be loaded from the database.'
                            }
                        </p>

                        {loadingDirect && (
                            <div className="flex justify-center mb-6">
                                <div className="w-12 h-12 border-4 border-t-[#6CDAEC] rounded-full animate-spin"></div>
                            </div>
                        )}

                        {!loadingDirect && (
                                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
                            <div className="flex items-center mb-2">
                                <span className="text-blue-800 font-medium">ℹ️ Event Loading:</span>
                            </div>
                            <ul className="text-sm text-blue-700 space-y-1 text-left">
                                <li>• This event was created recently and may need a moment to load</li>
                                <li>• The system will automatically fetch the event data</li>
                                <li>• If this persists, try refreshing the page</li>
                                <li>• Check browser console for detailed error logs</li>
                            </ul>
                        </div>
                        )}

                        <div className="space-y-3">
                            <div className="flex gap-3 justify-center">
                                <Link href="/events">
                                    <Button>Browse All Events</Button>
                                </Link>
                                <Link href="/organization/events">
                                    <Button variant="outline">Organization Events</Button>
                                </Link>
                            </div>
                            <div className="text-sm text-gray-500 mt-4 space-y-1">
                                <p>Event ID: <code className="bg-gray-100 px-1 rounded">{params.id}</code></p>
                                <p className="text-xs">Check console (F12) for detailed error information</p>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    const eventDate = new Date(event.date)
    const isPastEvent = eventDate < new Date()

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header />
            
            <main className="flex-grow container mx-auto px-4 py-8">
                {/* Back Button */}
                <div className="mb-6">
                    <Link href="/events">
                        <Button variant="outline" size="sm" className="flex items-center">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Events
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Event Image and Basic Info */}
                    <motion.div
                        className="lg:col-span-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card className="overflow-hidden border border-gray-200 shadow-sm">
                            <div className="relative h-96">
                                <img
                                    src={event.image_url || `https://via.placeholder.com/800x400?text=${encodeURIComponent(event.title || 'Event')}`}
                                    alt={event.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        console.log('Image failed to load, using fallback:', event.image_url);
                                        const fallbackSrc = `https://via.placeholder.com/800x400?text=${encodeURIComponent(event.title || 'Event')}&bg=f3f4f6&color=374151`;
                                        if (e.currentTarget.src !== fallbackSrc) {
                                            e.currentTarget.src = fallbackSrc;
                                        }
                                    }}
                                    onLoad={(e) => {
                                        console.log('Image loaded successfully:', event.image_url || 'fallback image');
                                    }}
                                />
                                {event.categories && (
                                    <div className="absolute top-4 left-4">
                                        <Badge className="bg-[#6CDAEC] text-white">
                                            {event.categories.name}
                                        </Badge>
                                    </div>
                                )}
                                {isPastEvent && (
                                    <div className="absolute top-4 right-4">
                                        <Badge className="bg-gray-500 text-white">
                                            Past Event
                                        </Badge>
                                    </div>
                                )}
                            </div>
                            <div className="p-6">
                                <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div className="flex items-center text-gray-600">
                                        <Calendar className="h-5 w-5 mr-3 text-[#6CDAEC]" />
                                        <div>
                                            <div className="font-medium">Date</div>
                                            <div>{eventDate.toLocaleDateString('en-US', { 
                                                weekday: 'long',
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric' 
                                            })}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <Clock className="h-5 w-5 mr-3 text-[#6CDAEC]" />
                                        <div>
                                            <div className="font-medium">Time</div>
                                            <div>{event.time}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <MapPin className="h-5 w-5 mr-3 text-[#6CDAEC]" />
                                        <div>
                                            <div className="font-medium">Location</div>
                                            <div>{event.location || 'Location TBD'}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <DollarSign className="h-5 w-5 mr-3 text-[#6CDAEC]" />
                                        <div>
                                            <div className="font-medium">Price</div>
                                            <div>{event.price === 0 ? 'Free' : `$${event.price}`}</div>
                                        </div>
                                    </div>
                                </div>

                                {event.description && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">About This Event</h3>
                                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{event.description}</p>
                                    </div>
                                )}

                                {event.created_at && (
                                    <div className="text-sm text-gray-500">
                                        Event created on {new Date(event.created_at).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        </Card>
                    </motion.div>

                    {/* Booking Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Card className="p-6 border border-gray-200 shadow-sm sticky top-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Details</h2>
                            
                            <div className="space-y-4 mb-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Price per ticket:</span>
                                    <span className="font-semibold text-lg">
                                        {event.price === 0 ? 'Free' : `$${event.price}`}
                                    </span>
                                </div>
                                
                                {isBooked && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center mb-2">
                                            <CalendarDays className="h-5 w-5 text-green-600 mr-2" />
                                            <span className="font-medium text-green-800">You're Booked!</span>
                                        </div>
                                        <p className="text-green-700 text-sm">
                                            You have {userBookings.filter(b => b.status === 'CONFIRMED').length} confirmed ticket(s) for this event
                                        </p>
                                    </div>
                                )}

                                {userBookings.some(b => b.status === 'CANCELLED') && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <div className="flex items-center mb-2">
                                            <CalendarDays className="h-5 w-5 text-red-600 mr-2" />
                                            <span className="font-medium text-red-800">Booking Cancelled</span>
                                        </div>
                                        <p className="text-red-700 text-sm">
                                            You previously had {userBookings.filter(b => b.status === 'CANCELLED').length} cancelled ticket(s) for this event
                                        </p>
                                    </div>
                                )}

                                {isPastEvent && (
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center mb-2">
                                            <CalendarDays className="h-5 w-5 text-gray-600 mr-2" />
                                            <span className="font-medium text-gray-800">Past Event</span>
                                        </div>
                                        <p className="text-gray-700 text-sm">
                                            This event has already taken place
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                {!isPastEvent && !isBooked && (
                                    <Link href={`/customer/book-event/${event.id}`} className="w-full">
                                        <Button className="w-full bg-[#6CDAEC] hover:bg-[#5BC8D9]">
                                            Book Tickets
                                        </Button>
                                    </Link>
                                )}

                                {isBooked && (
                                    <Link href="/customer/bookings" className="w-full">
                                        <Button variant="outline" className="w-full">
                                            View My Bookings
                                        </Button>
                                    </Link>
                                )}

                                {userBookings.some(b => b.status === 'CANCELLED') && !isBooked && (
                                    <Link href={`/customer/book-event/${event.id}`} className="w-full">
                                        <Button className="w-full bg-[#6CDAEC] hover:bg-[#5BC8D9]">
                                            Rebook Tickets
                                        </Button>
                                    </Link>
                                )}

                                <Link href="/events" className="w-full">
                                    <Button variant="outline" className="w-full">
                                        Browse More Events
                                    </Button>
                                </Link>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <h3 className="text-sm font-medium text-gray-900 mb-2">Event Information</h3>
                                <div className="text-xs text-gray-500 space-y-1">
                                    <p>• Please arrive 15 minutes before the event starts</p>
                                    <p>• Bring your booking confirmation</p>
                                    <p>• Contact us if you have any questions</p>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </div>

                {/* Reviews Section */}
                <motion.div
                    className="mt-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <ReviewSystem 
                        eventId={event.id} 
                        eventTitle={event.title} 
                        eventDate={event.date}
                        userBookings={userBookings}
                    />
                </motion.div>
            </main>
            
            <Footer />
        </div>
    )
}
