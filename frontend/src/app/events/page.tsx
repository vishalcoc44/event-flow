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

import { GlassTile } from '@/components/ui/glass-tile'

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

    const categories = events && Array.isArray(events)
        ? [...new Set(
            events
                .filter(event => event && typeof event === 'object' && event.categories && event.categories.name)
                .map(event => event.categories!.name)
                .filter(Boolean)
        )]
        : []

    const filteredEvents = (events && Array.isArray(events))
        ? events.filter(event => {
            if (!event || typeof event !== 'object') return false

            const title = event.title || ''
            const description = event.description || ''
            const location = event.location || ''
            const price = event.price || 0

            const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                location.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesCategory = selectedCategory === 'all' || event.categories?.name === selectedCategory

            let matchesPrice = true
            if (priceRange === 'free') {
                matchesPrice = price === 0
            } else if (priceRange === 'low') {
                matchesPrice = price > 0 && price <= 50
            } else if (priceRange === 'medium') {
                matchesPrice = price > 50 && price <= 200
            } else if (priceRange === 'high') {
                matchesPrice = price > 200
            }

            return matchesSearch && matchesCategory && matchesPrice
        })
        : []

    return (
        <div className="min-h-screen flex flex-col bg-background relative overflow-x-hidden">
            {/* Mesh Background */}
            <div className="fixed inset-0 z-[-1] opacity-30 dark:opacity-20 pointer-events-none">
                <div className="absolute top-[-5%] right-[-5%] w-[35%] h-[35%] rounded-full bg-blue-300/20 blur-[100px]" />
                <div className="absolute bottom-[-5%] left-[-5%] w-[35%] h-[35%] rounded-full bg-indigo-300/20 blur-[100px]" />
            </div>

            <Header />

            <main className="flex-grow container mx-auto px-4 pt-40 pb-20">
                {/* Header Section */}
                <motion.div
                    className="mb-16 text-center max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="inline-block px-4 py-1.5 mb-6 text-[10px] font-bold rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 uppercase tracking-[0.2em]">
                        Explore the Collection
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 tracking-tight leading-[0.9]">Discover <br /> Remarkable Events.</h1>
                    <p className="text-xl text-muted-foreground font-medium">Curation of world-class experiences designed for organizers who demand excellence.</p>
                </motion.div>

                {/* Filter Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-16"
                >
                    <GlassTile className="p-4" interactive={false}>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="md:col-span-2 relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 group-focus-within:text-blue-500 transition-colors" />
                                <Input
                                    type="text"
                                    placeholder="Search by title, location, or vibes..."
                                    className="pl-12 h-14 rounded-2xl bg-white/20 dark:bg-black/20 border-white/60 dark:border-white/10 focus:ring-2 focus:ring-blue-500/20 transition-all text-lg font-medium"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="relative group">
                                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full h-14 pl-10 pr-4 rounded-2xl bg-white/20 dark:bg-black/20 border border-white/60 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none text-sm font-bold uppercase tracking-widest cursor-pointer"
                                >
                                    <option value="all">All Categories</option>
                                    {(categories && Array.isArray(categories)) ? categories.filter(category => category && typeof category === 'string').map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    )) : null}
                                </select>
                            </div>

                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                <select
                                    value={priceRange}
                                    onChange={(e) => setPriceRange(e.target.value)}
                                    className="w-full h-14 pl-10 pr-4 rounded-2xl bg-white/20 dark:bg-black/20 border border-white/60 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none text-sm font-bold uppercase tracking-widest cursor-pointer"
                                >
                                    <option value="all">All Prices</option>
                                    <option value="free">Free Access</option>
                                    <option value="low">Under $50</option>
                                    <option value="medium">$50 - $200</option>
                                    <option value="high">$200+</option>
                                </select>
                            </div>
                        </div>
                    </GlassTile>
                </motion.div>

                {/* Results Count */}
                <div className="flex justify-between items-center mb-10 px-2">
                    <p className="text-sm font-bold uppercase tracking-[0.1em] text-neutral-500">
                        {eventsLoading ? 'Loading universe...' : `${filteredEvents.length} Event${filteredEvents.length !== 1 ? 's' : ''} Curated`}
                    </p>
                    <div className="flex gap-2">
                        {['Grid', 'List'].map(mode => (
                            <button key={mode} className="p-2 rounded-lg hover:bg-white/40 dark:hover:bg-black/40 transition-colors">
                                <div className="w-4 h-4 bg-neutral-400 rounded-sm" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Events Grid */}
                {eventsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-[450px] rounded-3xl bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
                        ))}
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <GlassTile className="py-32 text-center" interactive={false}>
                        <div className="bg-neutral-100 dark:bg-neutral-900 h-20 w-20 rounded-3xl flex items-center justify-center mx-auto mb-8">
                            <Calendar className="h-10 w-10 text-neutral-400" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">No Events Found</h3>
                        <p className="text-muted-foreground mb-10 max-w-sm mx-auto font-medium">
                            Adjust your filters or broaden your search to discover new experiences.
                        </p>
                        {(searchTerm || selectedCategory !== 'all' || priceRange !== 'all') && (
                            <Button
                                variant="outline"
                                className="rounded-full px-10 h-14 text-sm font-bold uppercase"
                                onClick={() => {
                                    setSearchTerm('')
                                    setSelectedCategory('all')
                                    setPriceRange('all')
                                }}
                            >
                                Reset Filters
                            </Button>
                        )}
                    </GlassTile>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {filteredEvents.map((event, index) => {
                            if (!event || typeof event !== 'object' || !event.id) return null
                            const isBooked = userBookedEvents.includes(event.id)

                            return (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.05 }}
                                >
                                    <GlassTile className="p-4 h-full flex flex-col group" hoverScale={1.03}>
                                        <div className="relative h-56 rounded-[2rem] overflow-hidden mb-6">
                                            <img
                                                src={event.image_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=600&auto=format&fit=crop'}
                                                alt={event.title || 'Event'}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                            {event.categories && (
                                                <div className="absolute top-4 left-4">
                                                    <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-white/90 text-black backdrop-blur-md">
                                                        {event.categories.name}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                                <div className="bg-white/20 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 text-white">
                                                    <div className="text-[10px] font-bold uppercase opacity-60">Entry From</div>
                                                    <div className="text-lg font-black leading-none">
                                                        {event.price === 0 || !event.price ? 'Free' : `$${event.price}`}
                                                    </div>
                                                </div>
                                                {isBooked && (
                                                    <span className="px-3 py-1.5 rounded-xl bg-green-500 text-white text-[10px] font-bold uppercase">
                                                        Reserved
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex-grow space-y-3 pb-6 border-b border-neutral-100 dark:border-neutral-800">
                                            <h3 className="text-xl font-bold line-clamp-2 tracking-tight">
                                                {event.title || 'Untitled Event'}
                                            </h3>

                                            <div className="flex flex-wrap gap-4 text-neutral-500 font-medium text-xs">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {event.date ? new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                    <span className="line-clamp-1">{event.location?.split(',')[0] || 'Worldwide'}</span>
                                                </div>
                                            </div>

                                            <div className="pt-2">
                                                <EventRating
                                                    rating={4.2}
                                                    reviewCount={8}
                                                    size="sm"
                                                    showCount={true}
                                                    className="text-[10px] font-bold uppercase tracking-widest text-neutral-400"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-6">
                                            <Link href={`/events/${event.id}`}>
                                                <Button className="w-full h-12 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-bold text-sm group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                                    Explore Event
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </GlassTile>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    )
}
