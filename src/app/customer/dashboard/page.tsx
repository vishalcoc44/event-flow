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

    return (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-primary/10">
            {/* Soft Premium Mesh Background */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[160px]" />
                <div className="absolute bottom-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[140px]" />
                <div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] rounded-full bg-rose-500/5 blur-[100px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
            </div>

            <Header />

            <main className="flex-grow container mx-auto px-4 py-8 max-w-[1600px]">
                {/* 12-Column Bento Grid Structure */}
                <div className="grid grid-cols-12 gap-6">

                    {/* Hero Section (Col 1-8) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="col-span-12 lg:col-span-8 space-y-6"
                    >
                        <div className="relative overflow-hidden rounded-[40px] p-8 md:p-12 bg-white border border-slate-200 shadow-xl shadow-slate-200/50">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] -translate-y-1/2 translate-x-1/2 rounded-full" />

                            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-8 text-center md:text-left">
                                <div className="space-y-4">
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-xs font-bold tracking-widest uppercase text-primary"
                                    >
                                        <TrendingUp size={14} />
                                        Personal Terminal
                                    </motion.div>
                                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] text-slate-900">
                                        Explore,<br />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600">
                                            {user?.first_name || user?.username || "Adventurer"}
                                        </span>
                                    </h1>
                                    <p className="text-slate-500 text-lg font-medium max-w-md">
                                        Your gateway to the world's most exclusive experiences. Track, manage, and discover what's next.
                                    </p>
                                    <div className="flex flex-wrap items-center gap-4 pt-4">
                                        <Link href="/events">
                                            <Button className="h-14 px-8 rounded-2xl bg-neutral-900 text-white hover:bg-neutral-800 font-black tracking-tight transition-all hover:scale-105 active:scale-95 shadow-lg shadow-neutral-900/20">
                                                Discover Events
                                            </Button>
                                        </Link>
                                        <Link href="/customer/profile">
                                            <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 hover:bg-slate-50 text-slate-900 font-bold tracking-tight">
                                                My Workspace
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                                <motion.div
                                    whileHover={{ scale: 1.05, rotate: 2 }}
                                    className="relative hidden md:block"
                                >
                                    <div className="absolute inset-0 bg-primary/20 blur-[40px] rounded-full" />
                                    <Avatar className="h-48 w-48 rounded-[64px] border-8 border-white shadow-2xl relative z-10 bg-slate-50">
                                        <AvatarFallback className="text-6xl font-black bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
                                            {getInitials(user?.first_name, user?.last_name, user?.email)}
                                        </AvatarFallback>
                                    </Avatar>
                                </motion.div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <GlassTile className="p-8 group hover:border-primary/50 transition-colors bg-white shadow-lg shadow-slate-200/40 border-slate-200">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="p-4 rounded-2xl bg-primary/10 text-primary">
                                        <Calendar size={28} />
                                    </div>
                                    <Link href="/events">
                                        <ArrowUpRight className="text-slate-300 group-hover:text-primary transition-colors" size={24} />
                                    </Link>
                                </div>
                                <h3 className="text-3xl font-black tracking-tight mb-2 text-slate-900">
                                    {bookingsLoading ? '...' : dashboardStats.upcomingEvents}
                                </h3>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Active Events Upcoming</p>
                                <div className="mt-6 flex -space-x-3">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-100 overflow-hidden">
                                            <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="attendee" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                    <div className="w-10 h-10 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                        +12
                                    </div>
                                </div>
                            </GlassTile>

                            <GlassTile className="p-8 group hover:border-indigo-500/50 transition-colors bg-white shadow-lg shadow-slate-200/40 border-slate-200">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-600">
                                        <DollarSign size={28} />
                                    </div>
                                    <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 font-black">PREMIUM</Badge>
                                </div>
                                <h3 className="text-3xl font-black tracking-tight mb-2 text-slate-900">
                                    ${bookingsLoading ? '...' : dashboardStats.totalSpent.toLocaleString()}
                                </h3>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Total Experience Value</p>
                                <div className="mt-8 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '65%' }}
                                        className="h-full bg-gradient-to-r from-indigo-500 to-primary"
                                    />
                                </div>
                            </GlassTile>
                        </div>
                    </motion.div>

                    {/* Right Bento Column (Col 9-12) */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="col-span-12 lg:col-span-4 space-y-6"
                    >
                        {/* Summary Block */}
                        <div className="rounded-[40px] p-8 bg-neutral-900 text-white overflow-hidden relative group shadow-2xl">
                            <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/20 rounded-full translate-x-1/2 translate-y-1/2 group-hover:scale-150 transition-transform duration-700 blur-2xl" />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-neutral-500">Activity Overview</h4>
                            <div className="space-y-6 relative z-10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary">
                                            <Compass size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">Experiences</p>
                                            <p className="text-xs text-neutral-500">Complete history</p>
                                        </div>
                                    </div>
                                    <span className="text-xl font-black">{dashboardStats.totalBookings}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-amber-400">
                                            <Star size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">Accomplished</p>
                                            <p className="text-xs text-neutral-500">Events attended</p>
                                        </div>
                                    </div>
                                    <span className="text-xl font-black">{dashboardStats.attendedEvents}</span>
                                </div>
                            </div>
                            <Button className="w-full mt-10 h-12 rounded-2xl bg-white text-black hover:bg-neutral-200 font-black tracking-tight transition-all group">
                                Full History
                                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                            </Button>
                        </div>

                        {/* Social Tiles */}
                        <div className="grid grid-cols-2 gap-4">
                            <Link href="/social" className="group">
                                <div className="p-6 rounded-[32px] bg-white border border-slate-200 hover:border-primary/30 shadow-sm hover:shadow-xl transition-all text-center">
                                    <Users className="mx-auto mb-4 text-primary group-hover:scale-110 transition-transform" size={24} />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-primary">Circle</p>
                                </div>
                            </Link>
                            <Link href="/social" className="group">
                                <div className="p-6 rounded-[32px] bg-white border border-slate-200 hover:border-indigo-400/30 shadow-sm hover:shadow-xl transition-all text-center">
                                    <Star className="mx-auto mb-4 text-indigo-500 group-hover:scale-110 transition-transform" size={24} />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-600">Vibes</p>
                                </div>
                            </Link>
                        </div>

                        {/* Recommendations */}
                        <div className="p-8 rounded-[40px] bg-gradient-to-br from-primary to-indigo-600 shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-700">
                                <Compass size={120} />
                            </div>
                            <h5 className="font-black text-2xl text-white mb-2 leading-tight">Ready for more?</h5>
                            <p className="text-white/80 text-sm mb-8 font-medium">Discovery AI found matching events for your profile.</p>
                            <Link href="/events">
                                <Button className="w-full h-12 rounded-2xl bg-white text-black font-black tracking-tight hover:bg-neutral-100 shadow-lg">
                                    See Matches
                                </Button>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Experiences Section */}
                    <div className="col-span-12 py-12">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-2">Experiences Portfolio</h2>
                                <p className="text-slate-500 font-medium">Curated access to your reserved events.</p>
                            </div>
                            <div className="relative group hidden md:block w-72">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                                <Input
                                    placeholder="Filter experiences..."
                                    className="h-12 pl-12 rounded-2xl bg-white border-slate-200 focus:border-primary/30 text-slate-900 shadow-sm transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {bookingsLoading ? (
                            <div className="flex justify-center py-32">
                                <div className="w-12 h-12 border-4 border-slate-100 border-t-primary rounded-full animate-spin" />
                            </div>
                        ) : filteredBookings.length === 0 ? (
                            <div className="text-center py-32 rounded-[60px] border-2 border-dashed border-slate-200 bg-white shadow-sm">
                                <Calendar className="mx-auto text-slate-200 mb-6" size={64} />
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">No active bookings</h3>
                                <p className="text-slate-500 mb-8 max-w-xs mx-auto text-sm font-medium">You haven't reserved any experiences yet. Start your journey today.</p>
                                <Link href="/events">
                                    <Button className="h-14 px-10 rounded-2xl bg-primary text-white font-black tracking-tight hover:shadow-xl hover:shadow-primary/20 transition-all">
                                        Launch Discovery
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                <AnimatePresence mode="popLayout">
                                    {filteredBookings.slice(0, 6).map((group, i) => (
                                        <motion.div
                                            key={group.eventId}
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: i * 0.1 }}
                                            layout
                                        >
                                            <Link href={`/events/${group.eventId}`}>
                                                <div className="group relative overflow-hidden rounded-[40px] bg-white border border-slate-200 shadow-lg shadow-slate-200/30 transition-all duration-500 hover:border-primary/20 hover:shadow-2xl hover:shadow-slate-300/60 hover:-translate-y-2">
                                                    <div className="h-64 relative overflow-hidden bg-slate-100">
                                                        <img
                                                            src={group.event?.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop'}
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                            alt={group.event?.title}
                                                        />
                                                        <div className="absolute top-6 left-6 flex flex-col gap-3">
                                                            <div className={`px-4 py-2 rounded-2xl backdrop-blur-xl border font-black text-[10px] tracking-widest uppercase shadow-sm ${group.status === 'CONFIRMED' ? 'bg-emerald-500 text-white border-transparent' :
                                                                    group.status === 'PENDING' ? 'bg-amber-500 text-white border-transparent' :
                                                                        'bg-slate-900 text-white border-transparent'
                                                                }`}>
                                                                {group.status}
                                                            </div>
                                                            {group.quantity > 1 && (
                                                                <div className="px-4 py-2 rounded-2xl bg-white text-black border border-slate-100 font-black text-[10px] tracking-widest uppercase shadow-sm">
                                                                    {group.quantity} Reserved
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-60" />
                                                    </div>

                                                    <div className="p-8 relative -mt-16 bg-white rounded-t-[40px]">
                                                        <div className="inline-block px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
                                                            ID #{group.eventId.split('-')[0]}
                                                        </div>
                                                        <h3 className="text-2xl font-black tracking-tight mb-6 line-clamp-1 group-hover:text-primary transition-colors text-slate-900">
                                                            {group.event?.title}
                                                        </h3>

                                                        <div className="grid grid-cols-2 gap-4 mb-8">
                                                            <div className="flex items-center gap-3 text-slate-500">
                                                                <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                                                                    <Calendar size={16} />
                                                                </div>
                                                                <span className="text-xs font-bold leading-none">
                                                                    {group.event?.date ? new Date(group.event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-3 text-slate-500">
                                                                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                                                                    <MapPin size={16} />
                                                                </div>
                                                                <span className="text-xs font-bold leading-none truncate">{group.event?.location || 'Digital'}</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                                            <div>
                                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total</p>
                                                                <p className="text-3xl font-black text-slate-900 tracking-tighter">${group.totalPrice.toFixed(0)}</p>
                                                            </div>
                                                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all transform group-hover:rotate-12 group-hover:shadow-lg group-hover:shadow-primary/30">
                                                                <ArrowRight size={24} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
