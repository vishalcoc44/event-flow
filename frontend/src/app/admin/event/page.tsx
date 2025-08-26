'use client'

import React, { Suspense, useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useEvents } from '@/contexts/EventContext'
import { useCategories } from '@/contexts/CategoryContext'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { HoverShadowEffect } from '@/components/ui/hover-shadow-effect'
import { eventsAPI } from '@/lib/api'

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
                        console.log('Loaded event data:', eventData)
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

    // Debug categories data
    useEffect(() => {
        console.log('Categories:', categories)
        console.log('Categories loading:', categoriesLoading)
    }, [categories, categoriesLoading])

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
                const updatedEvent = await updateEvent(eventId, {
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
                const newEvent = await addEvent({
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
        <div className="min-h-screen flex flex-col bg-white">
            <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />
            
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">
                        {eventId ? 'Edit Event' : 'Add New Event'}
                    </h1>
                    
                    <HoverShadowEffect className="cursor-pointer" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.15} hoverScale={1.02} hoverLift={-1} transitionDuration={150}>
                        <Card className="shadow-sm border border-gray-200">
                            <CardContent className="pt-6">
                            {isLoading ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="w-8 h-8 border-4 border-t-[#6CDAEC] rounded-full animate-spin"></div>
                                </div>
                            ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Event Title</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        placeholder="Enter event title"
                                        value={event.title}
                                        onChange={handleChange}
                                        required
                                        className="bg-[#F8F8F8] border border-gray-200"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="description">Event Description</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        placeholder="Enter event description"
                                        value={event.description}
                                        onChange={handleChange}
                                        required
                                        className="bg-[#F8F8F8] border border-gray-200 min-h-[120px]"
                                    />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Event Category</Label>
                                        {categoriesLoading ? (
                                            <div className="h-10 w-full rounded-md border border-gray-200 bg-[#F8F8F8] px-3 py-2 text-sm flex items-center">
                                                Loading categories...
                                            </div>
                                        ) : categories && categories.length > 0 ? (
                                            <select
                                                id="category"
                                                value={event.category_id || ''}
                                                onChange={(e) => {
                                                    console.log('Category selected:', e.target.value)
                                                    setEvent({ ...event, category_id: e.target.value || null })
                                                }}
                                                className="h-10 w-full rounded-md border border-gray-200 bg-[#F8F8F8] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6CDAEC] focus:border-transparent"
                                            >
                                                <option value="">Select category</option>
                                                {categories.map((category) => (
                                                    <option key={category.id} value={category.id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div className="h-10 w-full rounded-md border border-gray-200 bg-[#F8F8F8] px-3 py-2 text-sm flex items-center text-gray-500">
                                                No categories available
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="location">Location</Label>
                                        <Input
                                            id="location"
                                            name="location"
                                            placeholder="Enter event location"
                                            value={event.location}
                                            onChange={handleChange}
                                            required
                                            className="bg-[#F8F8F8] border border-gray-200"
                                        />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Ticket Price ($)</Label>
                                        <Input
                                            id="price"
                                            name="price"
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={event.price}
                                            onChange={handleChange}
                                            required
                                            className="bg-[#F8F8F8] border border-gray-200"
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="date">Event Date</Label>
                                        <Input
                                            id="date"
                                            name="date"
                                            type="date"
                                            value={event.date}
                                            onChange={handleChange}
                                            required
                                            className="bg-[#F8F8F8] border border-gray-200"
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="time">Event Time</Label>
                                        <Input
                                            id="time"
                                            name="time"
                                            type="time"
                                            value={event.time}
                                            onChange={handleChange}
                                            required
                                            className="bg-[#F8F8F8] border border-gray-200"
                                        />
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="image">Event Image</Label>
                                    <Input
                                        id="image"
                                        name="image"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleChange}
                                        className="bg-[#F8F8F8] border border-gray-200"
                                    />
                                    {event.image_url && (
                                        <div className="mt-2">
                                            <Label className="text-sm text-gray-600">Current Image:</Label>
                                            <img 
                                                src={event.image_url} 
                                                alt="Current event image" 
                                                className="mt-1 w-32 h-20 object-cover rounded-md border border-gray-200"
                                            />
                                        </div>
                                    )}
                                </div>
                                
                                <div className="pt-4 flex justify-end space-x-4">
                                    <HoverShadowEffect className="cursor-pointer" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.15} hoverScale={1.02} hoverLift={-1} transitionDuration={150}>
                                        <Button 
                                            type="button" 
                                            variant="outline"
                                            onClick={() => router.push('/admin/events')}
                                        >
                                            Cancel
                                        </Button>
                                    </HoverShadowEffect>
                                    <HoverShadowEffect className="cursor-pointer" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.15} hoverScale={1.02} hoverLift={-1} transitionDuration={150}>
                                        <Button 
                                            type="submit" 
                                            className="bg-[#6CDAEC] hover:bg-[#5BCFE3] text-white"
                                            disabled={loading}
                                        >
                                            {loading ? (eventId ? 'Updating...' : 'Creating...') : (eventId ? 'Update Event' : 'Create Event')}
                                        </Button>
                                    </HoverShadowEffect>
                                </div>
                            </form>
                            )}
                        </CardContent>
                    </Card>
                    </HoverShadowEffect>
                </div>
            </main>
            
            <Footer />
        </div>
    )
}

export default function EventForm() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-t-[#6CDAEC] rounded-full animate-spin mx-auto mb-4"></div>
                    <p>Loading...</p>
                </div>
            </div>
        }>
            <EventFormComponent />
        </Suspense>
    )
}

