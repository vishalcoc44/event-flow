'use client'

import { useBookings } from '@/contexts/BookingContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { ChevronDown, ChevronUp, Calendar, Clock, MapPin, User, DollarSign, CalendarDays } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/use-toast'
import { GlassTile } from '@/components/ui/glass-tile'
import { cn } from '@/lib/utils'

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
                return 'bg-green-500/10 text-green-700 border-green-200'
            case 'PENDING':
                return 'bg-yellow-500/10 text-yellow-700 border-yellow-200'
            case 'CANCELLED':
                return 'bg-red-500/10 text-red-700 border-red-200'
            default:
                return 'bg-gray-500/10 text-gray-700 border-gray-200'
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans relative overflow-hidden">
            {/* Mesh Gradient Background Elements */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
                <div className="absolute bottom-[20%] right-[-10%] w-[30%] h-[30%] rounded-full bg-purple-500/10 blur-[100px]" />
                <div className="absolute top-[40%] right-[10%] w-[20%] h-[20%] rounded-full bg-amber-500/5 blur-[80px]" />
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />

                <main className="flex-grow py-12">
                    <div className="container mx-auto px-4 max-w-7xl">
                        <div className="mb-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100 mb-2">
                                <CalendarDays className="w-3 h-3" />
                                BOOKING MANAGEMENT
                            </div>
                            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">All Bookings</h1>
                            <p className="text-slate-500 max-w-lg mt-2 text-lg">
                                Manage customer bookings across all your scheduled events.
                            </p>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-24 space-y-4">
                                <motion.div
                                    className="w-12 h-12 border-4 border-t-[#6CDAEC] border-blue-100 rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />
                                <p className="text-gray-500 animate-pulse">Loading bookings...</p>
                            </div>
                        ) : error ? (
                            <GlassTile className="border-red-200 bg-red-50/50 text-red-800" interactive={false}>
                                <p>Error loading bookings: {error}</p>
                            </GlassTile>
                        ) : bookings.length === 0 ? (
                            <GlassTile className="py-20 flex flex-col items-center justify-center text-center opacity-80" interactive={false}>
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                    <Calendar className="w-10 h-10 text-gray-300" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings found</h3>
                                <p className="text-gray-500 max-w-sm mx-auto">
                                    There are no bookings in the system yet.
                                </p>
                            </GlassTile>
                        ) : eventGroups.length === 0 ? (
                            <GlassTile className="py-20 flex flex-col items-center justify-center text-center opacity-80" interactive={false}>
                                <h3 className="text-xl font-medium text-gray-600 mb-4">No events with bookings</h3>
                                <p className="text-gray-500">There are no events with bookings in the system yet.</p>
                            </GlassTile>
                        ) : (
                            <Tabs defaultValue={eventGroups[0]?.eventId} className="w-full space-y-8">
                                <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                                    <TabsList className="inline-flex h-auto items-center justify-start rounded-full bg-white/70 backdrop-blur-md p-1.5 shadow-sm border border-slate-200/50">
                                        {eventGroups.map((eventGroup) => (
                                            <TabsTrigger
                                                key={eventGroup.eventId}
                                                value={eventGroup.eventId}
                                                className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md hover:bg-white/50"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="truncate max-w-32 lg:max-w-48" title={eventGroup.eventTitle}>
                                                        {eventGroup.eventTitle}
                                                    </span>
                                                    <span className="inline-flex items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 min-w-[1.5rem]">
                                                        {eventGroup.bookings.length}
                                                    </span>
                                                </div>
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                </div>

                                {eventGroups.map((eventGroup) => (
                                    <TabsContent key={eventGroup.eventId} value={eventGroup.eventId} className="mt-0 focus-visible:outline-none">
                                        <div className="mb-6 p-5 bg-white/60 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div>
                                                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{eventGroup.eventTitle}</h2>
                                                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                                                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {eventGroup.event?.date ? new Date(eventGroup.event.date).toLocaleDateString() : 'Date N/A'}</span>
                                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {eventGroup.event?.location || 'Location N/A'}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-4 bg-white/50 px-4 py-2 rounded-xl">
                                                    <div className="text-sm">
                                                        <span className="text-gray-500 font-medium">Total:</span>
                                                        <span className="ml-2 font-bold text-gray-900">{eventGroup.bookings.length}</span>
                                                    </div>
                                                    <div className="w-px h-4 bg-gray-200"></div>
                                                    <div className="text-sm">
                                                        <span className="text-gray-500 font-medium">Price:</span>
                                                        <span className="ml-2 font-bold text-green-600">${eventGroup.event?.price || '0'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <motion.div
                                                className="space-y-4"
                                                initial="hidden"
                                                animate="visible"
                                                variants={containerVariants}
                                            >
                                                <AnimatePresence>
                                                    {eventGroup.bookings.map((booking) => (
                                                        <motion.div key={booking.id} variants={bookingVariants} layout>
                                                            <GlassTile
                                                                className="p-0 overflow-hidden"
                                                                interactive={true}
                                                                hoverScale={1.01}
                                                            >
                                                                <div
                                                                    className="flex flex-col sm:flex-row justify-between sm:items-center p-5 cursor-pointer hover:bg-black/[0.02] transition-colors"
                                                                    onClick={() => toggleBooking(booking.id)}
                                                                >
                                                                    <div className="flex items-center gap-4 mb-3 sm:mb-0">
                                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-blue-600 font-bold text-lg border border-white shadow-sm">
                                                                            {booking.user?.first_name?.[0] || booking.user?.email?.[0] || 'U'}
                                                                        </div>
                                                                        <div>
                                                                            <h3 className="text-base font-bold text-gray-900">
                                                                                {booking.user?.first_name} {booking.user?.last_name || booking.user?.username || booking.user?.email}
                                                                            </h3>
                                                                            <Badge variant="outline" className={cn("mt-1 text-xs font-medium", getStatusColor(booking.status))}>
                                                                                {booking.status}
                                                                            </Badge>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                                                                        <div className="text-sm text-right">
                                                                            <div className="text-gray-900 font-medium">${booking.event?.price}</div>
                                                                            <div className="text-xs text-gray-500">{new Date(booking.created_at).toLocaleDateString()}</div>
                                                                        </div>
                                                                        {expandedBookings.includes(booking.id) ? (
                                                                            <ChevronUp className="text-gray-400 h-5 w-5" />
                                                                        ) : (
                                                                            <ChevronDown className="text-gray-400 h-5 w-5" />
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <AnimatePresence>
                                                                    {expandedBookings.includes(booking.id) && (
                                                                        <motion.div
                                                                            variants={expandVariants}
                                                                            initial="hidden"
                                                                            animate="visible"
                                                                            exit="hidden"
                                                                        >
                                                                            <div className="px-5 pb-5 pt-2 border-t border-gray-100/50 bg-gray-50/30">
                                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
                                                                                    <div className="space-y-3">
                                                                                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer Details</h4>
                                                                                        <div className="space-y-2">
                                                                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                                                <User className="w-4 h-4 text-gray-400" />
                                                                                                <span>{booking.user?.first_name} {booking.user?.last_name}</span>
                                                                                            </div>
                                                                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                                                <span className="w-4 h-4 flex items-center justify-center text-[10px] font-bold text-gray-400">@</span>
                                                                                                <span>{booking.user?.username || 'N/A'}</span>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>

                                                                                    <div className="space-y-3">
                                                                                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Event Details</h4>
                                                                                        <div className="space-y-2">
                                                                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                                                                <span>{booking.event?.date ? new Date(booking.event.date).toLocaleDateString() : 'N/A'}</span>
                                                                                            </div>
                                                                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                                                <Clock className="w-4 h-4 text-gray-400" />
                                                                                                <span>{booking.event?.time || 'N/A'}</span>
                                                                                            </div>
                                                                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                                                                <span>{booking.event?.location || 'N/A'}</span>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>

                                                                                    <div className="space-y-3">
                                                                                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Booking Info</h4>
                                                                                        <div className="space-y-2">
                                                                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                                                <CalendarDays className="w-4 h-4 text-gray-400" />
                                                                                                <span>{booking.booking_date ? new Date(booking.booking_date).toLocaleDateString() : new Date(booking.created_at).toLocaleDateString()}</span>
                                                                                            </div>
                                                                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                                                <DollarSign className="w-4 h-4 text-gray-400" />
                                                                                                <span>${booking.event?.price} Paid</span>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>

                                                                                {booking.status !== 'CANCELLED' && (
                                                                                    <div className="flex justify-end pt-4 border-t border-gray-200/50">
                                                                                        <Button
                                                                                            variant="destructive"
                                                                                            size="sm"
                                                                                            onClick={() => handleCancelBooking(booking.id)}
                                                                                            disabled={cancellingId === booking.id}
                                                                                            className="text-xs"
                                                                                        >
                                                                                            {cancellingId === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                                                                                        </Button>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
                                                            </GlassTile>
                                                        </motion.div>
                                                    ))}
                                                </AnimatePresence>
                                            </motion.div>
                                        </div>
                                    </TabsContent>
                                ))}
                            </Tabs>
                        )}
                    </div>
                </main>

                <Footer />
            </div>
        </div>
    )
}
