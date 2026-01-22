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
import { Calendar, MapPin, DollarSign, Clock, Image as ImageIcon, Type, FileText, Tag, ArrowLeft, CheckCircle2 } from 'lucide-react'
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
        <div className="min-h-screen flex flex-col bg-background relative overflow-x-hidden font-sans">
            {/* Mesh Background */}
            <div className="fixed inset-0 z-[-1] opacity-30 dark:opacity-20 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-400/20 blur-[120px]" />
            </div>

            <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />

            <main className="flex-grow pt-32 pb-20 container mx-auto px-4 max-w-5xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="flex items-center gap-6 mb-12">
                         <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-2xl h-12 w-12 hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-black/10 dark:hover:border-white/10"
                            onClick={() => router.push('/admin/events')}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2 leading-[0.9]">
                                {eventId ? 'Edit Protocol' : 'Initialize Event'}
                            </h1>
                            <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">
                                {eventId ? 'Update mission parameters.' : 'Define new mission parameters.'}
                            </p>
                        </div>
                    </div>

                    <GlassTile className="p-8 md:p-12 relative overflow-hidden rounded-[32px]" interactive={false}>
                        {isLoading ? (
                            <div className="flex flex-col justify-center items-center h-96 space-y-6">
                                <div className="w-12 h-12 border-4 border-t-black dark:border-t-white border-black/10 dark:border-white/10 rounded-full animate-spin"></div>
                                <p className="text-neutral-400 font-bold uppercase tracking-widest text-xs animate-pulse">Retrieving Data...</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-10">
                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <Label htmlFor="title" className="text-xs font-black uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                                            <Type className="w-3 h-3" /> Event Designation
                                        </Label>
                                        <Input
                                            id="title"
                                            name="title"
                                            placeholder="ENTER TITLE"
                                            value={event.title}
                                            onChange={handleChange}
                                            required
                                            className="bg-neutral-100/50 dark:bg-white/5 border-transparent focus:border-black/10 dark:focus:border-white/10 focus:ring-0 rounded-xl font-bold text-xl h-14 placeholder:text-neutral-300"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                                            <FileText className="w-3 h-3" /> Mission Brief
                                        </Label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            placeholder="Enter detailed description..."
                                            value={event.description}
                                            onChange={handleChange}
                                            required
                                            className="bg-neutral-100/50 dark:bg-white/5 border-transparent focus:border-black/10 dark:focus:border-white/10 focus:ring-0 rounded-xl min-h-[160px] resize-y font-medium text-base placeholder:text-neutral-300 p-4"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <Label htmlFor="category" className="text-xs font-black uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                                                <Tag className="w-3 h-3" /> Classification
                                            </Label>
                                            <div className="relative">
                                                {categoriesLoading ? (
                                                    <div className="h-14 w-full rounded-xl bg-neutral-100/50 dark:bg-white/5 px-4 flex items-center text-xs font-bold uppercase tracking-widest text-neutral-400 animate-pulse">
                                                        Loading...
                                                    </div>
                                                ) : (
                                                    <div className="relative">
                                                        <select
                                                            id="category"
                                                            value={event.category_id || ''}
                                                            onChange={(e) => {
                                                                setEvent({ ...event, category_id: e.target.value || null })
                                                            }}
                                                            className="h-14 w-full rounded-xl bg-neutral-100/50 dark:bg-white/5 border-transparent focus:border-black/10 dark:focus:border-white/10 px-4 text-sm font-bold focus:outline-none appearance-none cursor-pointer"
                                                        >
                                                            <option value="">SELECT CATEGORY</option>
                                                            {(categories && Array.isArray(categories)) ? categories.filter(category => category && typeof category === 'object' && category.id && category.name).map((category) => (
                                                                <option key={category.id} value={category.id}>
                                                                    {category.name}
                                                                </option>
                                                            )) : null}
                                                        </select>
                                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                                                            <ArrowLeft className="w-4 h-4 -rotate-90" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="location" className="text-xs font-black uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                                                <MapPin className="w-3 h-3" /> Coordinates
                                            </Label>
                                            <Input
                                                id="location"
                                                name="location"
                                                placeholder="VENUE OR ADDRESS"
                                                value={event.location}
                                                onChange={handleChange}
                                                required
                                                className="bg-neutral-100/50 dark:bg-white/5 border-transparent focus:border-black/10 dark:focus:border-white/10 focus:ring-0 rounded-xl font-bold h-14 placeholder:text-neutral-300"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div className="space-y-3">
                                            <Label htmlFor="price" className="text-xs font-black uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                                                <DollarSign className="w-3 h-3" /> Admission
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
                                                className="bg-neutral-100/50 dark:bg-white/5 border-transparent focus:border-black/10 dark:focus:border-white/10 focus:ring-0 rounded-xl font-bold h-14 placeholder:text-neutral-300"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="date" className="text-xs font-black uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                                                <Calendar className="w-3 h-3" /> Date
                                            </Label>
                                            <Input
                                                id="date"
                                                name="date"
                                                type="date"
                                                value={event.date}
                                                onChange={handleChange}
                                                required
                                                className="bg-neutral-100/50 dark:bg-white/5 border-transparent focus:border-black/10 dark:focus:border-white/10 focus:ring-0 rounded-xl font-bold h-14"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="time" className="text-xs font-black uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                                                <Clock className="w-3 h-3" /> Time
                                            </Label>
                                            <Input
                                                id="time"
                                                name="time"
                                                type="time"
                                                value={event.time}
                                                onChange={handleChange}
                                                required
                                                className="bg-neutral-100/50 dark:bg-white/5 border-transparent focus:border-black/10 dark:focus:border-white/10 focus:ring-0 rounded-xl font-bold h-14"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="image" className="text-xs font-black uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                                            <ImageIcon className="w-3 h-3" /> Visual Asset
                                        </Label>
                                        <div className="mt-2 rounded-2xl border-2 border-dashed border-neutral-200 dark:border-white/10 p-8 hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors">
                                            <div className="text-center w-full">
                                                {event.image_url && !event.image ? (
                                                    <div className="relative mb-6 mx-auto w-full max-w-md overflow-hidden rounded-xl shadow-2xl group">
                                                        <img
                                                            src={event.image_url}
                                                            alt="Current event"
                                                            className="h-64 w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                        />
                                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <span className="text-white text-xs font-black uppercase tracking-widest">Current Asset</span>
                                                        </div>
                                                    </div>
                                                ) : null}

                                                <div className="flex flex-col items-center">
                                                    <label htmlFor="image" className="cursor-pointer">
                                                        <div className="h-14 px-6 rounded-xl bg-neutral-100 dark:bg-white/10 text-neutral-900 dark:text-white font-bold flex items-center gap-2 hover:scale-[1.02] transition-transform">
                                                            Upload File
                                                        </div>
                                                        <input
                                                            id="image"
                                                            name="image"
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleChange}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mt-4">PNG, JPG, GIF (Max 10MB)</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8 flex justify-end gap-4 border-t border-neutral-100 dark:border-white/5">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => router.push('/admin/events')}
                                        className="h-14 px-8 rounded-2xl font-black tracking-tight hover:bg-neutral-100 dark:hover:bg-white/5"
                                    >
                                        Abort
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="h-14 px-10 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-black tracking-tight hover:scale-[1.02] transition-transform shadow-2xl"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Processing...
                                            </span>
                                        ) : (eventId ? 'Update Mission' : 'Launch Mission')}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </GlassTile>
                </motion.div>
            </main>

            <Footer />
        </div>
    )
}

export default function EventForm() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 border-4 border-t-black dark:border-t-white border-black/10 dark:border-white/10 rounded-full animate-spin"></div>
                    <p className="text-neutral-400 font-bold uppercase tracking-widest text-xs animate-pulse">Initializing System...</p>
                </div>
            </div>
        }>
            <EventFormComponent />
        </Suspense>
    )
}
