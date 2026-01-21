'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { useEvents } from '@/contexts/EventContext'
import { eventsAPI, bookingsAPI, categoriesAPI, authAPI } from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassTile } from '@/components/ui/glass-tile'
import {
    Calendar,
    Ticket,
    DollarSign,
    UserPlus,
    PlusCircle,
    ShieldCheck,
    ArrowRight,
    TrendingUp,
    Activity,
    ArrowUpRight,
    Users,
    Layers,
    ClipboardList
} from 'lucide-react'

// Define types for dashboard data
type ActivityItem = {
    type: 'event' | 'user' | 'booking' | 'category' | 'admin'
    title: string
    time: string
    color: string
}

type BookingItem = {
    id: string
    eventName: string
    user: string
    date: string
    status: string
}

type DashboardStats = {
    totalEvents: number
    totalBookings: number
    revenue: number
    newUsers: number
    recentActivity: ActivityItem[]
    recentBookings: BookingItem[]
}

export default function AdminDashboard() {
    const { user, isLoading: authLoading } = useAuth()
    const { events } = useEvents()
    const router = useRouter()

    const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
        totalEvents: 0,
        totalBookings: 0,
        revenue: 0,
        newUsers: 0,
        recentActivity: [],
        recentBookings: []
    })

    const [loading, setLoading] = useState(true)

    // Redirect to auth page if user is not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth')
        }
    }, [user, authLoading, router])

    useEffect(() => {
        const fetchDashboardData = async () => {
            const startTime = performance.now()
            try {
                setLoading(true)

                // Fetch data concurrently for better performance
                const [eventsData, bookingsData] = await Promise.all([
                    eventsAPI.getAllEvents(),
                    bookingsAPI.getAllBookings()
                ])

                const totalEvents = eventsData?.length || 0
                const totalBookings = bookingsData?.length || 0

                // Calculate revenue from bookings
                let totalRevenue = 0
                if (bookingsData && bookingsData.length > 0) {
                    totalRevenue = bookingsData.reduce((sum, booking) => {
                        const eventPrice = booking.event?.price || 0
                        return sum + eventPrice
                    }, 0)
                }

                const endTime = performance.now()
                console.log(`⚡ Dashboard data loaded in ${(endTime - startTime).toFixed(2)}ms`)

                // Format recent bookings
                const recentBookingsData = bookingsData?.slice(0, 5).map(booking => ({
                    id: booking.id,
                    eventName: booking.event?.title || 'Unknown Event',
                    user: booking.user?.username || booking.user?.email || 'Unknown User',
                    date: booking.event?.date || new Date().toISOString().split('T')[0],
                    status: booking.status
                })) || []

                // Recent activity
                const recentActivity: ActivityItem[] = []

                if (eventsData && eventsData.length > 0) {
                    const recentEvents = eventsData.slice(0, 3).map(event => ({
                        type: 'event' as const,
                        title: `Event "${event.title}" created`,
                        time: formatTimeAgo(new Date(event.created_at || Date.now())),
                        color: 'bg-blue-500'
                    }))
                    recentActivity.push(...recentEvents)
                }

                if (bookingsData && bookingsData.length > 0) {
                    const recentBookingActivities = bookingsData.slice(0, 3).map(booking => ({
                        type: 'booking' as const,
                        title: `New booking for "${booking.event?.title}"`,
                        time: formatTimeAgo(new Date(booking.created_at || Date.now())),
                        color: 'bg-purple-500'
                    }))
                    recentActivity.push(...recentBookingActivities)
                }

                setDashboardStats({
                    totalEvents,
                    totalBookings,
                    revenue: totalRevenue,
                    newUsers: 12, // Mocked new users
                    recentActivity,
                    recentBookings: recentBookingsData
                })

            } catch (error) {
                console.error('Error fetching dashboard data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [])

    const formatTimeAgo = (date: Date): string => {
        const now = new Date()
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
        if (diffInSeconds < 60) return 'just now'
        if (diffInSeconds < 3600) {
            const mins = Math.floor(diffInSeconds / 60)
            return `${mins}m ago`
        }
        if (diffInSeconds < 86400) {
            const hrs = Math.floor(diffInSeconds / 3600)
            return `${hrs}h ago`
        }
        const days = Math.floor(diffInSeconds / 86400)
        return `${days}d ago`
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
            {/* Mesh Gradient Background Elements */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
                <div className="absolute bottom-[20%] right-[-10%] w-[30%] h-[30%] rounded-full bg-purple-500/10 blur-[100px]" />
                <div className="absolute top-[40%] right-[10%] w-[20%] h-[20%] rounded-full bg-amber-500/5 blur-[80px]" />
            </div>

            <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />

            <main className="flex-grow container mx-auto px-4 py-12 max-w-7xl">
                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Activity size={20} />
                            </div>
                            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Administration</span>
                        </div>
                        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">System Overview</h1>
                        <p className="text-slate-500 mt-2 text-lg">Manage events, bookings, and system operations.</p>
                    </motion.div>

                    <motion.div
                        className="flex gap-3"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Button variant="outline" className="rounded-2xl border-slate-200 bg-white shadow-sm hover:bg-slate-50 py-6 px-6">
                            Export Data
                        </Button>
                        <Link href="/admin/event">
                            <Button className="rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-lg py-6 px-6 flex gap-2">
                                <PlusCircle size={20} />
                                New Event
                            </Button>
                        </Link>
                    </motion.div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <GlassTile delay={0.1} className="bg-white/60">
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
                                    <Calendar size={24} />
                                </div>
                                <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full">
                                    <TrendingUp size={12} />
                                    +12%
                                </div>
                            </div>
                            <div>
                                <span className="text-slate-500 text-sm font-medium">Total Events</span>
                                <h3 className="text-3xl font-bold text-slate-900">{loading ? '...' : dashboardStats.totalEvents}</h3>
                            </div>
                        </div>
                    </GlassTile>

                    <GlassTile delay={0.2} className="bg-white/60">
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
                                    <Ticket size={24} />
                                </div>
                                <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full">
                                    <TrendingUp size={12} />
                                    +8%
                                </div>
                            </div>
                            <div>
                                <span className="text-slate-500 text-sm font-medium">Bookings</span>
                                <h3 className="text-3xl font-bold text-slate-900">{loading ? '...' : dashboardStats.totalBookings}</h3>
                            </div>
                        </div>
                    </GlassTile>

                    <GlassTile delay={0.3} className="bg-white/60">
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                                    <DollarSign size={24} />
                                </div>
                                <div className="flex items-center gap-1 text-slate-500 text-xs font-bold bg-slate-100 px-2 py-1 rounded-full">
                                    Steady
                                </div>
                            </div>
                            <div>
                                <span className="text-slate-500 text-sm font-medium">Revenue</span>
                                <h3 className="text-3xl font-bold text-slate-900">{loading ? '...' : `$${dashboardStats.revenue.toLocaleString()}`}</h3>
                            </div>
                        </div>
                    </GlassTile>

                    <GlassTile delay={0.4} className="bg-white/60">
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
                                    <UserPlus size={24} />
                                </div>
                                <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full">
                                    New
                                </div>
                            </div>
                            <div>
                                <span className="text-slate-500 text-sm font-medium">New Users</span>
                                <h3 className="text-3xl font-bold text-slate-900">+{dashboardStats.newUsers}</h3>
                            </div>
                        </div>
                    </GlassTile>
                </div>

                {/* Main Content Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    {/* Recent Bookings Table */}
                    <motion.div
                        className="lg:col-span-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">Latest Bookings</h2>
                            <Link href="/admin/bookings" className="text-primary font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                                View Full History <ArrowRight size={16} />
                            </Link>
                        </div>

                        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/50">
                                        <tr>
                                            <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Event</th>
                                            <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">User</th>
                                            <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                            <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        <AnimatePresence>
                                            {loading ? (
                                                <tr><td colSpan={4} className="px-8 py-10 text-center text-slate-400 animate-pulse">Synchronizing system data...</td></tr>
                                            ) : dashboardStats.recentBookings.length === 0 ? (
                                                <tr><td colSpan={4} className="px-8 py-10 text-center text-slate-400">No recent activity detected.</td></tr>
                                            ) : dashboardStats.recentBookings.map((booking, i) => (
                                                <motion.tr
                                                    key={booking.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.1 * i }}
                                                    className="hover:bg-slate-50/50 transition-colors"
                                                >
                                                    <td className="px-8 py-5">
                                                        <span className="font-semibold text-slate-900">{booking.eventName}</span>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className="text-slate-600">{booking.user}</span>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${booking.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600' :
                                                            booking.status === 'PENDING' ? 'bg-amber-50 text-amber-600' :
                                                                'bg-rose-50 text-rose-600'
                                                            }`}>
                                                            {booking.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-5 text-primary">
                                                        <button className="p-2 hover:bg-primary/10 rounded-xl transition-colors">
                                                            <ArrowUpRight size={18} />
                                                        </button>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>

                    {/* Quick Panel - Operations */}
                    <motion.div
                        className="flex flex-col gap-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                    >
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-6 font-heading">Operations Hub</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                                <Link href="/admin/categories">
                                    <GlassTile className="p-5 flex items-center justify-between group bg-white/40">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                <Layers size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900">Categories</h4>
                                                <p className="text-xs text-slate-500">Manage event types</p>
                                            </div>
                                        </div>
                                        <ArrowRight size={18} className="text-slate-300 group-hover:text-blue-600 transition-all group-hover:translate-x-1" />
                                    </GlassTile>
                                </Link>

                                <Link href="/admin/customers">
                                    <GlassTile className="p-5 flex items-center justify-between group bg-white/40">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                                <Users size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900">Customers</h4>
                                                <p className="text-xs text-slate-500">User database & activity</p>
                                            </div>
                                        </div>
                                        <ArrowRight size={18} className="text-slate-300 group-hover:text-emerald-600 transition-all group-hover:translate-x-1" />
                                    </GlassTile>
                                </Link>

                                <Link href="/admin/bookings">
                                    <GlassTile className="p-5 flex items-center justify-between group bg-white/40">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all">
                                                <ClipboardList size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900">Bookings</h4>
                                                <p className="text-xs text-slate-500">Transaction history</p>
                                            </div>
                                        </div>
                                        <ArrowRight size={18} className="text-slate-300 group-hover:text-purple-600 transition-all group-hover:translate-x-1" />
                                    </GlassTile>
                                </Link>

                                <Link href="/admin/admin-requests">
                                    <GlassTile className="p-5 flex items-center justify-between group bg-white/40">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all">
                                                <ShieldCheck size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900">Access Requests</h4>
                                                <p className="text-xs text-slate-500">Review permissions</p>
                                            </div>
                                        </div>
                                        <ArrowRight size={18} className="text-slate-300 group-hover:text-amber-600 transition-all group-hover:translate-x-1" />
                                    </GlassTile>
                                </Link>

                                <Link href="/admin/register">
                                    <GlassTile className="p-5 flex items-center justify-between group bg-white/40">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                                <UserPlus size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900">System Admins</h4>
                                                <p className="text-xs text-slate-500">Add new managers</p>
                                            </div>
                                        </div>
                                        <ArrowRight size={18} className="text-slate-300 group-hover:text-primary transition-all group-hover:translate-x-1" />
                                    </GlassTile>
                                </Link>
                            </div>
                        </div>

                        {/* Recent Activity Mini-Feed */}
                        <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 text-slate-50">
                                <Activity size={80} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-6 relative z-10">Stream</h3>
                            <div className="space-y-6 relative z-10">
                                {loading ? (
                                    <div className="animate-pulse flex flex-col gap-4">
                                        {[1, 2, 3].map(i => <div key={i} className="h-10 bg-slate-100 rounded-xl" />)}
                                    </div>
                                ) : dashboardStats.recentActivity.map((activity, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${activity.color}`} />
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800 leading-tight">{activity.title}</p>
                                            <span className="text-xs text-slate-400 font-medium">{activity.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
