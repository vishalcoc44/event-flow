'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/AuthContext'
import { useBookings } from '@/contexts/BookingContext'
import { useEvents } from '@/contexts/EventContext'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassTile } from '@/components/ui/glass-tile'
import {
    Calendar,
    Clock,
    MapPin,
    User,
    DollarSign,
    CheckCircle,
    Search,
    ArrowRight,
    ArrowUpRight,
    TrendingUp,
    Settings,
    Users,
    Compass,
    Star
} from 'lucide-react'

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
    const { user, isLoading: authLoading } = useAuth()
    const { bookings, loading: bookingsLoading } = useBookings()
    const { events, loading: eventsLoading } = useEvents()
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState('')
    const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
        totalBookings: 0,
        upcomingEvents: 0,
        totalSpent: 0,
        attendedEvents: 0
    })
    const [userBookings, setUserBookings] = useState<BookingItem[]>([])
    const [recommendedEvents, setRecommendedEvents] = useState<any[]>([])

    // Redirect to auth page if user is not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth')
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (user && bookings && events) {
            const currentUserBookings = bookings.filter(booking => booking.user_id === user.id)
            setUserBookings(currentUserBookings)

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

            const totalBookings = groupedBookings.length
            const upcomingEvents = groupedBookings.filter(group => {
                const eventDate = new Date(group.event?.date || '')
                const today = new Date()
                return eventDate > today && group.status !== 'CANCELLED'
            }).length

            const totalSpent = groupedBookings.reduce((sum, group) => sum + group.totalPrice, 0)

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

            const userBookedEventIds = groupedBookings.map(group => group.eventId)
            const availableEvents = events.filter(event => !userBookedEventIds.includes(event.id))
            setRecommendedEvents(availableEvents.slice(0, 6))
        }
    }, [user, bookings, events])

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
        if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase()
        if (firstName) return firstName[0].toUpperCase()
        if (email) return email[0].toUpperCase()
        return 'U'
    }

    const getStatusStyles = (status: string) => {
        switch (status.toUpperCase()) {
            case 'CONFIRMED': return 'bg-emerald-50 text-emerald-600 border-emerald-100'
            case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100'
            case 'CANCELLED': return 'bg-rose-50 text-rose-600 border-rose-100'
            default: return 'bg-slate-50 text-slate-600 border-slate-100'
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
            {/* Mesh Gradient Background */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[140px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
                <div className="absolute top-[30%] left-[20%] w-[25%] h-[25%] rounded-full bg-rose-500/5 blur-[100px]" />
            </div>

            <Header />

            <main className="flex-grow container mx-auto px-4 py-12 max-w-7xl">
                {/* Personalized Hero Area */}
                <div className="relative mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row items-center md:items-end justify-between gap-8"
                    >
                        <div className="flex flex-col md:flex-row items-center md:items-center gap-6">
                            <motion.div
                                className="relative"
                                whileHover={{ scale: 1.05 }}
                            >
                                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                                <Avatar className="h-24 w-24 border-4 border-white shadow-2xl relative z-10 bg-gradient-to-br from-[#6CDAEC] to-primary">
                                    <AvatarFallback className="text-2xl font-bold text-white">
                                        {getInitials(user?.first_name, user?.last_name, user?.email)}
                                    </AvatarFallback>
                                </Avatar>
                            </motion.div>
                            <div className="text-center md:text-left">
                                <span className="text-sm font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">Community Member</span>
                                <h1 className="text-4xl font-black text-slate-900 mt-2 tracking-tight">
                                    Hey, {user?.first_name || user?.username || user?.email?.split('@')[0]}!
                                </h1>
                                <p className="text-slate-500 mt-1 font-medium italic">Ready for your next adventure?</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Link href="/customer/profile">
                                <Button className="rounded-2xl border-slate-100 bg-white shadow-sm hover:shadow-md hover:bg-slate-50 py-6 px-6 text-slate-900 font-bold border flex gap-2">
                                    <Settings size={20} className="text-slate-400" />
                                    Manage Profile
                                </Button>
                            </Link>
                            <Link href="/events">
                                <Button className="rounded-2xl bg-neutral-900 hover:bg-neutral-800 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 py-6 px-8 text-white font-bold flex gap-2">
                                    <Compass size={20} />
                                    Discover Events
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>

                {/* Modern Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    <GlassTile delay={0.1} className="bg-white/60">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-2xl bg-cyan-50 text-cyan-600 shadow-inner">
                                <Calendar size={24} />
                            </div>
                            <Badge variant="outline" className="text-[10px] font-bold border-cyan-100 text-cyan-700 bg-cyan-50/50">LIFETIME</Badge>
                        </div>
                        <div>
                            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Bookings</span>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{bookingsLoading ? '...' : dashboardStats.totalBookings}</h3>
                        </div>
                    </GlassTile>

                    <GlassTile delay={0.2} className="bg-white/60">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 shadow-inner">
                                <Clock size={24} />
                            </div>
                            <Badge variant="outline" className="text-[10px] font-bold border-emerald-100 text-emerald-700 bg-emerald-50/50">ACTIVE</Badge>
                        </div>
                        <div>
                            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Upcoming</span>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{bookingsLoading ? '...' : dashboardStats.upcomingEvents}</h3>
                        </div>
                    </GlassTile>

                    <GlassTile delay={0.3} className="bg-white/60">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 shadow-inner">
                                <DollarSign size={24} />
                            </div>
                            <Badge variant="outline" className="text-[10px] font-bold border-slate-100 text-slate-500 bg-slate-50">USD</Badge>
                        </div>
                        <div>
                            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Spent</span>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">${bookingsLoading ? '...' : dashboardStats.totalSpent.toLocaleString()}</h3>
                        </div>
                    </GlassTile>

                    <GlassTile delay={0.4} className="bg-white/60">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 shadow-inner">
                                <CheckCircle size={24} />
                            </div>
                            <Badge variant="outline" className="text-[10px] font-bold border-amber-100 text-amber-700 bg-amber-50/50">ACHIEVED</Badge>
                        </div>
                        <div>
                            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Attended</span>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{bookingsLoading ? '...' : dashboardStats.attendedEvents}</h3>
                        </div>
                    </GlassTile>
                </div>

                {/* Social Hub Section */}
                <div className="mb-16">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Social Hub</h2>
                            <p className="text-slate-500 font-medium">Connect and discover with your network.</p>
                        </div>
                        <Link href="/social">
                            <Button className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-indigo-200 shadow-lg text-white font-bold py-6 px-8 flex gap-2">
                                <Users size={20} />
                                Expand Network
                            </Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Link href="/social">
                            <GlassTile className="p-6 flex items-center gap-6 group bg-white/40">
                                <div className="w-16 h-16 rounded-[24px] bg-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-500 shadow-sm">
                                    <User size={28} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-lg">My Circle</h4>
                                    <p className="text-sm text-slate-400 font-medium">Follow event enthusiasts</p>
                                </div>
                                <ArrowUpRight className="ml-auto text-slate-300 group-hover:text-purple-600 transition-colors" size={24} />
                            </GlassTile>
                        </Link>

                        <Link href="/social">
                            <GlassTile className="p-6 flex items-center gap-6 group bg-white/40">
                                <div className="w-16 h-16 rounded-[24px] bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
                                    <Calendar size={28} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-lg">Watched</h4>
                                    <p className="text-sm text-slate-400 font-medium">Track favorite events</p>
                                </div>
                                <ArrowUpRight className="ml-auto text-slate-300 group-hover:text-blue-600 transition-colors" size={24} />
                            </GlassTile>
                        </Link>

                        <Link href="/social">
                            <GlassTile className="p-6 flex items-center gap-6 group bg-white/40">
                                <div className="w-16 h-16 rounded-[24px] bg-rose-50 flex items-center justify-center text-rose-600 group-hover:scale-110 group-hover:bg-rose-600 group-hover:text-white transition-all duration-500 shadow-sm">
                                    <Star size={28} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-lg">Vibes</h4>
                                    <p className="text-sm text-slate-400 font-medium">Explore categories</p>
                                </div>
                                <ArrowUpRight className="ml-auto text-slate-300 group-hover:text-rose-600 transition-colors" size={24} />
                            </GlassTile>
                        </Link>
                    </div>
                </div>

                {/* Booking History Grid */}
                <div className="mb-16">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">My Experience</h2>
                            <p className="text-slate-500 font-medium">Review your past and upcoming bookings.</p>
                        </div>
                        <div className="relative group w-full md:w-80">
                            <div className="absolute inset-y-0 left-0 pl-1 py-1 h-full flex items-center pointer-events-none">
                                <div className="p-3 text-slate-400 group-focus-within:text-primary transition-colors">
                                    <Search size={18} />
                                </div>
                            </div>
                            <Input
                                type="text"
                                placeholder="Locate an experience..."
                                className="pl-12 py-7 rounded-2xl border-slate-100 bg-white/60 backdrop-blur-sm shadow-sm focus:bg-white transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {bookingsLoading ? (
                        <div className="flex justify-center py-20">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-slate-100 border-t-primary rounded-full animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Compass size={24} className="text-primary animate-pulse" />
                                </div>
                            </div>
                        </div>
                    ) : filteredBookings.length === 0 ? (
                        <div className="text-center py-20 bg-white/40 rounded-[40px] border-2 border-dashed border-slate-200">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Calendar size={40} className="text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">No Experiences Found</h3>
                            <p className="text-slate-500 mt-2 mb-8">Start your journey by exploring new events.</p>
                            <Link href="/events">
                                <Button className="rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold py-6 px-10 shadow-lg shadow-primary/20">
                                    Discover Now
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredBookings.slice(0, 6).map((group, i) => (
                                <motion.div
                                    key={group.eventId}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * i }}
                                >
                                    <div className="group bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 hover:-translate-y-2">
                                        <div className="relative h-56 overflow-hidden">
                                            <img
                                                src={group.event?.image_url || 'https://via.placeholder.com/800x600?text=Experience'}
                                                alt={group.event?.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            <div className="absolute top-4 right-4 flex flex-col gap-2">
                                                <Badge className={`py-1.5 px-3 rounded-xl border backdrop-blur-xl ${getStatusStyles(group.status)}`}>
                                                    {group.status}
                                                </Badge>
                                                {group.quantity > 1 && (
                                                    <Badge className="py-1.5 px-3 rounded-xl bg-primary text-white border-0 shadow-lg">
                                                        {group.quantity} Tickets
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1 mb-4">{group.event?.title}</h3>

                                            <div className="space-y-3 mb-6">
                                                <div className="flex items-center text-slate-500 text-sm font-medium">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center mr-3 text-slate-400 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                                                        <Calendar size={16} />
                                                    </div>
                                                    {group.event?.date ? new Date(group.event.date).toLocaleDateString('en-US', {
                                                        month: 'long', day: 'numeric', year: 'numeric'
                                                    }) : 'Flexible Date'}
                                                </div>
                                                <div className="flex items-center text-slate-500 text-sm font-medium">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center mr-3 text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-colors">
                                                        <MapPin size={16} />
                                                    </div>
                                                    {group.event?.location || 'Digital Experience'}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                                <div className="flex flex-col">
                                                    <span className="text-2xl font-black text-slate-900 tracking-tight">${group.totalPrice.toFixed(0)}</span>
                                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-none">Investment</span>
                                                </div>
                                                <Link href={`/events/${group.eventId}`}>
                                                    <Button className="w-12 h-12 rounded-2xl bg-slate-50 group-hover:bg-slate-900 text-slate-400 group-hover:text-white transition-all p-0 flex items-center justify-center">
                                                        <ArrowRight size={20} />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recommendations Grid */}
                {recommendedEvents.length > 0 && (
                    <div className="mb-20">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Curated For You</h2>
                                <p className="text-slate-500 font-medium">Experiences you might enjoy.</p>
                            </div>
                            <Link href="/events" className="group text-primary font-bold text-sm flex items-center gap-2">
                                Discover More <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {recommendedEvents.slice(0, 4).map((event, i) => (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.1 * i }}
                                >
                                    <div className="group bg-white/60 backdrop-blur-sm rounded-[28px] p-4 border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-500">
                                        <div className="relative h-40 rounded-[20px] overflow-hidden mb-4">
                                            <img
                                                src={event.image_url || 'https://via.placeholder.com/600x400?text=Event'}
                                                alt={event.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute top-3 right-3">
                                                <div className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-black shadow-sm">
                                                    ${event.price || 0}
                                                </div>
                                            </div>
                                        </div>
                                        <h4 className="font-bold text-slate-900 line-clamp-1 mb-2 group-hover:text-primary transition-colors">{event.title}</h4>
                                        <p className="text-xs text-slate-400 font-medium truncate mb-4">{event.location || 'Remote'}</p>
                                        <div className="flex gap-2">
                                            <Link href={`/events/${event.id}`} className="flex-1">
                                                <Button variant="ghost" className="w-full rounded-xl text-[10px] font-bold h-9">DETAILS</Button>
                                            </Link>
                                            <Link href={`/customer/book-event/${event.id}`} className="flex-1">
                                                <Button className="w-full rounded-xl bg-slate-900 hover:bg-primary text-white text-[10px] font-bold h-9 shadow-lg">TICKET</Button>
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    )
}
