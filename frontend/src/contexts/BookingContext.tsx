'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { bookingsAPI } from '@/lib/api'

type Booking = {
  id: string
  event_id: string
  user_id: string
  status: string
  booking_date?: string
  created_at?: string
  event?: {
    id: string
    title: string
    price: number
    date: string
    time: string
    location: string
  }
  user?: {
    id: string
    email: string
    username?: string
    first_name?: string
    last_name?: string
  }
}

type BookingContextType = {
  bookings: Booking[]
  loading: boolean
  error: string | null
  addBooking: (eventId: string) => Promise<Booking | null>
  cancelBooking: (id: string) => Promise<Booking | null>
  getUserBookings: () => Promise<Booking[]>
  getAllBookings: () => Promise<Booking[]>
  fetchBookings: () => Promise<void>
}

const BookingContext = createContext<BookingContextType | undefined>(undefined)

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await bookingsAPI.getAllBookings()
      setBookings(data || [])
    } catch (err: any) {
      console.error('Error fetching bookings:', err)
      setError(err.message || 'Failed to fetch bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const addBooking = async (eventId: string) => {
    try {
      setLoading(true)
      setError(null)
      const newBooking = await bookingsAPI.createBooking(eventId)
      if (newBooking) {
        setBookings(prev => [...prev, newBooking])
      }
      return newBooking
    } catch (err: any) {
      console.error('Error adding booking:', err)
      setError(err.message || 'Failed to add booking')
      return null
    } finally {
      setLoading(false)
    }
  }

  const cancelBooking = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      const updatedBooking = await bookingsAPI.cancelBooking(id)
      if (updatedBooking) {
        setBookings(prev => prev.map(booking => 
          booking.id === id ? { ...booking, status: 'CANCELLED' } : booking
        ))
      }
      return updatedBooking
    } catch (err: any) {
      console.error('Error cancelling booking:', err)
      setError(err.message || 'Failed to cancel booking')
      return null
    } finally {
      setLoading(false)
    }
  }

  const getUserBookings = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await bookingsAPI.getUserBookings()
      return data || []
    } catch (err: any) {
      console.error('Error getting user bookings:', err)
      setError(err.message || 'Failed to get user bookings')
      return []
    } finally {
      setLoading(false)
    }
  }

  const getAllBookings = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await bookingsAPI.getAllBookings()
      return data || []
    } catch (err: any) {
      console.error('Error getting all bookings:', err)
      setError(err.message || 'Failed to get all bookings')
      return []
    } finally {
      setLoading(false)
    }
  }

  return (
    <BookingContext.Provider value={{ 
      bookings, 
      loading, 
      error, 
      addBooking, 
      cancelBooking, 
      getUserBookings, 
      getAllBookings,
      fetchBookings
    }}>
      {children}
    </BookingContext.Provider>
  )
}

export const useBookings = () => {
  const context = useContext(BookingContext)
  if (context === undefined) {
    throw new Error('useBookings must be used within a BookingProvider')
  }
  return context
}