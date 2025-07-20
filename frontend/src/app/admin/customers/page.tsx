'use client'

import { useState, useEffect } from 'react'
import { useCustomers } from '@/contexts/CustomerContext'
import { useBookings } from '@/contexts/BookingContext'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { Mail, Phone, MapPin, Calendar, Clock } from 'lucide-react'
import { HoverShadowEffect } from '@/components/ui/hover-shadow-effect'

export default function ViewCustomers() {
    const { customers, loading, error } = useCustomers()
    const { bookings } = useBookings()
    const { user } = useAuth()
    const [customerBookings, setCustomerBookings] = useState<Record<string, typeof bookings>>({})

    useEffect(() => {
        // Group bookings by customer
        const bookingsByCustomer = customers.reduce((acc, customer) => {
            acc[customer.id] = bookings.filter(booking => booking.user_id === customer.id)
            return acc
        }, {} as Record<string, typeof bookings>)
        setCustomerBookings(bookingsByCustomer)
    }, [customers, bookings])

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
                    <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
                    <p className="text-gray-600">Manage and view all registered customers</p>
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
                        <p>Error loading customers: {error}</p>
                    </div>
                ) : customers.length === 0 ? (
                    <div className="text-center py-12">
                        <h3 className="text-xl font-medium text-gray-600 mb-4">No customers found</h3>
                        <p className="text-gray-500">There are no registered customers in the system yet.</p>
                    </div>
                ) : (
                    <motion.div 
                        className="space-y-6"
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                    >
                        {customers.map((customer) => (
                            <motion.div key={customer.id} variants={itemVariants}>
                                <HoverShadowEffect className="cursor-pointer" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.15} hoverScale={1.02} hoverLift={-1} transitionDuration={150}>
                                    <Card className="overflow-hidden border border-gray-200 shadow-sm">
                                    <CardHeader className="bg-white border-b">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-12 w-12 bg-[#6CDAEC] text-white">
                                                <AvatarFallback>
                                                    {getInitials(customer.first_name, customer.last_name, customer.email)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <CardTitle className="text-lg font-semibold text-gray-900">
                                                    {customer.first_name} {customer.last_name || ''}
                                                    {(!customer.first_name && !customer.last_name) && (customer.username || customer.email)}
                                                </CardTitle>
                                                <p className="text-sm text-gray-500">
                                                    Customer since {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    
                                    <CardContent className="pt-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-gray-500" />
                                                    <span className="text-gray-700">{customer.email}</span>
                                                </div>
                                                
                                                {customer.contact_number && (
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="h-4 w-4 text-gray-500" />
                                                        <span className="text-gray-700">{customer.contact_number}</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="space-y-3">
                                                {customer.city && (
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-gray-500" />
                                                        <span className="text-gray-700">
                                                            {customer.street_address && `${customer.street_address}, `}
                                                            {customer.city}
                                                            {customer.pincode && `, ${customer.pincode}`}
                                                        </span>
                                                    </div>
                                                )}
                                                
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-gray-500" />
                                                    <span className="text-gray-700">
                                                        {customerBookings[customer.id]?.length || 0} bookings
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {customerBookings[customer.id]?.length > 0 && (
                                            <div className="mt-6">
                                                <Accordion type="single" collapsible className="w-full">
                                                    <AccordionItem value="bookings" className="border-b-0">
                                                        <AccordionTrigger className="py-2 text-gray-900">
                                                            Booking History
                                                        </AccordionTrigger>
                                                        <AccordionContent>
                                                            <div className="space-y-3 mt-2">
                                                                {customerBookings[customer.id].map((booking) => (
                                                                    <div key={booking.id} className="p-3 bg-gray-50 rounded-md">
                                                                        <div className="flex justify-between items-start">
                                                                            <div>
                                                                                <p className="font-medium text-gray-900">
                                                                                    {booking.event?.title || 'Unknown Event'}
                                                                                </p>
                                                                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
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
                                                                            <Badge className={
                                                                                booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 
                                                                                booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                                                                                'bg-red-100 text-red-800'
                                                                            }>
                                                                                {booking.status}
                                                                            </Badge>
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
                                </Card>
                                </HoverShadowEffect>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </main>
            
            <Footer />
        </div>
    )
}

