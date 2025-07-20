'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/AuthContext'
import { useBookings } from '@/contexts/BookingContext'
import { useEvents } from '@/contexts/EventContext'
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, User, DollarSign, CheckCircle } from 'lucide-react'
import { HoverShadowEffect } from '@/components/ui/hover-shadow-effect'

type DashboardStats = {
    totalBookings: number
    upcomingEvents: number
    totalSpent: number
    attendedEvents: number
}

type BookingItem = {
    id: string
    event?: {
        id: string
        title: string
        date: string
        time: string
        location: string
        price: number
        image_url?: string
    }
    status: string
    created_at?: string
}

export default function CustomerDashboard() {
    const { user } = useAuth()
    const { bookings, loading: bookingsLoading } = useBookings()
    const { events, loading: eventsLoading } = useEvents()
    const [searchTerm, setSearchTerm] = useState('')
    const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
        totalBookings: 0,
        upcomingEvents: 0,
        totalSpent: 0,
        attendedEvents: 0
    })
    const [userBookings, setUserBookings] = useState<BookingItem[]>([])
    const [recommendedEvents, setRecommendedEvents] = useState<any[]>([])

    useEffect(() => {
        if (user && bookings && events) {
            // Filter bookings for current user
            const currentUserBookings = bookings.filter(booking => booking.user_id === user.id)
            setUserBookings(currentUserBookings)

            // Group bookings by event for stats calculation
            const groupedBookings = currentUserBookings.reduce((groups: any[], booking) => {
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
                        status: booking.status
                    })
                }
                return groups
            }, [])

            // Calculate stats using grouped bookings
            const totalBookings = groupedBookings.length // Count unique events, not individual tickets
            const upcomingEvents = groupedBookings.filter(group => {
                const eventDate = new Date(group.event?.date || '')
                const today = new Date()
                return eventDate > today && group.status !== 'CANCELLED'
            }).length

            const totalSpent = groupedBookings.reduce((sum, group) => {
                return sum + group.totalPrice
            }, 0)

            const attendedEvents = groupedBookings.filter(group => {
                const eventDate = new Date(group.event?.date || '')
                const today = new Date()
                return eventDate < today && group.status === 'CONFIRMED'
            }).length

            setDashboardStats({
                totalBookings,
                upcomingEvents,
                totalSpent,
                attendedEvents
            })

            // Get recommended events (events not booked by user)
            const userBookedEventIds = groupedBookings.map(group => group.eventId)
            const availableEvents = events.filter(event => !userBookedEventIds.includes(event.id))
            setRecommendedEvents(availableEvents.slice(0, 6))
        }
    }, [user, bookings, events])

    // Group bookings for display
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
                status: booking.status
            })
        }
        return groups
    }, [])

    const filteredBookings = groupedBookings.filter(group => 
        group.event?.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        group.event?.location?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getInitials = (firstName?: string, lastName?: string, email?: string) => {
        if (firstName && lastName) {
            return `${firstName[0]}${lastName[0]}`.toUpperCase()
        } else if (firstName) {
            return firstName[0].toUpperCase()
        } else if (email) {
            return email[0].toUpperCase()
        }
        return 'U'
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div className="flex items-center mb-4 md:mb-0">
                        <Avatar className="h-12 w-12 bg-[#6CDAEC] text-white mr-4">
                            <AvatarFallback>
                                {getInitials(user?.first_name, user?.last_name, user?.email)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Welcome, {user?.first_name || user?.username || user?.email?.split('@')[0]}!
                            </h1>
                            <p className="text-sm text-gray-600">{user?.email}</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Link href="/customer/profile">
                            <Button variant="outline" size="sm">
                                <User className="h-4 w-4 mr-2" />
                                Profile
                            </Button>
                        </Link>
                        <Link href="/social">
                            <Button variant="outline" size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Social
                            </Button>
                        </Link>
                        <Link href="/events">
                            <Button size="sm">
                                <Calendar className="h-4 w-4 mr-2" />
                                Book Event
                            </Button>
                        </Link>
                    </div>
                </div>
                
                {/* Stats Cards */}
                <motion.div 
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <HoverShadowEffect className="bg-white border border-gray-200 rounded-2xl p-6 cursor-pointer" shadowColor="rgba(0,0,0,0.15)" shadowIntensity={0.2}>
                            <Card className="p-6 border-0 shadow-none">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-sm font-medium text-gray-500">Total Bookings</h2>
                                <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                                        <Calendar className="h-5 w-5 text-[#6CDAEC]" />
                                    </div>
                            </div>
                            <div className="flex flex-col">
                                    <span className="text-3xl font-bold text-gray-900">
                                        {bookingsLoading ? '...' : dashboardStats.totalBookings}
                                    </span>
                                    <span className="text-xs text-gray-500 mt-1">Total bookings made</span>
                            </div>
                            </Card>
                        </HoverShadowEffect>
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <HoverShadowEffect className="bg-white border border-gray-200 rounded-2xl p-6 cursor-pointer" shadowColor="rgba(0,0,0,0.15)" shadowIntensity={0.2}>
                            <Card className="p-6 border-0 shadow-none">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-sm font-medium text-gray-500">Upcoming Events</h2>
                                    <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                                        <Clock className="h-5 w-5 text-green-600" />
                                    </div>
                            </div>
                            <div className="flex flex-col">
                                    <span className="text-3xl font-bold text-gray-900">
                                        {bookingsLoading ? '...' : dashboardStats.upcomingEvents}
                                    </span>
                                    <span className="text-xs text-gray-500 mt-1">Events in the next month</span>
                            </div>
                            </Card>
                        </HoverShadowEffect>
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <HoverShadowEffect className="bg-white border border-gray-200 rounded-2xl p-6 cursor-pointer" shadowColor="rgba(0,0,0,0.15)" shadowIntensity={0.2}>
                            <Card className="p-6 border-0 shadow-none">
                            <div className="flex items-center justify-between mb-2">
                                    <h2 className="text-sm font-medium text-gray-500">Total Spent</h2>
                                    <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                                        <DollarSign className="h-5 w-5 text-purple-600" />
                                    </div>
                            </div>
                            <div className="flex flex-col">
                                    <span className="text-3xl font-bold text-gray-900">
                                        ${bookingsLoading ? '...' : dashboardStats.totalSpent.toFixed(2)}
                                    </span>
                                    <span className="text-xs text-gray-500 mt-1">Total amount spent on events</span>
                            </div>
                            </Card>
                        </HoverShadowEffect>
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <HoverShadowEffect className="bg-white border border-gray-200 rounded-2xl p-6 cursor-pointer" shadowColor="rgba(0,0,0,0.15)" shadowIntensity={0.2}>
                            <Card className="p-6 border-0 shadow-none">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-sm font-medium text-gray-500">Attended Events</h2>
                                    <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    </div>
                            </div>
                            <div className="flex flex-col">
                                    <span className="text-3xl font-bold text-gray-900">
                                        {bookingsLoading ? '...' : dashboardStats.attendedEvents}
                                    </span>
                                    <span className="text-xs text-gray-500 mt-1">Events you've attended</span>
                            </div>
                            </Card>
                        </HoverShadowEffect>
                    </motion.div>
                </motion.div>
                
                {/* Social Features Section */}
                <motion.div 
                    className="mb-12"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                >
                    <motion.div 
                        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6"
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 md:mb-0">Social Features</h2>
                        <Link href="/social">
                            <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Explore Social
                            </Button>
                        </Link>
                    </motion.div>
                    
                    <motion.div 
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <HoverShadowEffect className="bg-white border border-gray-200 rounded-2xl p-6 cursor-pointer" shadowColor="rgba(0,0,0,0.15)" shadowIntensity={0.2}>
                            <Card className="p-6 border-0 shadow-none">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Follow Users</h3>
                                <p className="text-gray-600 text-sm mb-4">Connect with other event enthusiasts and organizers</p>
                                <Link href="/social">
                                    <Button variant="outline" size="sm" className="w-full">
                                        Connect
                                    </Button>
                                </Link>
                            </Card>
                        </HoverShadowEffect>
                        
                        <HoverShadowEffect className="bg-white border border-gray-200 rounded-2xl p-6 cursor-pointer" shadowColor="rgba(0,0,0,0.15)" shadowIntensity={0.2}>
                            <Card className="p-6 border-0 shadow-none">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Calendar className="w-6 h-6 text-blue-600" />
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Follow Events</h3>
                                <p className="text-gray-600 text-sm mb-4">Stay updated on your favorite events and get notifications</p>
                                <Link href="/social">
                                    <Button variant="outline" size="sm" className="w-full">
                                        Follow Events
                                    </Button>
                                </Link>
                            </Card>
                        </HoverShadowEffect>
                        
                        <HoverShadowEffect className="bg-white border border-gray-200 rounded-2xl p-6 cursor-pointer" shadowColor="rgba(0,0,0,0.15)" shadowIntensity={0.2}>
                            <Card className="p-6 border-0 shadow-none">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Follow Categories</h3>
                                <p className="text-gray-600 text-sm mb-4">Discover events in your favorite categories</p>
                                <Link href="/social">
                                    <Button variant="outline" size="sm" className="w-full">
                                        Explore Categories
                                    </Button>
                                </Link>
                            </Card>
                        </HoverShadowEffect>
                    </motion.div>
                </motion.div>
                
                {/* Your Recent Bookings */}
                <motion.div 
                    className="mb-12"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                >
                    <motion.div 
                        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6"
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 md:mb-0">Your Recent Bookings</h2>
                        <div className="w-full md:w-auto flex items-center">
                            <div className="relative flex-grow md:w-64">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <Input
                                    type="text"
                                    placeholder="Search bookings by title or location..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </motion.div>
                    
                    {bookingsLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <motion.div
                                className="w-12 h-12 border-4 border-t-[#6CDAEC] rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                        </div>
                    ) : filteredBookings.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <Calendar className="h-12 w-12 mx-auto" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                            <p className="text-gray-500 mb-6">
                                {searchTerm ? "We couldn't find any bookings matching your search." : "You haven't made any bookings yet."}
                            </p>
                            {searchTerm ? (
                                <Button onClick={() => setSearchTerm('')}>Clear Search</Button>
                            ) : (
                                <Link href="/events">
                                    <Button>Browse Events</Button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <motion.div 
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            {filteredBookings.slice(0, 6).map((bookingGroup, index) => (
                                <motion.div 
                                    key={bookingGroup.eventId} 
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    whileHover={{ 
                                        scale: 1.02,
                                        transition: { duration: 0.2 }
                                    }}
                                >
                                    <HoverShadowEffect className="overflow-hidden border border-gray-200 rounded-2xl cursor-pointer" shadowColor="rgba(0,0,0,0.15)" shadowIntensity={0.2}>
                                        <Card className="overflow-hidden border-0 shadow-none">
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
                                <div className="p-4">
                                            <h3 className="text-lg font-semibold mb-2 text-gray-900">{bookingGroup.event?.title}</h3>
                                    <div className="flex items-center text-sm text-gray-500 mb-2">
                                                <Calendar className="h-4 w-4 mr-1" />
                                                <span>{bookingGroup.event?.date ? new Date(bookingGroup.event.date).toLocaleDateString('en-US', { 
                                            year: 'numeric', 
                                            month: 'short', 
                                            day: 'numeric' 
                                                }) : 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-500 mb-2">
                                                <Clock className="h-4 w-4 mr-1" />
                                                <span>{bookingGroup.event?.time || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500 mb-4">
                                                <MapPin className="h-4 w-4 mr-1" />
                                                <span>{bookingGroup.event?.location || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        ${bookingGroup.totalPrice.toFixed(2)}
                                                    </span>
                                                    {bookingGroup.quantity > 1 && (
                                                        <span className="text-xs text-gray-500">
                                                            {bookingGroup.quantity} tickets
                                                        </span>
                                                    )}
                                    </div>
                                                <Link href={`/events/${bookingGroup.eventId}`}>
                                            <Button variant="outline" size="sm">View Details</Button>
                                        </Link>
                                    </div>
                                </div>
                                </Card>
                            </HoverShadowEffect>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </motion.div>
                
                {/* Recommended For You */}
                {recommendedEvents.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    <motion.div 
                        className="flex justify-between items-center mb-6"
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <h2 className="text-xl font-semibold text-gray-900">Recommended For You</h2>
                            <Link href="/events" className="text-[#6CDAEC] hover:underline text-sm font-medium">
                            Discover More
                        </Link>
                    </motion.div>
                    
                        <motion.div 
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            {recommendedEvents.slice(0, 3).map((event, index) => (
                                <motion.div 
                                    key={event.id} 
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    whileHover={{ 
                                        scale: 1.02,
                                        transition: { duration: 0.2 }
                                    }}
                                >
                                    <HoverShadowEffect className="overflow-hidden border border-gray-200 rounded-2xl cursor-pointer" shadowColor="rgba(0,0,0,0.15)" shadowIntensity={0.2}>
                                        <Card className="overflow-hidden border-0 shadow-none">
                                <div className="relative h-48">
                                    <img 
                                                src={event.image_url || 'https://via.placeholder.com/400x200?text=Event'} 
                                                alt={event.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Event';
                                        }}
                                    />
                                </div>
                                <div className="p-4">
                                            <h3 className="text-lg font-semibold mb-2 text-gray-900">{event.title}</h3>
                                    <div className="flex items-center text-sm text-gray-500 mb-2">
                                                <Calendar className="h-4 w-4 mr-1" />
                                                <span>{event.date ? new Date(event.date).toLocaleDateString('en-US', { 
                                            year: 'numeric', 
                                            month: 'short', 
                                            day: 'numeric' 
                                                }) : 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500 mb-4">
                                                <MapPin className="h-4 w-4 mr-1" />
                                                <span>{event.location || 'N/A'}</span>
                                    </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-900">
                                                    ${event.price || 0}
                                                </span>
                                                <div className="flex space-x-2">
                                    <Link href={`/events/${event.id}`}>
                                                        <Button variant="outline" size="sm">Learn More</Button>
                                                    </Link>
                                                    <Link href={`/customer/book-event/${event.id}`}>
                                                        <Button size="sm" className="bg-[#6CDAEC] hover:bg-[#5BC8D9]">
                                                            Buy Ticket
                                                        </Button>
                                    </Link>
                                                </div>
                                            </div>
                                </div>
                                </Card>
                            </HoverShadowEffect>
                                </motion.div>
                        ))}
                        </motion.div>
                    </motion.div>
                )}
            </main>
            
            <Footer />
        </div>
    )
} 