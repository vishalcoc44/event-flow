'use client'

import React, { Suspense, useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useEvents } from '@/contexts/EventContext'
import { useCategories } from '@/contexts/CategoryContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { HoverShadowEffect } from '@/components/ui/hover-shadow-effect'
import { eventsAPI } from '@/lib/api'
import { GlassTile } from '@/components/ui/glass-tile'
import { motion } from 'framer-motion'
import { Calendar, MapPin, DollarSign, Clock, Image as ImageIcon, Type, FileText, Tag, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

function EventFormComponent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const eventId = searchParams.get('id')
    const { addEvent, updateEvent, loading } = useEvents()
    const { categories, loading: categoriesLoading } = useCategories()
    const { toast } = useToast()
    const { user } = useAuth()
    const [isLoading, setIsLoading] = useState(false)

    const [event, setEvent] = useState({
        title: '',
        description: '',
        category_id: null as string | null,
        location: '',
        price: '',
        date: '',
        time: '',
        image: null as File | null,
        image_url: '' as string,
    })

    // Load existing event data if editing
    useEffect(() => {
        const loadEvent = async () => {
            if (eventId) {
                try {
                    setIsLoading(true)
                    const eventData = await eventsAPI.getEventById(eventId)
                    if (eventData) {
                        setEvent({
                            title: eventData.title || '',
                            description: eventData.description || '',
                            category_id: eventData.category_id || null,
                            location: eventData.location || '',
                            price: eventData.price?.toString() || '',
                            date: eventData.date || '',
                            time: eventData.time || '',
                            image: null,
                            image_url: eventData.image_url || '',
                        })
                    }
                } catch (error) {
                    console.error('Error loading event:', error)
                    toast({
                        title: "Error",
                        description: "Failed to load event data",
                        variant: "destructive",
                    })
                } finally {
                    setIsLoading(false)
                }
            }
        }

        loadEvent()
    }, [eventId, toast])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, files } = e.target as HTMLInputElement
        if (name === 'image' && files) {
            setEvent({ ...event, image: files[0] })
        } else {
            setEvent({ ...event, [name]: value })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (eventId) {
                // Update existing event
                await updateEvent(eventId, {
                    ...event,
                    category_id: event.category_id || undefined,
                    price: parseFloat(event.price),
                })

                toast({
                    title: "Event Updated",
                    description: "The event has been successfully updated",
                })
            } else {
                // Create new event
                await addEvent({
                    ...event,
                    category_id: event.category_id || undefined,
                    price: parseFloat(event.price),
                })

                toast({
                    title: "Event Added",
                    description: "The event has been successfully created",
                })
            }

            router.push('/admin/events')
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || `Failed to ${eventId ? 'update' : 'create'} event`,
                variant: "destructive",
            })
        }
    }

    return (
        <div className="min-h-screen flex flex-col font-sans relative overflow-hidden bg-[#f3f4f6]">
            {/* Mesh Gradient Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-purple-200/40 blur-[80px] mix-blend-multiply opacity-60 animate-blob"></div>
                <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-200/40 blur-[80px] mix-blend-multiply opacity-60 animate-blob animation-delay-2000"></div>
                <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] rounded-full bg-pink-200/40 blur-[80px] mix-blend-multiply opacity-60 animate-blob animation-delay-4000"></div>
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03]"></div>
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />

                <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full hover:bg-white/50"
                                onClick={() => router.push('/admin/events')}
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                                    {eventId ? 'Edit Event' : 'Create New Event'}
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    {eventId ? 'Update existing event details.' : 'Fill in the details to publish a new event.'}
                                </p>
                            </div>
                        </div>

                        <GlassTile className="p-8 relative overflow-hidden" interactive={false}>
                            {isLoading ? (
                                <div className="flex flex-col justify-center items-center h-96 space-y-4">
                                    <div className="w-10 h-10 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
                                    <p className="text-gray-500 animate-pulse">Loading event details...</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="title" className="text-gray-700 font-medium flex items-center gap-2">
                                                <Type className="w-4 h-4 text-blue-500" /> Event Title
                                            </Label>
                                            <Input
                                                id="title"
                                                name="title"
                                                placeholder="Enter a catchy title for your event"
                                                value={event.title}
                                                onChange={handleChange}
                                                required
                                                className="bg-white/50 border-gray-200 focus:border-blue-400 focus:ring-blue-100 transition-all font-medium text-lg h-12"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="description" className="text-gray-700 font-medium flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-blue-500" /> Description
                                            </Label>
                                            <Textarea
                                                id="description"
                                                name="description"
                                                placeholder="Describe what your event is about..."
                                                value={event.description}
                                                onChange={handleChange}
                                                required
                                                className="bg-white/50 border-gray-200 focus:border-blue-400 focus:ring-blue-100 transition-all min-h-[150px] resize-y"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="category" className="text-gray-700 font-medium flex items-center gap-2">
                                                    <Tag className="w-4 h-4 text-blue-500" /> Category
                                                </Label>
                                                <div className="relative">
                                                    {categoriesLoading ? (
                                                        <div className="h-11 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm flex items-center text-gray-500 animate-pulse">
                                                            Loading categories...
                                                        </div>
                                                    ) : (
                                                        <select
                                                            id="category"
                                                            value={event.category_id || ''}
                                                            onChange={(e) => {
                                                                setEvent({ ...event, category_id: e.target.value || null })
                                                            }}
                                                            className="h-11 w-full rounded-md border border-gray-200 bg-white/50 px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all appearance-none cursor-pointer hover:bg-white/80"
                                                        >
                                                            <option value="">Select a category</option>
                                                            {(categories && Array.isArray(categories)) ? categories.filter(category => category && typeof category === 'object' && category.id && category.name).map((category) => (
                                                                <option key={category.id} value={category.id}>
                                                                    {category.name}
                                                                </option>
                                                            )) : null}
                                                        </select>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="location" className="text-gray-700 font-medium flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-blue-500" /> Location
                                                </Label>
                                                <Input
                                                    id="location"
                                                    name="location"
                                                    placeholder="Venue name or address"
                                                    value={event.location}
                                                    onChange={handleChange}
                                                    required
                                                    className="bg-white/50 border-gray-200 focus:border-blue-400 focus:ring-blue-100 transition-all h-11"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="price" className="text-gray-700 font-medium flex items-center gap-2">
                                                    <DollarSign className="w-4 h-4 text-blue-500" /> Price
                                                </Label>
                                                <Input
                                                    id="price"
                                                    name="price"
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    value={event.price}
                                                    onChange={handleChange}
                                                    required
                                                    className="bg-white/50 border-gray-200 focus:border-blue-400 focus:ring-blue-100 transition-all h-11"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="date" className="text-gray-700 font-medium flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-blue-500" /> Date
                                                </Label>
                                                <Input
                                                    id="date"
                                                    name="date"
                                                    type="date"
                                                    value={event.date}
                                                    onChange={handleChange}
                                                    required
                                                    className="bg-white/50 border-gray-200 focus:border-blue-400 focus:ring-blue-100 transition-all h-11"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="time" className="text-gray-700 font-medium flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-blue-500" /> Time
                                                </Label>
                                                <Input
                                                    id="time"
                                                    name="time"
                                                    type="time"
                                                    value={event.time}
                                                    onChange={handleChange}
                                                    required
                                                    className="bg-white/50 border-gray-200 focus:border-blue-400 focus:ring-blue-100 transition-all h-11"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="image" className="text-gray-700 font-medium flex items-center gap-2">
                                                <ImageIcon className="w-4 h-4 text-blue-500" /> Event Image
                                            </Label>
                                            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-300 px-6 py-10 hover:bg-gray-50 transition-colors bg-white/30">
                                                <div className="text-center w-full">
                                                    {event.image_url && !event.image ? (
                                                        <div className="relative mb-4 mx-auto w-full max-w-sm overflow-hidden rounded-lg shadow-md group">
                                                            <img
                                                                src={event.image_url}
                                                                alt="Current event"
                                                                className="h-48 w-full object-cover transition-transform group-hover:scale-105"
                                                            />
                                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <span className="text-white text-sm font-medium">Current Image</span>
                                                            </div>
                                                        </div>
                                                    ) : null}

                                                    <div className="mt-4 flex flex-col items-center">
                                                        <Input
                                                            id="image"
                                                            name="image"
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleChange}
                                                            className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 w-full max-w-xs"
                                                        />
                                                        <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 10MB</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 flex justify-end gap-3 border-t border-gray-100">
                                        <HoverShadowEffect className="cursor-pointer" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.15} hoverScale={1.02} hoverLift={-1} transitionDuration={150}>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => router.push('/admin/events')}
                                                className="border-gray-200 text-gray-700 hover:bg-gray-50 bg-white"
                                            >
                                                Cancel
                                            </Button>
                                        </HoverShadowEffect>
                                        <HoverShadowEffect className="cursor-pointer" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.15} hoverScale={1.02} hoverLift={-1} transitionDuration={150}>
                                            <Button
                                                type="submit"
                                                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 px-8"
                                                disabled={loading}
                                            >
                                                {loading ? (eventId ? 'Updating...' : 'Creating...') : (eventId ? 'Update Event' : 'Create Event')}
                                            </Button>
                                        </HoverShadowEffect>
                                    </div>
                                </form>
                            )}
                        </GlassTile>
                    </motion.div>
                </main>

                <Footer />
            </div>
        </div>
    )
}

export default function EventForm() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-10 h-10 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium animate-pulse">Initializing editor...</p>
                </div>
            </div>
        }>
            <EventFormComponent />
        </Suspense>
    )
}
