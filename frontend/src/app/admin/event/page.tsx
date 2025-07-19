'use client'

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useEvents } from '@/contexts/EventContext'
import { useCategories } from '@/contexts/CategoryContext'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export default function AddEvent() {
    const router = useRouter()
    const { addEvent, loading } = useEvents()
    const { categories } = useCategories()
    const { toast } = useToast()
    const { user } = useAuth()
    
    const [event, setEvent] = useState({
        title: '',
        description: '',
        category_id: '',
        location: '',
        price: '',
        date: '',
        time: '',
        image: null as File | null,
    })

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
            const newEvent = await addEvent({
                ...event,
                price: parseFloat(event.price),
            })
            
            toast({
                title: "Event Added",
                description: "The event has been successfully created",
            })
            
            router.push('/admin/events')
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to create event",
                variant: "destructive",
            })
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />
            
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Add New Event</h1>
                    
                    <Card className="shadow-sm border border-gray-200">
                        <CardContent className="pt-6">
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
                                        <Select
                                            value={event.category_id}
                                            onValueChange={(value) => setEvent({ ...event, category_id: value })}
                                        >
                                            <SelectTrigger id="category" className="bg-[#F8F8F8] border border-gray-200">
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((category) => (
                                                    <SelectItem key={category.id} value={category.id}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
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
                                </div>
                                
                                <div className="pt-4 flex justify-end space-x-4">
                                    <Button 
                                        type="button" 
                                        variant="outline"
                                        onClick={() => router.push('/admin/events')}
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        className="bg-[#6CDAEC] hover:bg-[#5BCFE3] text-white"
                                        disabled={loading}
                                    >
                                        {loading ? 'Creating...' : 'Create Event'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>
            
            <Footer />
        </div>
    )
}

