'use client'

import { useBookings } from '@/contexts/BookingContext'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { ChevronDown, ChevronUp, Calendar, Clock, MapPin, User, DollarSign } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/use-toast'

export default function AllBookings() {
    const { bookings, loading, error, cancelBooking } = useBookings()
    const { user } = useAuth()
    const { toast } = useToast()
    const [expandedBookings, setExpandedBookings] = useState<string[]>([])
    const [cancellingId, setCancellingId] = useState<string | null>(null)

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
                ) : (
                    <motion.div
                        className="space-y-4"
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                    >
                        <AnimatePresence>
                            {bookings.map((booking) => (
                                <motion.div key={booking.id} variants={bookingVariants} layout>
                                    <Card className="overflow-hidden border border-gray-200 shadow-sm">
                                        <CardHeader 
                                            className="bg-white border-b cursor-pointer"
                                            onClick={() => toggleBooking(booking.id)}
                                        >
                                            <div className="flex justify-between items-center">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                                    <CardTitle className="text-lg font-semibold text-gray-900">
                                                        {booking.event?.title || 'Unknown Event'}
                                                    </CardTitle>
                                                    <Badge className={getStatusColor(booking.status)}>
                                                        {booking.status}
                                                    </Badge>
                                                </div>
                                                {expandedBookings.includes(booking.id) ? (
                                                    <ChevronUp className="text-gray-500 h-5 w-5" />
                                                ) : (
                                                    <ChevronDown className="text-gray-500 h-5 w-5" />
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
                                                    <CardContent className="pt-4 pb-2">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-3">
                                                                <div className="flex items-center gap-2">
                                                                    <User className="h-4 w-4 text-gray-500" />
                                                                    <div>
                                                                        <span className="font-medium">Customer:</span>{' '}
                                                                        {booking.user?.first_name} {booking.user?.last_name || booking.user?.username || booking.user?.email}
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <Calendar className="h-4 w-4 text-gray-500" />
                                                                    <div>
                                                                        <span className="font-medium">Event Date:</span>{' '}
                                                                        {booking.event?.date ? new Date(booking.event.date).toLocaleDateString() : 'N/A'}
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <Clock className="h-4 w-4 text-gray-500" />
                                                                    <div>
                                                                        <span className="font-medium">Event Time:</span>{' '}
                                                                        {booking.event?.time || 'N/A'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-3">
                                                                <div className="flex items-center gap-2">
                                                                    <MapPin className="h-4 w-4 text-gray-500" />
                                                                    <div>
                                                                        <span className="font-medium">Location:</span>{' '}
                                                                        {booking.event?.location || 'N/A'}
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <DollarSign className="h-4 w-4 text-gray-500" />
                                                                    <div>
                                                                        <span className="font-medium">Price:</span>{' '}
                                                                        ${booking.event?.price || 'N/A'}
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <Calendar className="h-4 w-4 text-gray-500" />
                                                                    <div>
                                                                        <span className="font-medium">Booking Date:</span>{' '}
                                                                        {booking.booking_date ? new Date(booking.booking_date).toLocaleDateString() : 
                                                                        booking.created_at ? new Date(booking.created_at).toLocaleDateString() : 'N/A'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                    <CardFooter className="border-t bg-gray-50 py-3">
                                                        <div className="flex justify-end w-full">
                                                            {booking.status !== 'CANCELLED' && (
                                                                <Button 
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={() => handleCancelBooking(booking.id)}
                                                                    disabled={cancellingId === booking.id}
                                                                >
                                                                    {cancellingId === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </CardFooter>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </main>
            
            <Footer />
        </div>
    )
}
