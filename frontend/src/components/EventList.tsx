'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/card'
import { Button } from './ui/button'
import { FollowButton } from './ui/follow-button'
import { useEvents } from '@/contexts/EventContext'
import { useAuth } from '@/contexts/AuthContext'
import { useBookings } from '@/contexts/BookingContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Input } from './ui/input'
import { useToast } from '@/components/ui/use-toast'


export default function EventList() {
    const { events, updateEvent } = useEvents()
    const { user } = useAuth()
    const { addBooking } = useBookings()
    const { toast } = useToast()
    const [selectedEvent, setSelectedEvent] = useState<any | null>(null)
    const [ticketQuantity, setTicketQuantity] = useState(1)

    const handleBuyTicket = (event: any) => {
        setSelectedEvent(event)
        setTicketQuantity(1)
    }

    const handleConfirmPurchase = async () => {
        if (selectedEvent && user) {
            try {
                await addBooking(selectedEvent.id)
                setSelectedEvent(null);
                toast({
                    title: "Booking Successful",
                    description: `You have successfully booked ${selectedEvent.title}.`,
                });
            } catch (error) {
                toast({
                    title: "Booking Failed",
                    description: "There was an error processing your booking.",
                    variant: "destructive"
                });
            }
        }
    }

    return (
        <>
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, staggerChildren: 0.1 }}
            >
                {events.length === 0 ? (
                    <p className="text-white col-span-3 text-center">No events available.</p>
                ) : (
                    events.map((event) => (
                        <motion.div
                            key={event.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Card className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg text-white overflow-hidden">
                                <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500">
                                    <CardTitle>{event.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 space-y-2">
                                    <p>{event.description}</p>
                                    <p><span className="font-semibold">Category:</span> {event.categories?.name || 'Uncategorized'}</p>
                                    <p><span className="font-semibold">Location:</span> {event.location}</p>
                                    <p><span className="font-semibold">Price:</span> ${event.price}</p>
                                    <p><span className="font-semibold">Date:</span> {new Date(event.date).toLocaleDateString()}</p>
                                    <p><span className="font-semibold">Time:</span> {event.time}</p>
                                    {(event as any).follower_count !== undefined && (
                                        <p><span className="font-semibold">Followers:</span> {(event as any).follower_count}</p>
                                    )}
                                </CardContent>
                                <CardFooter className="flex flex-col space-y-2">
                                    {user && user.role === 'USER' && (
                                        <Button
                                            onClick={() => handleBuyTicket(event)}
                                            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                                        >
                                            Book Event
                                        </Button>
                                    )}
                                    <FollowButton
                                        targetId={event.id}
                                        targetType="EVENT"
                                        targetName={event.title}
                                        followerCount={(event as any).follower_count || 0}
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                    />
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))
                )}
            </motion.div>

            <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
                <DialogContent className="bg-white bg-opacity-90 backdrop-filter backdrop-blur-lg">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-gray-800">Purchase Tickets</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-gray-700">Event: {selectedEvent?.title}</p>
                        <p className="text-gray-700">Price: ${selectedEvent?.price}</p>
                        <p className="text-gray-700">Date: {selectedEvent?.date && new Date(selectedEvent.date).toLocaleDateString()}</p>
                        <p className="text-gray-700">Time: {selectedEvent?.time}</p>
                        <p className="text-gray-700">Location: {selectedEvent?.location}</p>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleConfirmPurchase} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">Confirm Purchase</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}