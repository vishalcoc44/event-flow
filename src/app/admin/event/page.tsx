'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEvents } from '@/contexts/EventContext'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Trash2, Edit, Calendar, MapPin, Plus, Search } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { EventRating } from '@/components/EventRating'
import { GlassTile } from '@/components/ui/glass-tile'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

export default function AllEvents() {
    const { events, deleteEvent, loading } = useEvents()
    const { toast } = useToast()
    const { user } = useAuth()
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        eventId: string | null;
        eventTitle: string;
        bookingCount: number;
    }>({ open: false, eventId: null, eventTitle: '', bookingCount: 0 })

    const checkEventBookings = async (eventId: string): Promise<number> => {
        try {
            const { data: bookings } = await supabase
                .from('bookings')
                .select('id')
                .eq('event_id', eventId);
            return bookings?.length || 0;
        } catch (error) {
            console.error('Error checking bookings:', error);
            return 0;
        }
    }

    const handleDeleteClick = async (id: string, title: string) => {
        const bookingCount = await checkEventBookings(id);
        if (bookingCount > 0) {
            setConfirmDialog({
                open: true,
                eventId: id,
                eventTitle: title,
                bookingCount
            });
        } else {
            await handleDelete(id);
        }
    }

    const handleDelete = async (id: string) => {
        setDeletingId(id)
        try {
            const result = await deleteEvent(id)
            if (result.success) {
                const cancelledBookings = result.cancelledBookings || 0
                toast({
                    title: "Event Deleted",
                    description: cancelledBookings > 0
                        ? `The event has been successfully deleted. ${cancelledBookings} booking${cancelledBookings > 1 ? 's' : ''} cancelled.`
                        : "The event has been successfully deleted.",
                })
            } else {
                throw new Error(result.error || "Failed to delete event")
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to delete the event.",
                variant: "destructive",
            })
        } finally {
            setDeletingId(null)
        }
    }

    const handleConfirmDelete = async () => {
        if (confirmDialog.eventId) {
            await handleDelete(confirmDialog.eventId);
            setConfirmDialog({ open: false, eventId: null, eventTitle: '', bookingCount: 0 });
        }
    }

    const filteredEvents = events.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.categories?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC] relative overflow-x-hidden font-sans">
            {/* Mesh Background */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
                <div className="absolute bottom-[20%] right-[-10%] w-[30%] h-[30%] rounded-full bg-purple-500/10 blur-[100px]" />
                <div className="absolute top-[40%] right-[10%] w-[20%] h-[20%] rounded-full bg-amber-500/5 blur-[80px]" />
            </div>

            <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />

            <main className="flex-grow pt-32 pb-20">
                <div className="container mx-auto px-4 max-w-7xl">
                    {/* Header Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8"
                    >
                        <div>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-2 leading-[0.9] text-slate-900">
                                Global Events.
                            </h1>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                                Administrator Hub & Lifecycle Control
                            </p>
                        </div>

                        <Link href="/admin/event/manage">
                            <Button className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-black tracking-tight hover:scale-[1.02] transition-transform shadow-xl">
                                <Plus className="w-5 h-5 mr-2" /> New Event
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="mb-12"
                    >
                        <GlassTile className="p-4 bg-white/60 backdrop-blur-xl border-slate-200/50 shadow-sm" interactive={false}>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Filter by title, location or category..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="h-12 pl-12 rounded-xl bg-white/70 border-slate-200/50 font-bold text-slate-900 placeholder:text-slate-300"
                                />
                            </div>
                        </GlassTile>
                    </motion.div>

                    {loading ? (
                        <div className="flex flex-col justify-center items-center h-64 space-y-4">
                            <div className="w-12 h-12 border-4 border-t-primary border-slate-200 rounded-full animate-spin" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">Syncing Matrix...</p>
                        </div>
                    ) : filteredEvents.length === 0 ? (
                        <GlassTile className="p-20 text-center bg-white/60 backdrop-blur-xl border-slate-200/50 shadow-sm" interactive={false}>
                            <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300 mx-auto mb-8">
                                <Calendar className="h-10 w-10" />
                            </div>
                            <h3 className="text-2xl font-black tracking-tighter mb-4 text-slate-900">No Events Detected</h3>
                            <p className="text-slate-500 mb-10 font-medium max-w-md mx-auto">
                                The global event matrix is empty. Initialize a new event to begin.
                            </p>
                            <Link href="/admin/event/manage">
                                <Button className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-black tracking-tight">
                                    <Plus className="w-5 h-5 mr-2" /> Create Event
                                </Button>
                            </Link>
                        </GlassTile>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                            <AnimatePresence mode="popLayout">
                                {filteredEvents.map((event, index) => (
                                    <motion.div
                                        key={event.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.6, delay: index * 0.05 }}
                                    >
                                        <GlassTile className="p-0 flex flex-col h-full group overflow-hidden bg-white/60 backdrop-blur-xl border-slate-200/50 shadow-sm" hoverScale={1.02}>
                                            <div className="relative h-32 overflow-hidden rounded-t-[24px]">
                                                {event.image_url ? (
                                                    <img src={event.image_url} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                ) : (
                                                    <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200">
                                                        <Calendar className="h-10 w-10" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                                                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex justify-between items-end">
                                                    <div>
                                                        <div className="text-[7px] font-bold uppercase tracking-widest text-white/60 mb-0.5">Category</div>
                                                        <div className="text-[10px] font-black text-white">{event.categories?.name || 'General'}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-4 flex-grow flex flex-col">
                                                <h4 className="text-base font-black tracking-tight mb-1.5 line-clamp-1 leading-tight group-hover:text-blue-500 transition-colors text-slate-900">
                                                    {event.title}
                                                </h4>

                                                <div className="space-y-1.5 mb-4">
                                                    <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                        <Calendar className="h-2.5 w-2.5 text-blue-500" />
                                                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                        <MapPin className="h-2.5 w-2.5 text-blue-500" />
                                                        <span className="truncate max-w-[130px]">{event.location}</span>
                                                    </div>
                                                </div>

                                                <div className="mt-auto grid grid-cols-2 gap-3 pb-3 border-b border-slate-100">
                                                    <div>
                                                        <div className="text-[7px] font-bold uppercase tracking-widest text-slate-400">Admission</div>
                                                        <div className="text-xs font-black text-blue-500">${event.price}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-[7px] font-bold uppercase tracking-widest text-slate-400">Time</div>
                                                        <div className="text-xs font-black text-slate-700">{event.time}</div>
                                                    </div>
                                                </div>

                                                <div className="pt-3 pb-1">
                                                    <EventRating
                                                        rating={4.5}
                                                        reviewCount={12}
                                                        size="sm"
                                                        showCount={true}
                                                        className="text-[8px] font-black uppercase tracking-widest text-slate-400"
                                                    />
                                                </div>

                                                <div className="pt-3 flex gap-2">
                                                    <Link href={`/admin/event/manage?id=${event.id}`} className="flex-grow">
                                                        <Button
                                                            variant="outline"
                                                            className="w-full h-9 rounded-xl border-slate-200 font-bold uppercase tracking-widest text-[9px] hover:bg-slate-50 text-slate-600"
                                                        >
                                                            <Edit className="h-3 w-3 mr-1" /> Edit
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        onClick={() => handleDeleteClick(event.id, event.title)}
                                                        className="h-9 w-9 p-0 rounded-xl border-slate-200 hover:bg-red-50 hover:text-red-500 text-slate-400"
                                                        variant="ghost"
                                                        disabled={deletingId === event.id}
                                                    >
                                                        {deletingId === event.id ? (
                                                            <div className="w-4 h-4 border-2 border-t-red-500 border-red-200 rounded-full animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </GlassTile>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </main>

            <Footer />

            {/* Confirmation Dialog */}
            <Dialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog({ open: false, eventId: null, eventTitle: '', bookingCount: 0 })}>
                <DialogContent className="rounded-[32px] border-none shadow-2xl overflow-hidden p-0 bg-white/95 backdrop-blur-xl">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Terminate Event?</DialogTitle>
                        <DialogDescription>Confirm deletion of the selected event</DialogDescription>
                    </DialogHeader>
                    <div className="p-8">
                        <div className="space-y-4">
                            <h2 className="text-2xl font-black tracking-tighter mb-4 text-slate-900">Terminate Event?</h2>
                            <p className="text-slate-500 font-medium">
                                Are you sure you want to delete <span className="text-slate-900 font-bold">"{confirmDialog.eventTitle}"</span>?
                                {confirmDialog.bookingCount > 0 && (
                                    <span className="block mt-4 p-4 rounded-xl bg-red-50 text-red-500 text-xs font-bold uppercase tracking-widest border border-red-100">
                                        Warning: This event has {confirmDialog.bookingCount} active booking{confirmDialog.bookingCount > 1 ? 's' : ''} that will be cancelled.
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                    <div className="p-6 bg-slate-50 flex gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => setConfirmDialog({ open: false, eventId: null, eventTitle: '', bookingCount: 0 })}
                            className="flex-grow h-12 rounded-xl font-bold uppercase tracking-widest text-[10px] text-slate-500"
                        >
                            Abort
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmDelete}
                            disabled={deletingId === confirmDialog.eventId}
                            className="flex-grow h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold uppercase tracking-widest text-[10px]"
                        >
                            {deletingId === confirmDialog.eventId ? 'Deleting...' : 'Confirm Deletion'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
