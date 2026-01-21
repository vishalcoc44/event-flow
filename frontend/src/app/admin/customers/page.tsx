'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { useCustomers } from '@/contexts/CustomerContext'
import { useBookings } from '@/contexts/BookingContext'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Users, Search, Activity, Filter, ArrowLeft, Mail, Phone, MapPin, Calendar, Clock, ChevronDown, UserCircle, ExternalLink, MoreVertical } from 'lucide-react'

export default function ViewCustomers() {
    const { customers, loading, error } = useCustomers()
    const { bookings } = useBookings()
    const { user } = useAuth()
    const router = useRouter()
    const [customerBookings, setCustomerBookings] = useState<Record<string, typeof bookings>>({})
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        const bookingsByCustomer = customers.reduce((acc, customer) => {
            acc[customer.id] = bookings.filter(booking => booking.user_id === customer.id)
            return acc
        }, {} as Record<string, typeof bookings>)
        setCustomerBookings(bookingsByCustomer)
    }, [customers, bookings])

    const getInitials = (firstName?: string, lastName?: string, email?: string) => {
        if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase()
        if (firstName) return firstName[0].toUpperCase()
        if (email) return email[0].toUpperCase()
        return 'U'
    }

    const filteredCustomers = customers.filter(c =>
        (c.first_name?.toLowerCase() + ' ' + c.last_name?.toLowerCase()).includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 260, damping: 20 }
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC] relative overflow-hidden">
            {/* Mesh Gradient Background */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
                <div className="absolute bottom-[0%] left-[-10%] w-[30%] h-[30%] rounded-full bg-purple-500/5 blur-[100px]" />
            </div>

            <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />

            <main className="flex-grow container mx-auto px-4 py-16 max-w-6xl relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-12"
                >
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-4">
                            <button
                                onClick={() => router.push('/admin/dashboard')}
                                className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors group font-bold text-xs uppercase tracking-widest"
                            >
                                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                                Admin Dashboard
                            </button>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-primary">
                                    <Users size={18} />
                                    <span className="text-xs font-bold uppercase tracking-widest">Our Customers</span>
                                </div>
                                <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Customer List</h1>
                                <p className="text-slate-500 text-lg">View and manage all registered customers in the system.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="relative flex-grow md:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <Input
                                    placeholder="Search Customers..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="h-14 pl-12 pr-4 rounded-[20px] bg-white border-slate-100 shadow-sm focus:ring-primary focus:border-primary transition-all text-base"
                                />
                            </div>
                            <Button variant="outline" className="h-14 px-6 rounded-[20px] border-slate-100 bg-white gap-2 text-slate-600 font-bold hidden sm:flex">
                                <Filter size={18} />
                                Filters
                            </Button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col justify-center items-center h-96 gap-4">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-slate-100 rounded-full" />
                                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
                            </div>
                            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs animate-pulse">Loading Customers...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-rose-50 border border-rose-100 p-10 rounded-[40px] text-center space-y-4">
                            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 mx-auto">
                                <Activity size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-rose-900 tracking-tight">Error Loading List</h3>
                            <p className="text-rose-600/80 max-w-md mx-auto">{error}</p>
                        </div>
                    ) : filteredCustomers.length === 0 ? (
                        <div className="text-center py-24 bg-white/40 backdrop-blur-sm rounded-[40px] border border-dashed border-slate-200">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-6">
                                <Search size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">No Customers Found</h3>
                            <p className="text-slate-500 mt-2">No customers match your search criteria.</p>
                            <Button
                                variant="link"
                                onClick={() => setSearchTerm('')}
                                className="mt-4 text-primary font-bold uppercase tracking-widest text-xs"
                            >
                                Clear Search
                            </Button>
                        </div>
                    ) : (
                        <motion.div
                            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                            initial="hidden"
                            animate="visible"
                            variants={containerVariants}
                        >
                            {filteredCustomers.map((customer) => (
                                <motion.div key={customer.id} variants={itemVariants}>
                                    <Card className="group rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 bg-white hover:border-primary/20 hover:shadow-primary/5 transition-all duration-500 overflow-hidden">
                                        <CardHeader className="p-8 border-b border-slate-50 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4">
                                                <Button variant="ghost" size="icon" className="rounded-full text-slate-300 hover:text-slate-900">
                                                    <MoreVertical size={18} />
                                                </Button>
                                            </div>
                                            <div className="flex items-center gap-6 relative z-10">
                                                <div className="relative">
                                                    <Avatar className="h-16 w-16 bg-slate-900 text-white rounded-2xl shadow-lg ring-4 ring-white shadow-slate-900/10">
                                                        <AvatarFallback className="text-xl font-black">
                                                            {getInitials(customer.first_name, customer.last_name, customer.email)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-emerald-500 border-4 border-white" />
                                                </div>
                                                <div className="min-w-0 flex-1 space-y-1">
                                                    <CardTitle className="text-xl font-bold text-slate-900 truncate tracking-tight">
                                                        {customer.first_name} {customer.last_name || ''}
                                                        {(!customer.first_name && !customer.last_name) && (customer.username || customer.email)}
                                                    </CardTitle>
                                                    <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                                                        <UserCircle size={12} />
                                                        ID: {customer.id.split('-')[0]}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="p-8">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-3 group/info">
                                                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover/info:bg-primary/10 group-hover/info:text-primary transition-colors">
                                                            <Mail size={14} />
                                                        </div>
                                                        <span className="text-sm font-medium text-slate-600 truncate">{customer.email}</span>
                                                    </div>

                                                    {customer.contact_number && (
                                                        <div className="flex items-center gap-3 group/info">
                                                            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover/info:bg-primary/10 group-hover/info:text-primary transition-colors">
                                                                <Phone size={14} />
                                                            </div>
                                                            <span className="text-sm font-medium text-slate-600">{customer.contact_number}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-4">
                                                    {customer.city && (
                                                        <div className="flex items-start gap-3 group/info">
                                                            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover/info:bg-primary/10 group-hover/info:text-primary transition-colors mt-0.5">
                                                                <MapPin size={14} />
                                                            </div>
                                                            <span className="text-sm font-medium text-slate-600 leading-tight">
                                                                {customer.city}
                                                                {customer.pincode && <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Sector: {customer.pincode}</span>}
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-3 group/info">
                                                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover/info:bg-primary/10 group-hover/info:text-primary transition-colors">
                                                            <Calendar size={14} />
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase tracking-[0.05em] text-slate-900 bg-slate-100 px-2 py-1 rounded-md">
                                                            {customerBookings[customer.id]?.length || 0} Bookings
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {customerBookings[customer.id]?.length > 0 && (
                                                <div className="mt-8 pt-6 border-t border-slate-50">
                                                    <Accordion type="single" collapsible className="w-full">
                                                        <AccordionItem value="bookings" className="border-none bg-slate-50/50 rounded-2xl px-6">
                                                            <AccordionTrigger className="py-4 hover:no-underline text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                                                View Booking History
                                                            </AccordionTrigger>
                                                            <AccordionContent className="pb-6">
                                                                <div className="space-y-3 mt-2">
                                                                    {customerBookings[customer.id].map((booking) => (
                                                                        <div key={booking.id} className="p-4 bg-white border border-slate-100 rounded-xl flex justify-between items-center group/item hover:border-primary/20 transition-all shadow-sm shadow-slate-100/50">
                                                                            <div className="min-w-0 flex-1 space-y-1">
                                                                                <p className="font-bold text-sm text-slate-900 truncate">
                                                                                    {booking.event?.title || 'Unknown Event'}
                                                                                </p>
                                                                                <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                                                    <div className="flex items-center gap-1">
                                                                                        <Calendar className="h-3 w-3" />
                                                                                        {booking.event?.date ? new Date(booking.event.date).toLocaleDateString() : 'N/A'}
                                                                                    </div>
                                                                                    <div className="flex items-center gap-1">
                                                                                        <Clock className="h-3 w-3" />
                                                                                        {booking.event?.time || 'N/A'}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center gap-3 pl-4">
                                                                                <Badge className={cn(
                                                                                    "text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest border-none pointer-events-none",
                                                                                    booking.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' :
                                                                                        booking.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                                                                            'bg-rose-100 text-rose-700'
                                                                                )}>
                                                                                    {booking.status}
                                                                                </Badge>
                                                                                <ExternalLink size={14} className="text-slate-300 group-hover/item:text-primary transition-colors cursor-pointer" />
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    </Accordion>
                                                </div>
                                            )}
                                        </CardContent>

                                        <CardFooter className="p-8 pt-0 flex justify-between items-center bg-slate-50/20">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
                                                <Activity size={12} className="text-emerald-500 shrink-0" />
                                                Joined: {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : 'N/A'}
                                            </div>
                                            <Button variant="ghost" className="text-xs font-bold text-primary gap-1 group/btn px-2">
                                                View Profile
                                                <ExternalLink size={12} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </motion.div>
            </main>

            <Footer />
        </div>
    )
}

