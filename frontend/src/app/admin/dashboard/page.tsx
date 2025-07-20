'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { useEvents } from '@/contexts/EventContext'
import { eventsAPI, bookingsAPI, categoriesAPI, authAPI } from '@/lib/api'
import { motion } from 'motion/react'
import { Dashboard3DCard, Activity3DCard, TableRow3DCard } from '@/components/ui/dashboard-3d-card'
import { CardHoverShadow, HoverShadowEffect } from '@/components/ui/hover-shadow-effect'

// Define types for dashboard data
type ActivityItem = {
    type: 'event' | 'user' | 'booking' | 'category' | 'admin'
    title: string
    time: string
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
    const { user } = useAuth()
    const { events } = useEvents()
    
    const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
        totalEvents: 0,
        totalBookings: 0,
        revenue: 0,
        newUsers: 0,
        recentActivity: [],
        recentBookings: []
    })
    
    const [loading, setLoading] = useState(true)
    
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true)
                
                // Fetch events count
                const eventsData = await eventsAPI.getAllEvents()
                const totalEvents = eventsData?.length || 0
                
                // Fetch bookings
                const bookingsData = await bookingsAPI.getAllBookings()
                const totalBookings = bookingsData?.length || 0
                
                // Calculate revenue from bookings
                let totalRevenue = 0
                if (bookingsData && bookingsData.length > 0) {
                    totalRevenue = bookingsData.reduce((sum, booking) => {
                        const eventPrice = booking.event?.price || 0
                        return sum + eventPrice
                    }, 0)
                }
                
                // Format recent bookings
                const recentBookingsData = bookingsData?.slice(0, 7).map(booking => ({
                    id: booking.id,
                    eventName: booking.event?.title || 'Unknown Event',
                    user: booking.user?.username || booking.user?.email || 'Unknown User',
                    date: booking.event?.date || new Date().toISOString().split('T')[0],
                    status: booking.status
                })) || []
                
                // Recent activity
                const recentActivity: ActivityItem[] = []
                
                // Add recent events to activity
                if (eventsData && eventsData.length > 0) {
                    const recentEvents = eventsData.slice(0, 3).map(event => ({
                        type: 'event' as const,
                        title: `New event "${event.title}" created`,
                        time: formatTimeAgo(new Date(event.created_at || Date.now()))
                    }))
                    recentActivity.push(...recentEvents)
                }
                
                // Add recent bookings to activity
                if (bookingsData && bookingsData.length > 0) {
                    const recentBookingActivities = bookingsData.slice(0, 2).map(booking => ({
                        type: 'booking' as const,
                        title: `Booking ID #${booking.id.substring(0, 8)} for "${booking.event?.title}" ${booking.status.toLowerCase()}`,
                        time: formatTimeAgo(new Date(booking.created_at || Date.now()))
                    }))
                    recentActivity.push(...recentBookingActivities)
                }
                
                // Sort activity by time
                recentActivity.sort((a, b) => {
                    return new Date(b.time).getTime() - new Date(a.time).getTime()
                })
                
                setDashboardStats({
                    totalEvents,
                    totalBookings,
                    revenue: totalRevenue,
                    newUsers: 0, // We'll keep this at 0 for now
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
    
    // Helper function to format time ago
    const formatTimeAgo = (date: Date): string => {
        const now = new Date()
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
        
        if (diffInSeconds < 60) {
            return 'just now'
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60)
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600)
            return `${hours} hour${hours > 1 ? 's' : ''} ago`
        } else {
            const days = Math.floor(diffInSeconds / 86400)
            return `${days} day${days > 1 ? 's' : ''} ago`
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />
            
            <main className="flex-grow container mx-auto px-4 py-8">
                <motion.div 
                    className="mb-8"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600">Overview of your event management system</p>
                </motion.div>
                
                {/* Stats Cards */}
                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
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
                        <Dashboard3DCard
                            title="Total Events"
                            value={loading ? '...' : dashboardStats.totalEvents}
                            description="Total events in the system"
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                            }
                        />
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <Dashboard3DCard
                            title="Total Bookings"
                            value={loading ? '...' : dashboardStats.totalBookings}
                            description="Total bookings made"
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                </svg>
                            }
                        />
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <Dashboard3DCard
                            title="Revenue Generated"
                            value={loading ? '...' : `$${dashboardStats.revenue}`}
                            description="Total revenue from bookings"
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                </svg>
                            }
                        />
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <Dashboard3DCard
                            title="New Users"
                            value={loading ? '...' : dashboardStats.newUsers}
                            description="New user registrations"
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                </svg>
                            }
                        />
                    </motion.div>
                </motion.div>
                
                <motion.div 
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                >
                    {/* Recent Activity */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <h2 className="text-xl font-semibold mb-4 text-gray-900">Recent Activity</h2>
                        <HoverShadowEffect className="overflow-hidden bg-white border border-gray-200 rounded-2xl p-6 cursor-pointer" shadowColor="rgba(0,0,0,0.15)" shadowIntensity={0.2}>
                            <Card className="overflow-hidden border-0 shadow-none">
                            {loading ? (
                                <div className="p-4 text-center">Loading activity data...</div>
                            ) : dashboardStats.recentActivity.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">No recent activity</div>
                            ) : (
                            <div className="divide-y divide-gray-200">
                                {dashboardStats.recentActivity.map((activity, index) => (
                                    <motion.div 
                                        key={index} 
                                        className="p-4 flex items-start hover:bg-gray-50 rounded-lg transition-colors duration-200"
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        whileHover={{ 
                                            x: 5,
                                            transition: { duration: 0.2 }
                                        }}
                                    >
                                        <div className="mr-4">
                                            {activity.type === 'event' && (
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                            {activity.type === 'user' && (
                                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                            {activity.type === 'booking' && (
                                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                            {activity.type === 'category' && (
                                                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                            {activity.type === 'admin' && (
                                                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-800">{activity.title}</p>
                                            <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            )}
                            </Card>
                        </HoverShadowEffect>
                    </motion.div>
                    
                    {/* Recent Event Bookings */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">Recent Event Bookings</h2>
                            <Link href="/admin/bookings">
                            <Button variant="outline" size="sm">
                                    View All
                            </Button>
                            </Link>
                        </div>
                        <HoverShadowEffect className="overflow-hidden bg-white border border-gray-200 rounded-2xl p-6 cursor-pointer" shadowColor="rgba(0,0,0,0.15)" shadowIntensity={0.2}>
                            <Card className="overflow-hidden border-0 shadow-none">
                            {loading ? (
                                <div className="p-4 text-center">Loading booking data...</div>
                            ) : dashboardStats.recentBookings.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">No bookings found</div>
                            ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Booking ID
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Event Name
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                User
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {dashboardStats.recentBookings.map((booking, index) => (
                                            <motion.tr 
                                                key={booking.id}
                                                className="hover:bg-gray-50 transition-colors duration-200"
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                                whileHover={{ 
                                                    scale: 1.01,
                                                    transition: { duration: 0.2 }
                                                }}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {booking.id.substring(0, 8)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {booking.eventName}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {booking.user}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(booking.date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 
                                                            booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {booking.status}
                                                    </span>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            )}
                            </Card>
                        </HoverShadowEffect>
                    </motion.div>
                </motion.div>
            </main>
            
            <Footer />
        </div>
    )
} 