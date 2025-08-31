'use client'

import { useState, useEffect } from 'react'
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
import { Calendar, Clock, MapPin, DollarSign, Search, Filter, ArrowRight } from 'lucide-react'
import { HoverShadowEffect } from '@/components/ui/hover-shadow-effect'
import { EventRating } from '@/components/EventRating'

export default function EventsPage() {
    const { user } = useAuth()
    const { events, loading: eventsLoading } = useEvents()
    const { bookings } = useBookings()
    
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [priceRange, setPriceRange] = useState('all')
    const [userBookedEvents, setUserBookedEvents] = useState<string[]>([])

    useEffect(() => {
        if (user && bookings) {
            const bookedEventIds = bookings
                .filter(booking => booking.user_id === user.id && booking.status === 'CONFIRMED')
                .map(booking => booking.event?.id)
                .filter(Boolean) as string[]
            setUserBookedEvents(bookedEventIds)
        }
    }, [user, bookings])

    // Get unique categories
    const categories = events ? [...new Set(events.map(event => event.categories?.name).filter(Boolean))] : []

    // Filter events based on search, category, and price
    const filteredEvents = events?.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            event.location?.toLowerCase().includes(searchTerm.toLowerCase())
        
        const matchesCategory = selectedCategory === 'all' || event.categories?.name === selectedCategory
        
        let matchesPrice = true
        if (priceRange === 'free') {
            matchesPrice = event.price === 0
        } else if (priceRange === 'low') {
            matchesPrice = event.price > 0 && event.price <= 50
        } else if (priceRange === 'medium') {
            matchesPrice = event.price > 50 && event.price <= 200
        } else if (priceRange === 'high') {
            matchesPrice = event.price > 200
        }
        
        return matchesSearch && matchesCategory && matchesPrice
    }) || []

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
        <div className="min-h-screen flex flex-col bg-background">
            <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />
            
            <main className="flex-grow container mx-auto px-4 py-8">
                {/* Header */}
                <motion.div 
                    className="mb-8"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-3xl font-bold text-foreground mb-2">Discover Events</h1>
                    <p className="text-muted-foreground">Find and book amazing events happening around you</p>
                </motion.div>

                {/* Search and Filters */}
                <motion.div 
                    className="mb-8"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search events by title, description, or location..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#6CDAEC] focus:border-transparent"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>

                        {/* Price Filter */}
                        <div>
                            <select
                                value={priceRange}
                                onChange={(e) => setPriceRange(e.target.value)}
                                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#6CDAEC] focus:border-transparent"
                            >
                                <option value="all">All Prices</option>
                                <option value="free">Free</option>
                                <option value="low">$1 - $50</option>
                                <option value="medium">$51 - $200</option>
                                <option value="high">$200+</option>
                            </select>
                        </div>
                    </div>
                </motion.div>

                {/* Results Count */}
                <motion.div 
                    className="mb-6"
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    <p className="text-gray-600">
                        {eventsLoading ? 'Loading events...' : `${filteredEvents.length} event${filteredEvents.length !== 1 ? 's' : ''} found`}
                    </p>
                </motion.div>

                {/* Events Grid */}
                {eventsLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <motion.div
                            className="w-12 h-12 border-4 border-t-[#6CDAEC] rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-muted-foreground mb-4">
                            <Calendar className="h-12 w-12 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-2">No events found</h3>
                        <p className="text-gray-500 mb-6">
                            {searchTerm || selectedCategory !== 'all' || priceRange !== 'all' 
                                ? "Try adjusting your search criteria or filters." 
                                : "No events are currently available."}
                        </p>
                        {(searchTerm || selectedCategory !== 'all' || priceRange !== 'all') && (
                            <Button onClick={() => {
                                setSearchTerm('')
                                setSelectedCategory('all')
                                setPriceRange('all')
                            }}>
                                Clear Filters
                            </Button>
                        )}
                    </div>
                ) : (
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        {filteredEvents.map((event, index) => {
                            const isBooked = userBookedEvents.includes(event.id)
                            
                            return (
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
                                        <div className="relative h-32">
                                            <img
                                                src={event.image_url || 'https://via.placeholder.com/400x200?text=Event'}
                                                alt={event.title}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Event';
                                                }}
                                            />
                                            {event.categories && (
                                                <div className="absolute top-2 left-2">
                                                    <Badge className="bg-[#6CDAEC] text-white">
                                                        {event.categories.name}
                                                    </Badge>
                                                </div>
                                            )}
                                            {isBooked && (
                                                <div className="absolute top-2 right-2">
                                                    <Badge className="bg-green-100 text-green-800">
                                                        Booked
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3">
                                            <h3 className="text-base font-semibold mb-2 text-foreground line-clamp-2">
                                                {event.title}
                                            </h3>

                                            <div className="space-y-1 mb-3">
                                                <div className="flex items-center text-xs text-gray-500">
                                                    <Calendar className="h-3 w-3 mr-2" />
                                                    <span>{new Date(event.date).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}</span>
                                                </div>
                                                <div className="flex items-center text-xs text-gray-500">
                                                    <Clock className="h-3 w-3 mr-2" />
                                                    <span>{event.time}</span>
                                                </div>
                                                <div className="flex items-center text-xs text-gray-500">
                                                    <MapPin className="h-3 w-3 mr-2" />
                                                    <span className="line-clamp-1">{event.location || 'Location TBD'}</span>
                                                </div>
                                                <div className="flex items-center text-xs text-gray-500">
                                                    <EventRating
                                                        rating={4.2}
                                                        reviewCount={8}
                                                        size="sm"
                                                        showCount={false}
                                                        className="text-xs"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center">
                                                    <DollarSign className="h-3 w-3 text-[#6CDAEC] mr-1" />
                                                    <span className="text-base font-semibold text-foreground">
                                                        {event.price === 0 ? 'Free' : `$${event.price}`}
                                                    </span>
                                                </div>

                                                <div className="flex space-x-1">
                                                    <Link href={`/events/${event.id}`}>
                                                        <Button variant="outline" size="sm" className="text-xs px-2 py-1">
                                                            Details
                                                        </Button>
                                                    </Link>
                                                    {isBooked ? (
                                                        <Button disabled size="sm" className="bg-green-100 text-green-800 hover:bg-green-100 text-xs px-2 py-1">
                                                            Booked
                                                        </Button>
                                                    ) : (
                                                        <Link href={`/customer/book-event/${event.id}`}>
                                                            <Button size="sm" className="bg-[#6CDAEC] hover:bg-[#5BC8D9] text-xs px-2 py-1">
                                                                Buy Ticket
                                                            </Button>
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        </Card>
                                    </HoverShadowEffect>
                                </motion.div>
                            )
                        })}
                    </motion.div>
                )}
            </main>
            
            <Footer />
        </div>
    )
} 