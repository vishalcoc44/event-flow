'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEvents } from '@/contexts/EventContext'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Trash2, Edit } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { HoverShadowEffect } from '@/components/ui/hover-shadow-effect'
import { EventRating } from '@/components/EventRating'

export default function AllEvents() {
    const { events, deleteEvent, loading } = useEvents()
    const { toast } = useToast()
    const { user } = useAuth()
    const [deletingId, setDeletingId] = useState<string | null>(null)
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
                if (cancelledBookings > 0) {
                    toast({
                        title: "Event Deleted",
                        description: `The event has been successfully deleted. ${cancelledBookings} booking${cancelledBookings > 1 ? 's' : ''} ${cancelledBookings > 1 ? 'were' : 'was'} cancelled.`,
                        variant: "default",
                    })
                } else {
                    toast({
                        title: "Event Deleted",
                        description: "The event has been successfully deleted.",
                        variant: "default",
                    })
                }
            } else {
                throw new Error(result.error || "Failed to delete event")
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to delete the event. Please try again.",
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
        <>
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />
            
            <motion.div
                className="container mx-auto px-4 py-8 flex-grow"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <div className="flex justify-between items-center mb-8">
                    <motion.h1
                        className="text-3xl font-bold text-gray-900"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        All Events
                    </motion.h1>
                    
                    <HoverShadowEffect className="cursor-pointer" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.15} hoverScale={1.02} hoverLift={-1} transitionDuration={150}>
                        <Link href="/admin/event">
                            <Button>
                                + Add New Event
                            </Button>
                        </Link>
                    </HoverShadowEffect>
                </div>
                
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <motion.div
                            className="w-12 h-12 border-4 border-t-primary rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                    </div>
                ) : events.length === 0 ? (
                    <div className="text-center py-12">
                        <h3 className="text-xl font-medium text-gray-600 mb-4">No events found</h3>
                        <p className="text-gray-500 mb-6">Get started by creating your first event</p>
                        <HoverShadowEffect className="cursor-pointer" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.15} hoverScale={1.02} hoverLift={-1} transitionDuration={150}>
                            <Link href="/admin/event">
                                <Button>
                                    Create Event
                                </Button>
                            </Link>
                        </HoverShadowEffect>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <AnimatePresence>
                            {events.map((event) => (
                                <motion.div key={event.id} variants={itemVariants} layout exit={{ opacity: 0, scale: 0.8 }}>
                                    <HoverShadowEffect className="cursor-pointer h-full" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.15} hoverScale={1.02} hoverLift={-1} transitionDuration={150}>
                                        <Card className="overflow-hidden h-full flex flex-col">
                                        <CardHeader className="bg-gradient-to-r from-primary/80 to-primary pb-3">
                                            <CardTitle className="text-lg font-bold text-white">{event.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-3 space-y-1 flex-grow">
                                            <p className="text-sm text-gray-700 line-clamp-2">{event.description}</p>
                                            <div className="text-xs space-y-1">
                                                <p className="text-gray-700">
                                                    <span className="font-medium">Category:</span> {event.categories?.name || 'Uncategorized'}
                                                </p>
                                                <p className="text-gray-700">
                                                    <span className="font-medium">Location:</span> {event.location}
                                                </p>
                                                <p className="text-gray-700">
                                                    <span className="font-medium">Price:</span> ${event.price}
                                                </p>
                                                <p className="text-gray-700">
                                                    <span className="font-medium">Date:</span> {new Date(event.date).toLocaleDateString()}
                                                </p>
                                                <p className="text-gray-700">
                                                    <span className="font-medium">Time:</span> {event.time}
                                                </p>
                                            </div>
                                            <div className="text-xs text-gray-700">
                                                <span className="font-medium">Rating:</span>
                                                <EventRating
                                                    rating={4.2}
                                                    reviewCount={8}
                                                    size="sm"
                                                    showCount={true}
                                                    className="ml-2"
                                                />
                                            </div>
                                            {event.image_url && (
                                                <div className="mt-4">
                                                    <img 
                                                        src={event.image_url} 
                                                        alt={event.title} 
                                                        className="w-full h-40 object-cover rounded-md"
                                                    />
                                                </div>
                                            )}
                                        </CardContent>
                                        <CardFooter className="border-t p-4 bg-gray-50 flex justify-between">
                                            <HoverShadowEffect className="cursor-pointer" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.15} hoverScale={1.02} hoverLift={-1} transitionDuration={150}>
                                                <Link href={`/admin/event?id=${event.id}`}>
                                                    <Button
                                                        variant="outline"
                                                        className="flex items-center"
                                                    >
                                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                                    </Button>
                                                </Link>
                                            </HoverShadowEffect>
                                            <HoverShadowEffect className="cursor-pointer" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.15} hoverScale={1.02} hoverLift={-1} transitionDuration={150}>
                                                <Button
                                                    onClick={() => handleDeleteClick(event.id, event.title)}
                                                    variant="destructive"
                                                    className="flex items-center"
                                                    disabled={deletingId === event.id}
                                                >
                                                    {deletingId === event.id ? (
                                                        <motion.div
                                                            className="w-5 h-5 border-t-2 border-white rounded-full"
                                                            animate={{ rotate: 360 }}
                                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                        />
                                                    ) : (
                                                        <>
                                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                        </>
                                                    )}
                                                </Button>
                                            </HoverShadowEffect>
                                        </CardFooter>
                                    </Card>
                                    </HoverShadowEffect>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </motion.div>
            
            <Footer />
        </div>

        {/* Confirmation Dialog */}
        <Dialog open={confirmDialog.open} onOpenChange={(open) =>
            setConfirmDialog({ ...confirmDialog, open })
        }>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm Event Deletion</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete the event "{confirmDialog.eventTitle}"?
                        {confirmDialog.bookingCount > 0 && (
                            <span className="text-red-600 font-medium">
                                {" "}This event has {confirmDialog.bookingCount} booking{confirmDialog.bookingCount > 1 ? 's' : ''} that will be cancelled.
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setConfirmDialog({ open: false, eventId: null, eventTitle: '', bookingCount: 0 })}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirmDelete}
                        disabled={deletingId === confirmDialog.eventId}
                    >
                        {deletingId === confirmDialog.eventId ? 'Deleting...' : 'Delete Event'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </>
    )
}

