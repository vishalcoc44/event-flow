'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEvents } from '@/contexts/EventContext'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, Edit } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { HoverShadowEffect } from '@/components/ui/hover-shadow-effect'
import { EventRating } from '@/components/EventRating'

export default function AllEvents() {
    const { events, deleteEvent, loading } = useEvents()
    const { toast } = useToast()
    const { user } = useAuth()
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const handleDelete = async (id: string) => {
        setDeletingId(id)
        try {
            const success = await deleteEvent(id)
            if (success) {
                toast({
                    title: "Event Deleted",
                    description: "The event has been successfully deleted.",
                    variant: "default",
                })
            } else {
                throw new Error("Failed to delete event")
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete the event. Please try again.",
                variant: "destructive",
            })
        } finally {
            setDeletingId(null)
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {events.map((event) => (
                                <motion.div key={event.id} variants={itemVariants} layout exit={{ opacity: 0, scale: 0.8 }}>
                                    <HoverShadowEffect className="cursor-pointer h-full" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.15} hoverScale={1.02} hoverLift={-1} transitionDuration={150}>
                                        <Card className="overflow-hidden h-full flex flex-col">
                                        <CardHeader className="bg-gradient-to-r from-primary/80 to-primary pb-4">
                                            <CardTitle className="text-xl font-bold text-white">{event.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 space-y-2 flex-grow">
                                            <p className="text-gray-700">{event.description}</p>
                                            <p className="text-gray-700">
                                                <span className="font-semibold">Category:</span> {event.categories?.name || 'Uncategorized'}
                                            </p>
                                            <p className="text-gray-700">
                                                <span className="font-semibold">Location:</span> {event.location}
                                            </p>
                                            <p className="text-gray-700">
                                                <span className="font-semibold">Price:</span> ${event.price}
                                            </p>
                                            <p className="text-gray-700">
                                                <span className="font-semibold">Date:</span> {new Date(event.date).toLocaleDateString()}
                                            </p>
                                            <p className="text-gray-700">
                                                <span className="font-semibold">Time:</span> {event.time}
                                            </p>
                                            <div className="text-gray-700">
                                                <span className="font-semibold">Rating:</span> 
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
                                                    onClick={() => handleDelete(event.id)}
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
    )
}

