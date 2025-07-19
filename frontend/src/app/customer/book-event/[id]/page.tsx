'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { useEvents } from '@/contexts/EventContext'
import { useBookings } from '@/contexts/BookingContext'
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, DollarSign, Users, ArrowLeft, Plus, Minus, CheckCircle } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

type Event = {
    id: string
    title: string
    description: string
    date: string
    time: string
    location: string
    price: number
    image_url?: string
    category?: {
        name: string
    }
}

export default function BookEvent() {
    const params = useParams()
    const router = useRouter()
    const { user } = useAuth()
    const { events, loading: eventsLoading } = useEvents()
    const { addBooking } = useBookings()
    
    const [event, setEvent] = useState<Event | null>(null)
    const [ticketCount, setTicketCount] = useState(1)
    const [loading, setLoading] = useState(false)
    const [bookingSuccess, setBookingSuccess] = useState(false)

    useEffect(() => {
        if (params.id && events) {
            const foundEvent = events.find(e => e.id === params.id)
            if (foundEvent) {
                setEvent(foundEvent)
            }
        }
    }, [params.id, events])

    const handleTicketChange = (increment: boolean) => {
        if (increment) {
            setTicketCount(prev => Math.min(prev + 1, 10)) // Max 10 tickets
        } else {
            setTicketCount(prev => Math.max(prev - 1, 1)) // Min 1 ticket
        }
    }

    const totalPrice = event ? event.price * ticketCount : 0

    const handleBooking = async () => {
        if (!user || !event) return

        setLoading(true)
        try {
            // Create multiple bookings for the number of tickets
            for (let i = 0; i < ticketCount; i++) {
                await addBooking(event.id)
            }
            
            setBookingSuccess(true)
            toast({
                title: "Booking Successful!",
                description: `You've successfully booked ${ticketCount} ticket(s) for ${event.title}`,
            })
            
            // Redirect to bookings page after 2 seconds
            setTimeout(() => {
                router.push('/customer/bookings')
            }, 2000)
        } catch (error) {
            console.error('Booking error:', error)
            toast({
                title: "Booking Failed",
                description: "There was an error processing your booking. Please try again.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

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
                        <Link href="/customer/dashboard">
                            <Button>Back to Dashboard</Button>
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    if (bookingSuccess) {
        return (
            <div className="min-h-screen flex flex-col bg-white">
                <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />
                <main className="flex-grow container mx-auto px-4 py-8">
                    <div className="text-center py-12">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                        </motion.div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking Successful!</h1>
                        <p className="text-gray-600 mb-6">
                            You've successfully booked {ticketCount} ticket(s) for {event.title}
                        </p>
                        <p className="text-sm text-gray-500">Redirecting to your bookings...</p>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />
            
            <main className="flex-grow container mx-auto px-4 py-8">
                {/* Back Button */}
                <div className="mb-6">
                    <Link href="/customer/dashboard">
                        <Button variant="outline" size="sm" className="flex items-center">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Event Details */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card className="overflow-hidden border border-gray-200 shadow-sm">
                            <div className="relative h-64">
                                <img 
                                    src={event.image_url || 'https://via.placeholder.com/600x300?text=Event'} 
                                    alt={event.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = 'https://via.placeholder.com/600x300?text=Event';
                                    }}
                                />
                                {event.category && (
                                    <div className="absolute top-4 left-4">
                                        <Badge className="bg-[#6CDAEC] text-white">
                                            {event.category.name}
                                        </Badge>
                                    </div>
                                )}
                            </div>
                            <div className="p-6">
                                <h1 className="text-2xl font-bold text-gray-900 mb-4">{event.title}</h1>
                                
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center text-gray-600">
                                        <Calendar className="h-5 w-5 mr-3 text-[#6CDAEC]" />
                                        <span>{new Date(event.date).toLocaleDateString('en-US', { 
                                            weekday: 'long',
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <Clock className="h-5 w-5 mr-3 text-[#6CDAEC]" />
                                        <span>{event.time}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <MapPin className="h-5 w-5 mr-3 text-[#6CDAEC]" />
                                        <span>{event.location}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <DollarSign className="h-5 w-5 mr-3 text-[#6CDAEC]" />
                                        <span>${event.price} per ticket</span>
                                    </div>
                                </div>

                                {event.description && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">About This Event</h3>
                                        <p className="text-gray-600 leading-relaxed">{event.description}</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </motion.div>

                    {/* Booking Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Card className="p-6 border border-gray-200 shadow-sm">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Book Your Tickets</h2>
                            
                            {/* Ticket Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Number of Tickets
                                </label>
                                <div className="flex items-center space-x-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleTicketChange(false)}
                                        disabled={ticketCount <= 1}
                                        className="w-10 h-10 p-0"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <div className="flex items-center space-x-2">
                                        <Users className="h-5 w-5 text-[#6CDAEC]" />
                                        <span className="text-lg font-semibold text-gray-900">{ticketCount}</span>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleTicketChange(true)}
                                        disabled={ticketCount >= 10}
                                        className="w-10 h-10 p-0"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Maximum 10 tickets per booking</p>
                            </div>

                            {/* Price Breakdown */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-700 mb-3">Price Breakdown</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Price per ticket:</span>
                                        <span>${event.price}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Number of tickets:</span>
                                        <span>{ticketCount}</span>
                                    </div>
                                    <div className="border-t pt-2 flex justify-between font-semibold">
                                        <span>Total:</span>
                                        <span className="text-lg text-[#6CDAEC]">${totalPrice}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Booking Button */}
                            <Button
                                onClick={handleBooking}
                                disabled={loading}
                                className="w-full bg-[#6CDAEC] hover:bg-[#5BC8D9] text-white py-3"
                            >
                                {loading ? (
                                    <motion.div
                                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                ) : (
                                    `Book ${ticketCount} Ticket${ticketCount > 1 ? 's' : ''} - $${totalPrice}`
                                )}
                            </Button>

                            <p className="text-xs text-gray-500 mt-3 text-center">
                                By booking, you agree to our terms and conditions
                            </p>
                        </Card>
                    </motion.div>
                </div>
            </main>
            
            <Footer />
        </div>
    )
} 