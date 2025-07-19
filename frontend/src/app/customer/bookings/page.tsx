'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useBookings } from '@/contexts/BookingContext'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useToast } from '@/components/ui/use-toast'
import { Calendar, Clock, MapPin, DollarSign, Search, Filter } from 'lucide-react'

export default function CustomerBookings() {
    const { user } = useAuth()
    const { bookings, loading, error, cancelBooking } = useBookings()
    const { toast } = useToast()
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [cancellingId, setCancellingId] = useState<string | null>(null)
    const [userBookings, setUserBookings] = useState<any[]>([])

    useEffect(() => {
        if (user && bookings) {
            const currentUserBookings = bookings.filter(booking => booking.user_id === user.id)
            setUserBookings(currentUserBookings)
        }
    }, [user, bookings])

    // Group bookings by event and calculate quantities
    const groupedBookings = userBookings.reduce((groups: any[], booking) => {
        const eventId = booking.event?.id
        if (!eventId) return groups

        const existingGroup = groups.find(group => group.eventId === eventId)
        if (existingGroup) {
            existingGroup.bookings.push(booking)
            existingGroup.quantity += 1
            existingGroup.totalPrice += booking.event?.price || 0
            } else {
            groups.push({
                eventId,
                event: booking.event,
                bookings: [booking],
                quantity: 1,
                totalPrice: booking.event?.price || 0,
                status: booking.status,
                firstBookingId: booking.id
            })
        }
        return groups
    }, [])

    const filteredBookings = groupedBookings.filter(group => {
        const matchesSearch = group.event?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             group.event?.location?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === 'all' || group.status.toLowerCase() === statusFilter.toLowerCase()
        return matchesSearch && matchesStatus
    })

    const handleCancelBooking = async (bookingGroup: any) => {
        try {
            setCancellingId(bookingGroup.firstBookingId)
            
            // Cancel all bookings in the group
            const cancelPromises = bookingGroup.bookings.map((booking: any) => 
                cancelBooking(booking.id)
            )
            
            await Promise.all(cancelPromises)
            
            toast({
                title: "Bookings Cancelled",
                description: `Successfully cancelled ${bookingGroup.quantity} ticket(s) for ${bookingGroup.event?.title}`,
            })
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to cancel bookings",
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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
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

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />
            
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
                    <p className="text-gray-600">Manage and view all your event bookings</p>
                </div>

                {/* Search and Filter */}
                <div className="mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search bookings by event title or location..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#6CDAEC] focus:border-transparent"
                            >
                                <option value="all">All Status</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="pending">Pending</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
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
                ) : filteredBookings.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <Calendar className="h-12 w-12 mx-auto" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-600 mb-4">No bookings found</h3>
                        <p className="text-gray-500 mb-6">
                            {searchTerm || statusFilter !== 'all' 
                                ? "We couldn't find any bookings matching your criteria." 
                                : "You haven't made any bookings yet."}
                        </p>
                        {(searchTerm || statusFilter !== 'all') ? (
                            <Button onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}>
                                Clear Filters
                            </Button>
                        ) : (
                            <Button asChild>
                                <a href="/events">Browse Events</a>
                            </Button>
                        )}
                </div>
            ) : (
                    <motion.div 
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                    >
                        <AnimatePresence>
                            {filteredBookings.map((bookingGroup) => (
                                <motion.div key={bookingGroup.eventId} variants={itemVariants} layout>
                                    <Card className="overflow-hidden border border-gray-200 shadow-sm">
                                        <div className="relative h-48">
                                            <img 
                                                src={bookingGroup.event?.image_url || 'https://via.placeholder.com/400x200?text=Event'} 
                                                alt={bookingGroup.event?.title}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Event';
                                                }}
                                            />
                                            <div className="absolute top-2 right-2">
                                                <Badge className={getStatusColor(bookingGroup.status)}>
                                                    {bookingGroup.status}
                                                </Badge>
                                            </div>
                                            {bookingGroup.quantity > 1 && (
                                                <div className="absolute top-2 left-2">
                                                    <Badge className="bg-[#6CDAEC] text-white">
                                                        {bookingGroup.quantity} Tickets
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg font-semibold text-gray-900">
                                                {bookingGroup.event?.title || 'Unknown Event'}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-0 pb-4">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-gray-500" />
                                                    <div>
                                                        <span className="font-medium">Event Date:</span>{' '}
                                                        {bookingGroup.event?.date ? new Date(bookingGroup.event.date).toLocaleDateString() : 'N/A'}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-gray-500" />
                                                    <div>
                                                        <span className="font-medium">Event Time:</span>{' '}
                                                        {bookingGroup.event?.time || 'N/A'}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-gray-500" />
                                                    <div>
                                                        <span className="font-medium">Location:</span>{' '}
                                                        {bookingGroup.event?.location || 'N/A'}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <DollarSign className="h-4 w-4 text-gray-500" />
                                                    <div>
                                                        <span className="font-medium">Total Price:</span>{' '}
                                                        ${bookingGroup.totalPrice.toFixed(2)}
                                                    </div>
                                                </div>
                                                {bookingGroup.quantity > 1 && (
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-4 w-4 text-gray-500 flex items-center justify-center">
                                                            <span className="text-xs">×</span>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Quantity:</span>{' '}
                                                            {bookingGroup.quantity} ticket(s) @ ${bookingGroup.event?.price} each
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                        <CardFooter className="border-t bg-gray-50 py-3">
                                            <div className="flex justify-between w-full">
                                                <Link href={`/events/${bookingGroup.eventId}`}>
                                                    <Button variant="outline" size="sm">
                                                        Event Details
                                                    </Button>
                                                </Link>
                                                {bookingGroup.status !== 'CANCELLED' && (
                                                    <Button 
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleCancelBooking(bookingGroup)}
                                                        disabled={cancellingId === bookingGroup.firstBookingId}
                                                    >
                                                        {cancellingId === bookingGroup.firstBookingId ? 'Cancelling...' : `Cancel ${bookingGroup.quantity > 1 ? 'All Tickets' : 'Booking'}`}
                                                    </Button>
                                                )}
                                            </div>
                                        </CardFooter>
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