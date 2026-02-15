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

import { DashboardChart } from '@/components/admin/DashboardChart'

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

    // Mock revenue data for chart
    const revenueData = [450, 600, 550, 800, 750, 1100, 950, 1300, 1200, 1500, 1400, 1800]

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
        <div className="min-h-screen flex flex-col bg-slate-50 relative">
            {/* Ultra-Modern Background Effects */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-[-15%] left-[-5%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-purple-500/15 blur-[120px]" />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-primary/10 blur-[100px]" />
            </div>

            <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />

            <main className="flex-grow container mx-auto px-6 py-12 max-w-7xl">
                {/* Hero-Style Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4 border border-primary/20 backdrop-blur-md">
                            <Activity size={14} className="animate-spin-slow" />
                            Live System Status: Optimal
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-none">
                            Command <span className="text-primary italic">Center</span>
                        </h1>
                        <p className="text-slate-500 mt-6 text-xl max-w-xl leading-relaxed">
                            A high-fidelity overview of your event ecosystem. Monitor performance, manage users, and accelerate growth.
                        </p>
                    </motion.div>

                    <motion.div
                        className="flex flex-wrap gap-4"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <Button variant="outline" className="rounded-2xl border-slate-200 bg-white shadow-xl shadow-slate-200/50 hover:bg-slate-50 py-7 px-8 text-base font-semibold transition-premium">
                            Analytics Report
                        </Button>
                        <Link href="/admin/event">
                            <Button className="rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-2xl shadow-slate-900/40 py-7 px-8 text-base font-semibold flex gap-2 transition-premium group">
                                <PlusCircle size={22} className="group-hover:rotate-90 transition-transform duration-500" />
                                Launch Event
                            </Button>
                        </Link>
                    </motion.div>
                </div>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-16">
                    {/* Revenue Trend - Large Tile */}
                    <div className="lg:col-span-8 h-full">
                        <GlassTile delay={0.2} className="bg-white/80 p-8 h-full flex flex-col justify-between group">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Revenue Performance</h3>
                                    <span className="text-4xl font-black text-slate-900">
                                        {loading ? '...' : `$${dashboardStats.revenue.toLocaleString()}`}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-emerald-600 text-xs font-black bg-emerald-100/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-emerald-200/50">
                                    <TrendingUp size={14} />
                                    +24.8% <span className="text-emerald-500/50 font-medium">vs last month</span>
                                </div>
                            </div>

                            <div className="flex-grow flex items-end">
                                <DashboardChart data={revenueData} color="hsl(var(--primary))" />
                            </div>
                        </GlassTile>
                    </div>

                    {/* Stats Stack */}
                    <div className="lg:col-span-4 grid grid-cols-1 gap-6">
                        <GlassTile delay={0.3} className="bg-primary text-white p-8 overflow-hidden group">
                            <div className="absolute -right-8 -bottom-8 text-white/10 group-hover:scale-110 transition-transform duration-700">
                                <Calendar size={180} />
                            </div>
                            <div className="relative z-10 flex flex-col justify-between h-full">
                                <span className="text-white/60 text-xs font-bold uppercase tracking-widest">Active Events</span>
                                <div className="mt-4">
                                    <h3 className="text-5xl font-black">{loading ? '...' : dashboardStats.totalEvents}</h3>
                                    <p className="text-white/70 mt-2 flex items-center gap-1 font-medium">
                                        <ArrowUpRight size={16} /> 3 starting this week
                                    </p>
                                </div>
                            </div>
                        </GlassTile>

                        <GlassTile delay={0.4} className="bg-white/40 p-8 border-dashed group">
                            <div className="flex justify-between items-center h-full">
                                <div>
                                    <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Total Bookings</span>
                                    <h3 className="text-4xl font-black text-slate-900 mt-2">{loading ? '...' : dashboardStats.totalBookings}</h3>
                                </div>
                                <div className="w-16 h-16 rounded-3xl bg-white shadow-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                                    <Ticket size={28} />
                                </div>
                            </div>
                        </GlassTile>
                    </div>

                    {/* Quick Access Grid */}
                    <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {[
                            { label: 'Categories', sub: 'Manage logic', icon: <Layers size={20} />, href: '/admin/categories', color: 'blue' },
                            { label: 'Customers', sub: 'User database', icon: <Users size={20} />, href: '/admin/customers', color: 'emerald' },
                            { label: 'Bookings', sub: 'Transactions', icon: <ClipboardList size={20} />, href: '/admin/bookings', color: 'purple' },
                            { label: 'Access', sub: 'Review perms', icon: <ShieldCheck size={20} />, href: '/admin/admin-requests', color: 'amber' },
                            { label: 'Team', sub: 'Add managers', icon: <UserPlus size={20} />, href: '/admin/register', color: 'slate' },
                        ].map((item, i) => (
                            <Link key={i} href={item.href}>
                                <GlassTile delay={0.5 + (i * 0.05)} className="px-5 py-6 flex flex-col gap-4 group bg-white/40 hover:bg-white transition-premium">
                                    <div className={`w-12 h-12 rounded-2xl bg-white shadow-lg shadow-${item.color}-200/20 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-premium`}>
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-sm whitespace-nowrap">{item.label}</h4>
                                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">{item.sub}</p>
                                    </div>
                                </GlassTile>
                            </Link>
                        ))}
                    </div>

                    {/* Table & Activity Feed Section */}
                    <div className="lg:col-span-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none px-1">Global Activity</h2>
                            <Link href="/admin/bookings" className="text-primary font-bold text-sm flex items-center gap-1 group">
                                Analytics <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        <GlassTile delay={0.7} className="bg-white/80 overflow-visible p-1">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-slate-100">
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Operator</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                            <th className="px-8 py-6 text-right pr-12">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 ml-auto animate-ping" />
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        <AnimatePresence>
                                            {loading ? (
                                                <tr><td colSpan={4} className="px-8 py-16 text-center text-slate-400 font-medium italic">Streaming data packets...</td></tr>
                                            ) : dashboardStats.recentBookings.length === 0 ? (
                                                <tr><td colSpan={4} className="px-8 py-16 text-center text-slate-400">Idle state. No recent activity.</td></tr>
                                            ) : dashboardStats.recentBookings.map((booking, i) => (
                                                <motion.tr
                                                    key={booking.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.1 * i }}
                                                    className="hover:bg-white transition-colors group"
                                                >
                                                    <td className="px-8 py-6">
                                                        <span className="font-bold text-slate-900 block">{booking.eventName}</span>
                                                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">Event Access</span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className="text-slate-600 font-semibold">{booking.user}</span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${booking.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600' :
                                                            booking.status === 'PENDING' ? 'bg-amber-50 text-amber-600' :
                                                                'bg-slate-100 text-slate-400'
                                                            }`}>
                                                            {booking.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-right pr-6">
                                                        <button className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl transition-premium group-hover:scale-110">
                                                            <ArrowUpRight size={18} />
                                                        </button>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        </GlassTile>
                    </div>

                    {/* Stream/Feed - Mini */}
                    <div className="lg:col-span-4">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Notifications</h2>
                            <div className="w-2 h-2 rounded-full bg-primary" />
                        </div>
                        <GlassTile delay={0.8} className="bg-slate-900 p-8 h-[500px] flex flex-col group overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 text-primary/5 pointer-events-none group-hover:scale-150 transition-transform duration-1000 rotate-12">
                                <Activity size={240} />
                            </div>

                            <div className="relative z-10 flex-grow scrollbar-none overflow-y-auto space-y-8 pr-2">
                                {loading ? (
                                    <div className="space-y-6">
                                        {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" />)}
                                    </div>
                                ) : dashboardStats.recentActivity.map((activity, i) => (
                                    <div key={i} className="flex gap-5 group/item">
                                        <div className="relative flex flex-col items-center">
                                            <div className={`w-3 h-3 rounded-full mt-2 ring-4 ring-slate-900 bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all duration-500 group-hover/item:scale-125`} />
                                            {i !== dashboardStats.recentActivity.length - 1 && (
                                                <div className="w-[1px] flex-grow bg-slate-800 my-2" />
                                            )}
                                        </div>
                                        <div className="pb-8">
                                            <p className="text-white font-bold leading-tight group-hover/item:text-primary transition-colors">{activity.title}</p>
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2 block">{activity.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Button className="w-full bg-white/10 hover:bg-white hover:text-slate-900 text-white font-bold text-xs uppercase tracking-widest py-6 rounded-2xl mt-6 transition-premium backdrop-blur-md">
                                Clear Feed
                            </Button>
                        </GlassTile>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}

