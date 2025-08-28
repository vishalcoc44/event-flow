'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { HoverShadowEffect } from '@/components/ui/hover-shadow-effect'
import { Plus, Search, Filter, Calendar, MapPin, Users, Eye, EyeOff, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useOrganizationData, useOrganizationPermissions } from '@/hooks/useOrganizationData'
import { useCategories } from '@/contexts/CategoryContext'
import { supabase } from '@/lib/supabase'
import { EventListSkeleton } from '@/components/ui/loading-skeleton'

interface OrganizationEvent {
  id: string      // Matches what database actually returns
  title: string
  description: string
  date: string    // Matches what database actually returns
  time: string    // Matches what database actually returns
  location: string
  price: number
  image_url: string | null
  is_public: boolean
  is_approved: boolean
  requires_approval: boolean
  category_name: string | null
  event_space_name: string | null
  creator_name: string
  total_bookings: number
  average_rating: number | null
  max_attendees?: number | null // Add max_attendees property
  created_at: string
}

interface EventSpace {
  id: string
  name: string
  slug: string
}

export default function OrganizationEvents() {
  const router = useRouter()
  const { organization, orgLoading } = useOrganizationData()
  const { canCreateEvents, isLoadingPermissions } = useOrganizationPermissions()
  const { categories } = useCategories()
  const { toast } = useToast()

  const [events, setEvents] = useState<OrganizationEvent[]>([])
  const [eventSpaces, setEventSpaces] = useState<EventSpace[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpace, setSelectedSpace] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Fetch organization events with optimization
  useEffect(() => {
    const fetchEvents = async () => {
      if (!organization?.id) return

      try {
        setIsLoading(true)

        // Use optimized query instead of RPC for better performance
        const { data, error } = await supabase
          .from('events')
          .select(`
            id,
            title,
            description,
            date,
            time,
            location,
            price,
            image_url,
            is_public,
            is_approved,
            requires_approval,
            created_at,
            categories:category_id(name),
            event_spaces:event_space_id(name),
            creator:created_by(
              first_name,
              last_name,
              username
            )
          `)
          .eq('organization_id', organization.id)
          .order('date', { ascending: true })
          .limit(50) // Limit initial load for better performance

        if (error) throw error

        // Transform data to match our interface
        const transformedEvents = (data || []).map(event => ({
          ...event,
          creator_name: event.creator
            ? `${event.creator.first_name} ${event.creator.last_name}`.trim()
            : 'Unknown',
          total_bookings: event._count?.[0]?.count || 0,
          category_name: event.categories?.name || null,
          event_space_name: event.event_spaces?.name || null,
          average_rating: null, // Add missing average_rating property
          max_attendees: null // Add max_attendees property
        }))

        setEvents(transformedEvents)
      } catch (error) {
        console.error('Error fetching events:', error)
        toast({
          title: "Error",
          description: "Failed to load organization events",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [organization?.id, toast])

  // Fetch event spaces for filtering
  useEffect(() => {
    const fetchEventSpaces = async () => {
      if (!organization?.id) return

      try {
        const { data, error } = await supabase
          .from('event_spaces')
          .select('id, name, slug')
          .eq('organization_id', organization.id)
          .order('name')

        if (error) throw error
        setEventSpaces(data || [])
      } catch (error) {
        console.error('Error fetching event spaces:', error)
      }
    }

    fetchEventSpaces()
  }, [organization?.id])

  // Filter events based on search and filters
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSpace = selectedSpace === 'all' || event.event_space_name === selectedSpace
    
    const matchesCategory = selectedCategory === 'all' || event.category_name === selectedCategory
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'approved' && event.is_approved) ||
                         (statusFilter === 'pending' && !event.is_approved) ||
                         (statusFilter === 'public' && event.is_public) ||
                         (statusFilter === 'private' && !event.is_public)
    
    return matchesSearch && matchesSpace && matchesCategory && matchesStatus
  })

  const getEventStatus = (event: OrganizationEvent) => {
    if (!event.is_approved) return { label: 'Pending', color: 'yellow' }
    if (event.is_public) return { label: 'Public', color: 'green' }
    return { label: 'Private', color: 'blue' }
  }

  const formatDate = (date: string) => {
    try {
      // Handle different date formats that might come from the database
      let dateObj: Date;
      
      // If it's already a valid date string, use it directly
      if (date.includes('T') || date.includes(' ')) {
        dateObj = new Date(date);
      } else {
        // If it's just a date (YYYY-MM-DD), parse it carefully
        dateObj = new Date(date + 'T00:00:00');
      }
      
      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }
      
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error, date);
      return 'Invalid Date';
    }
  }

  const formatTime = (time: string) => {
    try {
      // Handle different time formats
      let timeObj: Date;
      
      if (time.includes(':')) {
        // If it's in HH:MM or HH:MM:SS format
        timeObj = new Date(`2000-01-01T${time}`);
      } else {
        // If it's already a full datetime string
        timeObj = new Date(time);
      }
      
      // Check if time is valid
      if (isNaN(timeObj.getTime())) {
        return 'Invalid Time';
      }
      
      return timeObj.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting time:', error, time);
      return 'Invalid Time';
    }
  }

  if (orgLoading || isLoadingPermissions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-t-primary rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Organization Required</h1>
          <p className="text-gray-600 mb-6">You need to be part of an organization to view events.</p>
          <Button onClick={() => router.push('/create-organization')}>
            Create Organization
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Organization Events</h1>
            <p className="text-gray-600 mt-2">Manage events for {organization.name}</p>
          </div>
          
          {canCreateEvents && (
            <HoverShadowEffect key="create-event-header">
              <Button
                onClick={() => router.push('/organization/create-event')}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </HoverShadowEffect>
          )}
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white"
                />
              </div>

              {/* Event Space Filter */}
              <Select value={selectedSpace} onValueChange={setSelectedSpace}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="All spaces" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Spaces</SelectItem>
                  {eventSpaces.map(space => (
                    <SelectItem key={space.id} value={space.name}>
                      {space.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map(category => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="All status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending Approval</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Events Grid */}
        {isLoading ? (
          <React.Fragment key="loading">
            <EventListSkeleton count={6} />
          </React.Fragment>
        ) : filteredEvents.length === 0 ? (
          <React.Fragment key="empty">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
                <p className="text-gray-600 text-center mb-6">
                  {events.length === 0 
                    ? "Your organization hasn't created any events yet."
                    : "No events match your current filters."
                  }
                </p>
                {canCreateEvents && events.length === 0 && (
                  <Button
                    onClick={() => router.push('/organization/create-event')}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Event
                  </Button>
                )}
              </CardContent>
            </Card>
          </React.Fragment>
        ) : (
          <React.Fragment key="events">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredEvents.map((event) => {
              const status = getEventStatus(event)
              
              return (
                <HoverShadowEffect key={event.id}>
                  <Card className="overflow-hidden cursor-pointer h-full"
                        onClick={() => router.push(`/events/${event.id}`)}>
                    {/* Event Image */}
                    <div className="relative h-32 bg-gray-200">
                      {event.image_url ? (
                        <img
                          key={`img-${event.id}`}
                          src={event.image_url}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div key={`placeholder-${event.id}`} className="w-full h-full flex items-center justify-center">
                          <Calendar className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <div className="absolute top-3 right-3">
                        <Badge 
                          variant={status.color === 'green' ? 'default' : 'secondary'}
                          className={`
                            ${status.color === 'green' ? 'bg-green-100 text-green-800' : ''}
                            ${status.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' : ''}
                            ${status.color === 'blue' ? 'bg-blue-100 text-blue-800' : ''}
                          `}
                        >
                          {status.label}
                        </Badge>
                      </div>

                      {/* Privacy Indicator */}
                      <div className="absolute top-3 left-3">
                        {event.is_public ? (
                          <Eye key={`eye-${event.id}`} className="w-4 h-4 text-white bg-black bg-opacity-50 rounded p-0.5" />
                        ) : (
                          <EyeOff key={`eye-off-${event.id}`} className="w-4 h-4 text-white bg-black bg-opacity-50 rounded p-0.5" />
                        )}
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
                          {event.title}
                        </h3>
                        {event.requires_approval && (
                          <Clock key={`clock-${event.id}`} className="w-3 h-3 text-yellow-500 ml-2 flex-shrink-0" />
                        )}
                      </div>

                      <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                        {event.description}
                      </p>

                      {/* Event Details */}
                      <div className="space-y-1 mb-3">
                        <div className="flex items-center text-xs text-gray-600">
                          <Calendar className="w-3 h-3 mr-2" />
                          {formatDate(event.date)} at {formatTime(event.time)}
                        </div>

                        <div className="flex items-center text-xs text-gray-600">
                          <MapPin className="w-3 h-3 mr-2" />
                          {event.location}
                        </div>

                        {event.total_bookings > 0 && (
                          <div key={`bookings-${event.id}`} className="flex items-center text-xs text-gray-600">
                            <Users className="w-3 h-3 mr-2" />
                            {event.total_bookings} registered
                            {event.max_attendees && (
                              <span key={`max-attendees-${event.id}`}> / {event.max_attendees} max</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Event Meta */}
                      <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                        <div className="text-xs text-gray-500">
                          {event.event_space_name && (
                            <span key={`space-${event.id}`}>In {event.event_space_name}</span>
                          )}
                        </div>

                        <div className="text-base font-semibold text-gray-900">
                          {event.price > 0 ? `$${event.price}` : 'Free'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </HoverShadowEffect>
              )
            })}
            </div>
          </React.Fragment>
        )}
      </div>
    </div>
  )
}
