'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useBookings } from '@/contexts/BookingContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useToast } from '@/components/ui/use-toast'
import { Calendar, Clock, MapPin, DollarSign, Search, Filter, Ticket, ArrowRight, XCircle, CheckCircle2, AlertCircle, RefreshCcw, MessageSquare, QrCode, CalendarPlus, ExternalLink, Download, Image as ImageIcon } from 'lucide-react'
import { GlassTile } from '@/components/ui/glass-tile'
import { cn } from '@/lib/utils'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { QRCodeCanvas } from 'qrcode.react'
import { generateGoogleCalendarUrl, downloadIcsFile } from '@/lib/calendar'
import html2canvas from 'html2canvas'

export default function CustomerBookings() {
    const { user } = useAuth()
    const { bookings, loading, error, cancelBooking, requestRefund } = useBookings()
    const { toast } = useToast()
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [cancellingId, setCancellingId] = useState<string | null>(null)
    const [userBookings, setUserBookings] = useState<any[]>([])

    // Refund state
    const [showRefundDialog, setShowRefundDialog] = useState(false)
    const [selectedGroup, setSelectedGroup] = useState<any>(null)
    const [refundReason, setRefundReason] = useState('')
    const [isSubmittingRefund, setIsSubmittingRefund] = useState(false)

    // Ticket state
    const [showTicketDialog, setShowTicketDialog] = useState(false)
    const [viewingTicket, setViewingTicket] = useState<any>(null)
    const ticketRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (user && bookings) {
            const currentUserBookings = bookings.filter(booking => booking.user_id === user.id)
            setUserBookings(currentUserBookings)
        }
    }, [user, bookings])

    const groupedBookings = userBookings.reduce((groups: any[], booking) => {
        const eventId = booking.event?.id
        if (!eventId) return groups

        // Group by event AND status AND ticket type to prevent merging inconsistent states (Bug #6)
        const existingGroup = groups.find(group =>
            group.eventId === eventId &&
            group.status === booking.status &&
            group.ticketTypeId === booking.ticket_type_id
        )

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
                status: booking.status,
                ticketTypeId: booking.ticket_type_id,
                firstBookingId: booking.id,
                bookedAt: booking.created_at,
                qrToken: booking.qr_code_token
            })
        }
        return groups
    }, [])

    const filteredBookings = groupedBookings.filter(group => {
        const title = group.event?.title || ''
        const location = group.event?.location || ''
        const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            location.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === 'all' || group.status.toLowerCase() === statusFilter.toLowerCase()
        return matchesSearch && matchesStatus
    }).sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime())

    const handleCancelBooking = async (bookingGroup: any) => {
        try {
            setCancellingId(bookingGroup.firstBookingId)
            // Cancel all exactly as requested in current UI flow
            const cancelPromises = bookingGroup.bookings.map((booking: any) => cancelBooking(booking.id))
            await Promise.all(cancelPromises)
            toast({
                title: "Reservation Retracted",
                description: `Successfully cancelled ${bookingGroup.quantity} ticket(s) for ${bookingGroup.event?.title}`,
            })
        } catch (error: any) {
            toast({
                title: "Action Failed",
                description: error.message || "Unable to process cancellation",
                variant: "destructive",
            })
        } finally {
            setCancellingId(null)
        }
    }

    const handleRequestRefund = async () => {
        if (!selectedGroup || !refundReason.trim()) return

        setIsSubmittingRefund(true)
        try {
            // Fix Bug #4: Request refund for ALL bookings in the group
            const refundPromises = selectedGroup.bookings.map((booking: any) =>
                requestRefund(booking.id, refundReason)
            )
            await Promise.all(refundPromises)

            toast({
                title: "Refund Requested",
                description: `Submitted ${selectedGroup.quantity} request(s) for ${selectedGroup.event?.title} to the organizer.`,
            })
            setShowRefundDialog(false)
            setRefundReason('')
            setSelectedGroup(null)
        } catch (error: any) {
            toast({
                title: "Request Failed",
                description: error.message || "Unable to submit refund request.",
                variant: "destructive"
            })
        } finally {
            setIsSubmittingRefund(false)
        }
    }

    const handleViewTicket = (group: any) => {
        setViewingTicket(group)
        setShowTicketDialog(true)
    }

    const handleDownloadImage = async () => {
        if (!ticketRef.current) return
        try {
            const canvas = await html2canvas(ticketRef.current, {
                backgroundColor: null,
                scale: 2,
                logging: false,
                useCORS: true // Important for external images if any
            })
            const image = canvas.toDataURL("image/png")
            const link = document.createElement("a")
            link.href = image
            link.download = `${viewingTicket?.event?.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'ticket'}-pass.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            toast({
                title: "Ticket Downloaded",
                description: "The ticket image has been saved to your device."
            })
        } catch (error) {
            console.error('Download failed:', error)
            toast({
                title: "Download Failed",
                description: "Could not generate ticket image.",
                variant: "destructive"
            })
        }
    }

    const getStatusConfig = (status: string) => {
        switch (status.toUpperCase()) {
            case 'CONFIRMED':
                return { label: 'Confirmed', icon: CheckCircle2, class: 'bg-green-500/10 text-green-500 border-green-500/20' }
            case 'PENDING':
                return { label: 'Pending', icon: AlertCircle, class: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' }
            case 'CANCELLED':
                return { label: 'Cancelled', icon: XCircle, class: 'bg-red-500/10 text-red-500 border-red-500/20' }
            default:
                return { label: status, icon: AlertCircle, class: 'bg-neutral-500/10 text-neutral-500 border-neutral-500/20' }
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-background relative overflow-x-hidden">
            {/* Mesh Background */}
            <div className="fixed inset-0 z-[-1] opacity-30 dark:opacity-20 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-400/20 blur-[120px]" />
            </div>

            {!showTicketDialog && <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />}

            <main className="flex-grow pt-32 pb-20">
                <div className="container mx-auto px-4 max-w-7xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8"
                    >
                        <div>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-2 leading-[0.9]">
                                Digital Vault.
                            </h1>
                            <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">
                                Your curated collection of upcoming experiences
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 flex-grow md:flex-grow-0 md:max-w-xl">
                            <div className="relative flex-grow">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                <Input
                                    placeholder="Search your vault..."
                                    className="h-12 pl-12 rounded-2xl bg-white/40 dark:bg-white/5 border-white/60 dark:border-white/5 font-bold focus:ring-blue-500/20"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="h-12 px-6 rounded-2xl bg-white/40 dark:bg-white/5 border-white/60 dark:border-white/5 font-bold uppercase tracking-widest text-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                >
                                    <option value="all">Global State</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="pending">Pending</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>
                    </motion.div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <motion.div
                                className="w-16 h-16 border-4 border-t-blue-500 rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                        </div>
                    ) : filteredBookings.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-24"
                        >
                            <GlassTile className="p-16 max-w-2xl mx-auto" interactive={false}>
                                <div className="w-20 h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center text-blue-500 mx-auto mb-8">
                                    <Ticket className="h-10 w-10" />
                                </div>
                                <h3 className="text-2xl font-black tracking-tighter mb-4">Vault Empty</h3>
                                <p className="text-neutral-500 mb-10 font-medium">
                                    {searchTerm || statusFilter !== 'all'
                                        ? "No reservations match your current scan parameters."
                                        : "You haven't acquired any experience passes yet."}
                                </p>
                                <Button asChild className="h-14 px-8 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-black tracking-tight hover:scale-[1.02] transition-transform shadow-xl">
                                    <Link href="/events">Explore the Collection</Link>
                                </Button>
                                {(searchTerm || statusFilter !== 'all') && (
                                    <Button
                                        variant="ghost"
                                        onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                                        className="h-14 px-8 rounded-2xl font-bold uppercase tracking-widest text-[10px] ml-4"
                                    >
                                        Clear Scan
                                    </Button>
                                )}
                            </GlassTile>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <AnimatePresence mode="popLayout">
                                {filteredBookings.map((group, index) => {
                                    const status = getStatusConfig(group.status)
                                    return (
                                        <motion.div
                                            key={group.eventId}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.6, delay: index * 0.05 }}
                                            layout
                                        >
                                            <GlassTile className="p-0 overflow-hidden flex flex-col h-full" interactive={true} hoverScale={1.01}>
                                                <Link href={`/events/${group.eventId}`} className="flex flex-col flex-grow group/card">
                                                    <div className="relative h-48 overflow-hidden">
                                                        <img
                                                            src={group.event?.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop'}
                                                            alt={group.event?.title}
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                                                        <div className="absolute top-4 right-4">
                                                            <Badge className={cn("px-3 py-1.5 rounded-xl backdrop-blur-md border font-black tracking-tighter uppercase text-[10px]", status.class)}>
                                                                <status.icon className="h-3 w-3 mr-1.5" />
                                                                {status.label}
                                                            </Badge>
                                                        </div>

                                                        <div className="absolute bottom-4 left-4 right-4">
                                                            <div className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                                                                Pass Holder ID: {group.firstBookingId.slice(0, 8)}
                                                            </div>
                                                            <h3 className="text-xl font-bold text-white tracking-tight leading-tight">
                                                                {group.event?.title}
                                                            </h3>
                                                        </div>
                                                    </div>

                                                    <div className="p-6 space-y-4 flex-grow">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-1">
                                                                <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Date</div>
                                                                <div className="text-sm font-bold flex items-center gap-1.5">
                                                                    <Calendar className="h-3.5 w-3.5 text-blue-500" />
                                                                    {new Date(group.event?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                                </div>
                                                            </div>
                                                            <div className="space-y-1 text-right">
                                                                <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Time</div>
                                                                <div className="text-sm font-bold flex items-center justify-end gap-1.5">
                                                                    <Clock className="h-3.5 w-3.5 text-blue-500" />
                                                                    {group.event?.time}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-1 pt-2 border-t border-neutral-100 dark:border-white/5">
                                                            <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Location</div>
                                                            <div className="text-sm font-bold flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                                                                <MapPin className="h-3.5 w-3.5 text-blue-500" />
                                                                <span className="truncate">{group.event?.location}</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between pt-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Quantity</span>
                                                                <span className="text-lg font-black tracking-tight">{group.quantity} Passes</span>
                                                            </div>
                                                            <div className="flex flex-col text-right">
                                                                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Investment</span>
                                                                <span className="text-lg font-black tracking-tight text-blue-500">${group.totalPrice}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>

                                                <div className="p-6 pt-0 flex gap-3">
                                                    {group.status === 'CONFIRMED' ? (
                                                        <Button
                                                            onClick={() => handleViewTicket(group)}
                                                            className="flex-grow h-12 rounded-xl bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-[10px] shadow-xl"
                                                        >
                                                            <QrCode className="h-4 w-4 mr-2" />
                                                            View Ticket
                                                        </Button>
                                                    ) : (
                                                        <Link href={`/events/${group.eventId}`} className="flex-grow">
                                                            <Button variant="outline" className="w-full h-12 rounded-xl border-neutral-200 dark:border-white/10 font-bold uppercase tracking-widest text-[10px] hover:bg-neutral-50 dark:hover:bg-white/5">
                                                                Details <ArrowRight className="h-3.5 w-3.5 ml-2" />
                                                            </Button>
                                                        </Link>
                                                    )}

                                                    {group.status === 'CONFIRMED' && (
                                                        <Button
                                                            variant="ghost"
                                                            onClick={() => {
                                                                setSelectedGroup(group)
                                                                setShowRefundDialog(true)
                                                            }}
                                                            className="h-12 px-4 rounded-xl text-neutral-400 hover:text-blue-500 hover:bg-blue-500/10 font-bold text-[10px] uppercase tracking-widest"
                                                        >
                                                            <RefreshCcw className="h-4 w-4 mr-2" />
                                                            Refund
                                                        </Button>
                                                    )}

                                                    {group.status !== 'CANCELLED' && (
                                                        <Button
                                                            variant="ghost"
                                                            onClick={() => handleCancelBooking(group)}
                                                            disabled={cancellingId === group.firstBookingId}
                                                            className="h-12 w-12 rounded-xl text-neutral-400 hover:text-red-500 hover:bg-red-500/10"
                                                        >
                                                            {cancellingId === group.firstBookingId ? (
                                                                <motion.div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                                                            ) : (
                                                                <XCircle className="h-5 w-5" />
                                                            )}
                                                        </Button>
                                                    )}
                                                </div>
                                            </GlassTile>
                                        </motion.div>
                                    )
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </main>

            <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
                <DialogContent className="rounded-3xl border-white/20 backdrop-blur-2xl bg-background/80 max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-black tracking-tighter uppercase">Request Refund.</DialogTitle>
                        <DialogDescription className="font-bold text-neutral-500 uppercase tracking-widest text-[10px]">
                            Event: {selectedGroup?.event?.title}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 pt-4">
                        <div className="space-y-2">
                            <Label className="uppercase tracking-[0.2em] text-[10px] font-black opacity-50 flex items-center gap-2">
                                <MessageSquare className="h-3 w-3" /> Reason for Refund
                            </Label>
                            <Textarea
                                value={refundReason}
                                onChange={(e) => setRefundReason(e.target.value)}
                                placeholder="Why are you requesting a refund? (e.g., change of plans, event reschedule...)"
                                className="min-h-[120px] rounded-2xl bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 font-bold p-6 focus:ring-blue-500/50"
                            />
                        </div>
                        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                            Refund requests are subject to organizer approval. You will be notified once a decision is made.
                        </div>
                    </div>
                    <DialogFooter className="pt-8">
                        <Button variant="ghost" onClick={() => setShowRefundDialog(false)} className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px]">Cancel</Button>
                        <Button
                            onClick={handleRequestRefund}
                            disabled={isSubmittingRefund || !refundReason.trim()}
                            className="h-14 px-8 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-500/20"
                        >
                            {isSubmittingRefund ? "Submitting..." : "Submit Request"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showTicketDialog} onOpenChange={setShowTicketDialog}>
                <DialogContent className="rounded-[2rem] border-white/20 backdrop-blur-2xl bg-white dark:bg-neutral-950 p-0 overflow-hidden max-w-sm max-h-[90vh] flex flex-col">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Your Entry Pass</DialogTitle>
                        <DialogDescription>Scan this QR code at the event entrance</DialogDescription>
                    </DialogHeader>
                    <div className="overflow-y-auto flex-grow">
                        <div className="p-8 text-center space-y-6 bg-white dark:bg-neutral-950" ref={ticketRef}>
                            <div className="space-y-2">
                                <h2 className="text-3xl font-black tracking-tighter uppercase leading-none text-center">Your Entry Pass.</h2>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-500 text-center">Scan at the event entrance</p>
                            </div>

                            <div className="bg-white p-6 rounded-[2rem] shadow-2xl inline-block border-8 border-neutral-100 dark:border-white/5 mx-auto">
                                {viewingTicket?.qrToken ? (
                                    <QRCodeCanvas
                                        value={viewingTicket.qrToken}
                                        size={200}
                                        level="H"
                                        includeMargin={false}
                                    />
                                ) : (
                                    <div className="w-[200px] h-[200px] flex items-center justify-center bg-neutral-50 rounded-xl">
                                        <AlertCircle className="h-12 w-12 text-neutral-300 animate-pulse" />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 pt-4">
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">Pass Holder</div>
                                    <div className="text-lg font-bold">{user?.first_name} {user?.last_name}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 border-t border-neutral-100 dark:border-white/5 pt-4">
                                    <div className="text-left">
                                        <div className="text-[8px] font-black uppercase tracking-widest text-neutral-400 mb-1">Event</div>
                                        <div className="text-xs font-bold truncate">{viewingTicket?.event?.title}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[8px] font-black uppercase tracking-widest text-neutral-400 mb-1">Passes</div>
                                        <div className="text-xs font-bold">{viewingTicket?.quantity} PCS</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-neutral-50 dark:bg-white/5 p-6 space-y-3 shrink-0">
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                onClick={() => {
                                    const start = new Date(`${viewingTicket.event.date}T${viewingTicket.event.time}`)
                                    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000)
                                    const url = generateGoogleCalendarUrl({
                                        title: viewingTicket.event.title,
                                        description: viewingTicket.event.description || `Ticket for ${viewingTicket.event.title}`,
                                        location: viewingTicket.event.location || 'TBA',
                                        startTime: start,
                                        endTime: end
                                    })
                                    window.open(url, '_blank')
                                }}
                                variant="outline"
                                className="font-black uppercase tracking-widest text-[8px] h-10 rounded-xl border-neutral-200 dark:border-white/10"
                            >
                                <ExternalLink className="h-3 w-3 mr-2" />
                                Google Cal
                            </Button>
                            <Button
                                onClick={() => {
                                    const start = new Date(`${viewingTicket.event.date}T${viewingTicket.event.time}`)
                                    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000)
                                    downloadIcsFile({
                                        title: viewingTicket.event.title,
                                        description: viewingTicket.event.description || `Ticket for ${viewingTicket.event.title}`,
                                        location: viewingTicket.event.location || 'TBA',
                                        startTime: start,
                                        endTime: end
                                    })
                                }}
                                variant="outline"
                                className="font-black uppercase tracking-widest text-[8px] h-10 rounded-xl border-neutral-200 dark:border-white/10"
                            >
                                <Download className="h-3 w-3 mr-2" />
                                .iCal File
                            </Button>
                        </div>
                        <Button
                            onClick={handleDownloadImage}
                            variant="outline"
                            className="w-full font-black uppercase tracking-widest text-[8px] h-10 rounded-xl border-neutral-200 dark:border-white/10"
                        >
                            <ImageIcon className="h-3 w-3 mr-2" />
                            Download Image
                        </Button>
                        <Button variant="ghost" onClick={() => setShowTicketDialog(false)} className="w-full font-black uppercase tracking-widest text-[10px] hover:bg-neutral-200 dark:hover:bg-white/10 h-10 rounded-xl">
                            Close Pass
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Footer />
        </div>
    )
}