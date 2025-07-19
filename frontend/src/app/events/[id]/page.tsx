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

export default function EventDetails() {
    const params = useParams()
    const router = useRouter()
    const { user } = useAuth()
    const { events, loading: eventsLoading } = useEvents()
    const { bookings } = useBookings()
    
    const [event, setEvent] = useState<Event | null>(null)
    const [isBooked, setIsBooked] = useState(false)
    const [userBookings, setUserBookings] = useState<any[]>([])

    useEffect(() => {
        if (params.id && events) {
            const foundEvent = events.find(e => e.id === params.id)
            if (foundEvent) {
                setEvent(foundEvent)
            }
        }
    }, [params.id, events])

    useEffect(() => {
        if (user && bookings && event) {
            const userEventBookings = bookings.filter(booking => 
                booking.user_id === user.id && booking.event?.id === event.id
            )
            setUserBookings(userEventBookings)
            setIsBooked(userEventBookings.length > 0)
        }
    }, [user, bookings, event])

    if (eventsLoading) {
        return (
            <div className="min-h-screen flex flex-col bg-white">
                <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />
                <main className="flex-grow container mx-auto px-4 py-8">
                    <div className="flex justify-center items-center h-64">
                        <motion.div
                            className="w-12 h-12 border-4 border-t-[#6CDAEC] rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    if (!event) {
        return (
            <div className="min-h-screen flex flex-col bg-white">
                <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />
                <main className="flex-grow container mx-auto px-4 py-8">
                    <div className="text-center py-12">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
                        <p className="text-gray-600 mb-6">The event you're looking for doesn't exist or has been removed.</p>
                        <Link href="/events">
                            <Button>Back to Events</Button>
                        </Link>
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
            <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />
            
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
                                    src={event.image_url || 'https://via.placeholder.com/800x400?text=Event'} 
                                    alt={event.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = 'https://via.placeholder.com/800x400?text=Event';
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
                                            You have {userBookings.length} ticket(s) for this event
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
            </main>
            
            <Footer />
        </div>
    )
} 