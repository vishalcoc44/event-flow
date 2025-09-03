'use client'

import { useBookings } from '@/contexts/BookingContext'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { ChevronDown, ChevronUp, Calendar, Clock, MapPin, User, DollarSign } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/use-toast'
import { HoverShadowEffect } from '@/components/ui/hover-shadow-effect'

export default function AllBookings() {
    const { bookings, loading, error, cancelBooking } = useBookings()
    const { user } = useAuth()
    const { toast } = useToast()
    const [expandedBookings, setExpandedBookings] = useState<string[]>([])
    const [cancellingId, setCancellingId] = useState<string | null>(null)

    // Group bookings by event
    const bookingsByEvent = bookings.reduce((acc, booking) => {
        const eventId = booking.event?.id || 'unknown'
        const eventTitle = booking.event?.title || 'Unknown Event'

        if (!acc[eventId]) {
            acc[eventId] = {
                eventId,
                eventTitle,
                event: booking.event,
                bookings: []
            }
        }

        acc[eventId].bookings.push(booking)
        return acc
    }, {} as Record<string, { eventId: string; eventTitle: string; event: any; bookings: any[] }>)

    const eventGroups = Object.values(bookingsByEvent)

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const bookingVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 20
            }
        }
    }

    const expandVariants = {
        hidden: { height: 0, opacity: 0 },
        visible: { height: "auto", opacity: 1, transition: { duration: 0.3 } }
    }

    // Toggle booking expanded state
    const toggleBooking = (id: string) => {
        setExpandedBookings((prevState) =>
            prevState.includes(id)
                ? prevState.filter((bookingId) => bookingId !== id)
                : [...prevState, id]
        )
    }

    const handleCancelBooking = async (id: string) => {
        try {
            setCancellingId(id)
            const result = await cancelBooking(id)
            if (result) {
                toast({
                    title: "Booking Cancelled",
                    description: "The booking has been successfully cancelled",
                })
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to cancel booking",
                variant: "destructive",
            })
        } finally {
            setCancellingId(null)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case 'CONFIRMED':
                return 'bg-green-100 text-green-800'
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800'
            case 'CANCELLED':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />
            
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">All Bookings</h1>
                    <p className="text-gray-600">Manage customer bookings for all events</p>
                </div>
                
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <motion.div
                            className="w-12 h-12 border-4 border-t-[#6CDAEC] rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                    </div>
                ) : error ? (
                    <div className="bg-red-50 p-4 rounded-md text-red-800">
                        <p>Error loading bookings: {error}</p>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="text-center py-12">
                        <h3 className="text-xl font-medium text-gray-600 mb-4">No bookings found</h3>
                        <p className="text-gray-500">There are no bookings in the system yet.</p>
                    </div>
                ) : eventGroups.length === 0 ? (
                    <div className="text-center py-12">
                        <h3 className="text-xl font-medium text-gray-600 mb-4">No events with bookings</h3>
                        <p className="text-gray-500">There are no events with bookings in the system yet.</p>
                    </div>
                ) : (
                    <Tabs defaultValue={eventGroups[0]?.eventId} className="w-full">
                        <div className="mb-6 overflow-x-auto">
                            <TabsList className="inline-flex h-12 items-center justify-start rounded-lg bg-gray-100 p-1 min-w-full">
                                {eventGroups.map((eventGroup) => (
                                    <TabsTrigger
                                        key={eventGroup.eventId}
                                        value={eventGroup.eventId}
                                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm min-w-0 flex-shrink-0"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="truncate max-w-32 lg:max-w-48 xl:max-w-64" title={eventGroup.eventTitle}>
                                                {eventGroup.eventTitle}
                                            </span>
                                            <span className="inline-flex items-center justify-center rounded-full bg-gray-200 text-gray-600 text-xs font-medium px-2 py-0.5 min-w-[1.5rem] h-5">
                                                {eventGroup.bookings.length}
                                            </span>
                                        </div>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>

                        {eventGroups.map((eventGroup) => (
                            <TabsContent key={eventGroup.eventId} value={eventGroup.eventId} className="mt-0">
                                <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-900">{eventGroup.eventTitle}</h2>
                                            <p className="text-sm text-gray-600">
                                                {eventGroup.event?.date ? new Date(eventGroup.event.date).toLocaleDateString() : 'Date N/A'} •
                                                {eventGroup.event?.location || 'Location N/A'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-sm text-gray-600">
                                                <span className="font-medium">Total Bookings:</span> {eventGroup.bookings.length}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                <span className="font-medium">Price:</span> ${eventGroup.event?.price || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="max-w-4xl">
                                    <motion.div
                                        className="space-y-3"
                                        initial="hidden"
                                        animate="visible"
                                        variants={containerVariants}
                                    >
                                    <AnimatePresence>
                                        {eventGroup.bookings.map((booking) => (
                                            <motion.div key={booking.id} variants={bookingVariants} layout>
                                                <HoverShadowEffect className="cursor-pointer" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.15} hoverScale={1.02} hoverLift={-1} transitionDuration={150}>
                                                    <Card className="overflow-hidden border border-gray-200 shadow-sm rounded-xl">
                                                    <CardHeader
                                                        className="bg-white border-b cursor-pointer py-3 px-4"
                                                        onClick={() => toggleBooking(booking.id)}
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                                <div className="min-w-0 flex-1">
                                                                    <CardTitle className="text-base font-semibold text-gray-900 truncate">
                                                                        {booking.user?.first_name} {booking.user?.last_name || booking.user?.username || booking.user?.email}
                                                                    </CardTitle>
                                                                </div>
                                                                <Badge className={`${getStatusColor(booking.status)} text-xs px-2 py-0.5 flex-shrink-0`}>
                                                                    {booking.status}
                                                                </Badge>
                                                            </div>
                                                            {expandedBookings.includes(booking.id) ? (
                                                                <ChevronUp className="text-gray-500 h-4 w-4 flex-shrink-0 ml-2" />
                                                            ) : (
                                                                <ChevronDown className="text-gray-500 h-4 w-4 flex-shrink-0 ml-2" />
                                                            )}
                                                        </div>
                                                    </CardHeader>
                                                    <AnimatePresence>
                                                        {expandedBookings.includes(booking.id) && (
                                                            <motion.div
                                                                variants={expandVariants}
                                                                initial="hidden"
                                                                animate="visible"
                                                                exit="hidden"
                                                            >
                                                                <CardContent className="py-3 px-4 rounded-b-xl">
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                                        <div className="space-y-2">
                                                                            <div className="flex items-center gap-2">
                                                                                <User className="h-3 w-3 text-gray-500 flex-shrink-0" />
                                                                                <div className="min-w-0">
                                                                                    <span className="font-medium text-sm">Customer:</span>{' '}
                                                                                    <span className="text-sm text-gray-700 truncate">
                                                                                        {booking.user?.first_name} {booking.user?.last_name || booking.user?.username || booking.user?.email}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                <Calendar className="h-3 w-3 text-gray-500 flex-shrink-0" />
                                                                                <div>
                                                                                    <span className="font-medium text-sm">Event Date:</span>{' '}
                                                                                    <span className="text-sm text-gray-700">
                                                                                        {booking.event?.date ? new Date(booking.event.date).toLocaleDateString() : 'N/A'}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                <Clock className="h-3 w-3 text-gray-500 flex-shrink-0" />
                                                                                <div>
                                                                                    <span className="font-medium text-sm">Event Time:</span>{' '}
                                                                                    <span className="text-sm text-gray-700">{booking.event?.time || 'N/A'}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <div className="flex items-center gap-2">
                                                                                <MapPin className="h-3 w-3 text-gray-500 flex-shrink-0" />
                                                                                <div className="min-w-0">
                                                                                    <span className="font-medium text-sm">Location:</span>{' '}
                                                                                    <span className="text-sm text-gray-700 truncate">{booking.event?.location || 'N/A'}</span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                <DollarSign className="h-3 w-3 text-gray-500 flex-shrink-0" />
                                                                                <div>
                                                                                    <span className="font-medium text-sm">Price:</span>{' '}
                                                                                    <span className="text-sm text-gray-700">${booking.event?.price || 'N/A'}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <div className="flex items-center gap-2">
                                                                                <Calendar className="h-3 w-3 text-gray-500 flex-shrink-0" />
                                                                                <div>
                                                                                    <span className="font-medium text-sm">Booking Date:</span>{' '}
                                                                                    <span className="text-sm text-gray-700">
                                                                                        {booking.booking_date ? new Date(booking.booking_date).toLocaleDateString() : 'N/A'}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                <Clock className="h-3 w-3 text-gray-500 flex-shrink-0" />
                                                                                <div>
                                                                                    <span className="font-medium text-sm">Booking Time:</span>{' '}
                                                                                    <span className="text-sm text-gray-700">
                                                                                        {booking.booking_date ? new Date(booking.booking_date).toLocaleTimeString() :
                                                                                        booking.created_at ? new Date(booking.created_at).toLocaleTimeString() : 'N/A'}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </CardContent>
                                                                <CardFooter className="border-t bg-gray-50 py-2 px-4 rounded-b-xl">
                                                                    <div className="flex justify-end w-full">
                                                                        {booking.status !== 'CANCELLED' && (
                                                                            <HoverShadowEffect className="cursor-pointer" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.15} hoverScale={1.02} hoverLift={-1} transitionDuration={150}>
                                                                                <Button
                                                                                    variant="destructive"
                                                                                    size="sm"
                                                                                    onClick={() => handleCancelBooking(booking.id)}
                                                                                    disabled={cancellingId === booking.id}
                                                                                    className="text-xs px-3 py-1 h-7"
                                                                                >
                                                                                    {cancellingId === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                                                                                </Button>
                                                                            </HoverShadowEffect>
                                                                        )}
                                                                    </div>
                                                                </CardFooter>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </Card>
                                                </HoverShadowEffect>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                    </motion.div>
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                )}
            </main>
            
            <Footer />
        </div>
    )
}
