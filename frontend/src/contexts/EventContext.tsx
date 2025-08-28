'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { eventsAPI } from '@/lib/api'

type Event = {
    id: string
    title: string
    description: string
    category_id?: string | null
    location: string
    price: number
    date: string
    time: string
    image_url?: string
    created_by?: string
    created_at?: string
    categories?: {
        id: string
        name: string
        description: string
    }
}

type EventContextType = {
    events: Event[]
    loading: boolean
    error: string | null
    addEvent: (eventData: Omit<Event, 'id' | 'image_url'>) => Promise<Event | null>
    updateEvent: (id: string, eventData: Partial<Event>) => Promise<Event | null>
    deleteEvent: (id: string) => Promise<{ success: boolean; cancelledBookings?: number; error?: string }>
    fetchEvents: () => Promise<void>
}

const EventContext = createContext<EventContextType | undefined>(undefined)

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    const fetchEvents = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await eventsAPI.getAllEvents()
            setEvents(data || [])
        } catch (err: any) {
            console.error('Error fetching events:', err)
            setError(err.message || 'Failed to fetch events')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEvents()
    }, [])

    const addEvent = async (eventData: Omit<Event, 'id' | 'image_url'>) => {
        try {
            setLoading(true)
            setError(null)
            const newEvent = await eventsAPI.createEvent(eventData)
            if (newEvent) {
                setEvents(prev => [...prev, newEvent])
            }
            return newEvent
        } catch (err: any) {
            console.error('Error adding event:', err)
            setError(err.message || 'Failed to add event')
            return null
        } finally {
            setLoading(false)
        }
    }

    const updateEvent = async (id: string, eventData: Partial<Event>) => {
        try {
            setLoading(true)
            setError(null)
            const updatedEvent = await eventsAPI.updateEvent(id, eventData)
            if (updatedEvent) {
                setEvents(prev => prev.map(event => 
                    event.id === id ? { ...event, ...updatedEvent } : event
                ))
            }
            return updatedEvent
        } catch (err: any) {
            console.error('Error updating event:', err)
            setError(err.message || 'Failed to update event')
            return null
        } finally {
            setLoading(false)
        }
    }

    const deleteEvent = async (id: string) => {
        try {
            setLoading(true)
            setError(null)
            const result = await eventsAPI.deleteEvent(id)
            if (result.success) {
                setEvents(prev => prev.filter(event => event.id !== id))
                // Return additional info about cancelled bookings
                return {
                    success: true,
                    cancelledBookings: result.cancelledBookings || 0
                }
            }
            return { success: false }
        } catch (err: any) {
            console.error('Error deleting event:', err)
            setError(err.message || 'Failed to delete event')
            return { success: false, error: err.message }
        } finally {
            setLoading(false)
        }
    }

    return (
        <EventContext.Provider value={{ 
            events, 
            loading, 
            error,
            addEvent, 
            updateEvent, 
            deleteEvent,
            fetchEvents
        }}>
            {children}
        </EventContext.Provider>
    )
}

export const useEvents = () => {
    const context = useContext(EventContext)
    if (context === undefined) {
        throw new Error('useEvents must be used within an EventProvider')
    }
    return context
}

