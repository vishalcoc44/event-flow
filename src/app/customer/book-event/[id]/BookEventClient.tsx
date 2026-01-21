'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { useEvents } from '@/contexts/EventContext'
import { useBookings } from '@/contexts/BookingContext'
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, DollarSign, Users, ArrowLeft, Plus, Minus, CheckCircle, Ticket } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { GlassTile } from '@/components/ui/glass-tile'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

type Event = {
    id: string
    title: string
    description: string
    date: string
    time: string
    location: string
    price: number
    image_url?: string
    category?: {
        name: string
    }
}

type TicketType = {
    id: string
    name: string
    description: string | null
    price: number
    currency: string
    quantity_available: number | null
    is_active: boolean
    sale_starts_at: string | null
    sale_ends_at: string | null
}

export default function BookEventClient() {
    const params = useParams()
    const router = useRouter()
    const searchParams = useSearchParams()
    const { user } = useAuth()
    const { events, loading: eventsLoading } = useEvents()
    const { addBooking } = useBookings()

    const [event, setEvent] = useState<Event | null>(null)
    const [ticketCount, setTicketCount] = useState(1)
    const [loading, setLoading] = useState(false)
    const [bookingSuccess, setBookingSuccess] = useState(false)
    const [ticketTypes, setTicketTypes] = useState<TicketType[]>([])
    const [selectedTicketTypeId, setSelectedTicketTypeId] = useState<string | null>(null)

    useEffect(() => {
        if (params.id && events) {
            const foundEvent = events.find(e => e.id === params.id)
            if (foundEvent) {
                setEvent(foundEvent)
            }
        }
    }, [params.id, events])

    useEffect(() => {
        const loadTicketTypes = async () => {
            if (!params.id) return
            const { data, error } = await supabase
                .from('ticket_types')
                .select('id, name, description, price, currency, quantity_available, is_active, sale_starts_at, sale_ends_at')
                .eq('event_id', params.id)
                .eq('is_active', true)
                .order('price', { ascending: true })

            if (error) {
                console.error('Failed to load ticket types:', error)
                setTicketTypes([])
                return
            }

            const types = (data || []).map((t: any) => ({
                ...t,
                price: Number(t.price ?? 0),
            })) as TicketType[]
            setTicketTypes(types)

            const fromQuery = searchParams.get('ticketTypeId')
            if (fromQuery && types.some(t => t.id === fromQuery)) {
                setSelectedTicketTypeId(fromQuery)
                return
            }
            if (!selectedTicketTypeId && types.length > 0) {
                setSelectedTicketTypeId(types[0].id)
            }
        }

        loadTicketTypes()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id])

    const handleTicketChange = (increment: boolean) => {
        if (increment) {
            setTicketCount(prev => Math.min(prev + 1, 10))
        } else {
            setTicketCount(prev => Math.max(prev - 1, 1))
        }
    }

    const selectedTicketType = ticketTypes.find(t => t.id === selectedTicketTypeId) || null
    const unitPrice = selectedTicketType ? selectedTicketType.price : (event?.price || 0)
    const totalPrice = event ? unitPrice * ticketCount : 0

    const handleBooking = async () => {
        if (!user || !event) return

        setLoading(true)
        try {
            for (let i = 0; i < ticketCount; i++) {
                await addBooking(event.id, selectedTicketTypeId)
            }

            setBookingSuccess(true)
            toast({
                title: "Booking Successful!",
                description: `You've successfully booked ${ticketCount} ticket(s) for ${event.title}`,
            })

            setTimeout(() => {
                router.push('/customer/bookings')
            }, 2500)
        } catch (error) {
            console.error('Booking error:', error)
            toast({
                title: "Booking Failed",
                description: "There was an error processing your booking. Please try again.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    if (eventsLoading) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />
                <main className="flex-grow flex items-center justify-center">
                    <motion.div
                        className="w-16 h-16 border-4 border-t-blue-500 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                </main>
                <Footer />
            </div>
        )
    }

    if (!event) return null

    if (bookingSuccess) {
        return (
            <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
                <div className="absolute inset-0 z-[-1] opacity-30 pointer-events-none">
                    <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-green-400/20 blur-[120px]" />
                </div>
                <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />
                <main className="flex-grow flex items-center justify-center px-4">
                    <GlassTile className="p-12 max-w-xl text-center" interactive={false}>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-500/40"
                        >
                            <CheckCircle className="h-12 w-12 text-white" />
                        </motion.div>
                        <h1 className="text-4xl font-black tracking-tighter mb-4">You're Going!</h1>
                        <p className="text-xl text-neutral-500 mb-8 font-medium">
                            Successfully booked {ticketCount} {ticketCount > 1 ? 'tickets' : 'ticket'} for <br />
                            <span className="text-foreground font-bold">{event.title}</span>
                        </p>
                        <div className="py-4 px-6 rounded-2xl bg-neutral-100 dark:bg-black/40 border border-neutral-200 dark:border-white/5 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-neutral-400">
                            Redirecting to your digital vault...
                        </div>
                    </GlassTile>
                </main>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-background relative overflow-x-hidden">
            {/* Mesh Background */}
            <div className="fixed inset-0 z-[-1] opacity-30 dark:opacity-20 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-400/20 blur-[120px]" />
            </div>

            <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />

            <main className="flex-grow pt-32 pb-20">
                <div className="container mx-auto px-4 max-w-6xl">
                    <Link href={`/events/${event.id}`} className="inline-flex items-center text-sm font-bold uppercase tracking-widest text-neutral-500 hover:text-blue-500 transition-colors mb-8 group">
                        <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
                        Return to Event
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                        {/* Summary Column */}
                        <motion.div
                            className="lg:col-span-7"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 leading-[0.9]">
                                Secure Your Experience.
                            </h1>

                            <GlassTile className="p-0 overflow-hidden" interactive={false}>
                                <div className="relative h-64">
                                    <img
                                        src={event.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop'}
                                        alt={event.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                    <div className="absolute bottom-8 left-8 right-8">
                                        <div className="flex gap-2 mb-3">
                                            {event.category && (
                                                <span className="px-3 py-1 rounded-lg bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest">
                                                    {event.category.name}
                                                </span>
                                            )}
                                        </div>
                                        <h2 className="text-3xl font-bold text-white tracking-tight">{event.title}</h2>
                                    </div>
                                </div>
                                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4 group">
                                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 transition-colors">
                                                <Calendar className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Date</div>
                                                <div className="text-sm font-bold">
                                                    {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 group">
                                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                <Clock className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Check-in</div>
                                                <div className="text-sm font-bold">{event.time}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4 group">
                                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                <MapPin className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Venue</div>
                                                <div className="text-sm font-bold">{event.location}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 group">
                                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                <Ticket className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Entry</div>
                                                <div className="text-sm font-bold">{selectedTicketType?.name || 'Standard Pass'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </GlassTile>
                        </motion.div>

                        {/* Checkout Column */}
                        <motion.div
                            className="lg:col-span-5"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <GlassTile className="p-10" interactive={false}>
                                <h3 className="text-2xl font-black tracking-tighter mb-8">Checkout Summary</h3>

                                <div className="space-y-10">
                                    {/* Ticket Type Selector */}
                                    {ticketTypes.length > 0 && (
                                        <div className="space-y-4">
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Ticket Tier</div>
                                            <div className="grid grid-cols-1 gap-3">
                                                {ticketTypes.map(tt => {
                                                    const active = tt.id === selectedTicketTypeId
                                                    return (
                                                        <button
                                                            key={tt.id}
                                                            type="button"
                                                            onClick={() => setSelectedTicketTypeId(tt.id)}
                                                            className={cn(
                                                                'p-4 rounded-3xl border text-left transition-all',
                                                                active
                                                                    ? 'border-blue-500/40 bg-blue-500/10'
                                                                    : 'border-neutral-200 dark:border-white/10 bg-white/40 dark:bg-black/40 hover:bg-white/60 dark:hover:bg-black/50'
                                                            )}
                                                        >
                                                            <div className="flex items-center justify-between gap-3">
                                                                <div>
                                                                    <div className="text-sm font-black tracking-tight">{tt.name}</div>
                                                                    {tt.description && (
                                                                        <div className="text-xs text-neutral-500 font-medium mt-1 line-clamp-2">{tt.description}</div>
                                                                    )}
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="text-sm font-black text-blue-500">
                                                                        {tt.price === 0 ? 'Free' : `$${tt.price}`}
                                                                    </div>
                                                                    <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                                                                        {tt.currency}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Ticket Selector */}
                                    <div className="space-y-4">
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Quantity</div>
                                        <div className="flex items-center justify-between p-4 rounded-3xl bg-neutral-100 dark:bg-black/40 border border-neutral-200 dark:border-white/5">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleTicketChange(false)}
                                                disabled={ticketCount <= 1}
                                                className="w-12 h-12 rounded-2xl hover:bg-white dark:hover:bg-white/10"
                                            >
                                                <Minus className="h-5 w-5" />
                                            </Button>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-4xl font-black">{ticketCount}</span>
                                                <span className="text-sm font-bold text-neutral-400">PCS</span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleTicketChange(true)}
                                                disabled={ticketCount >= 10}
                                                className="w-12 h-12 rounded-2xl hover:bg-white dark:hover:bg-white/10"
                                            >
                                                <Plus className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Billing Breakdown */}
                                    <div className="space-y-4 border-t border-neutral-100 dark:border-white/5 pt-8">
                                        <div className="flex justify-between items-center text-sm font-medium">
                                            <span className="text-neutral-500">{(selectedTicketType?.name || 'Standard Base')} (×{ticketCount})</span>
                                            <span className="font-bold">${unitPrice * ticketCount}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm font-medium">
                                            <span className="text-neutral-500">Platform Fee</span>
                                            <span className="text-blue-500 font-bold">FREE</span>
                                        </div>
                                        <div className="flex justify-between items-end pt-4">
                                            <div>
                                                <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Total Amount</div>
                                                <div className="text-5xl font-black tracking-tighter">${totalPrice}</div>
                                            </div>
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 pb-2">USD</div>
                                        </div>
                                    </div>

                                    {/* Action */}
                                    <div className="space-y-4">
                                        <Button
                                            onClick={handleBooking}
                                            disabled={loading}
                                            className="w-full h-20 rounded-[1.75rem] bg-black dark:bg-white text-white dark:text-black text-xl font-black tracking-tight hover:scale-[1.02] transition-transform shadow-xl shadow-black/10 dark:shadow-white/10"
                                        >
                                            {loading ? (
                                                <motion.div
                                                    className="w-6 h-6 border-3 border-white dark:border-black border-t-transparent rounded-full"
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                />
                                            ) : (
                                                `Complete Reservation`
                                            )}
                                        </Button>
                                        <p className="text-[10px] text-center text-neutral-400 font-bold uppercase tracking-widest leading-relaxed">
                                            Non-refundable • Digital Assets ONLY<br /> Terms of Service Apply
                                        </p>
                                    </div>
                                </div>
                            </GlassTile>

                            {/* Trust Badge */}
                            <div className="mt-8 flex items-center justify-center gap-3 text-neutral-400">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Encrypted Checkout • Powered by Stripe</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
