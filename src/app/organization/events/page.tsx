'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  Filter,
  Calendar,
  MapPin,
  Users,
  Eye,
  EyeOff,
  Clock,
  CheckCircle2,
  XCircle,
  MoreVertical,
  ArrowRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react'
import { useOrganizationData, useOrganizationPermissions } from '@/hooks/useOrganizationData'
import { useCategories } from '@/contexts/CategoryContext'
import { supabase } from '@/lib/supabase'
import { EventListSkeleton } from '@/components/ui/loading-skeleton'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { GlassTile } from '@/components/ui/glass-tile'
import { cn } from '@/lib/utils'
import { EventRating } from '@/components/EventRating'

interface OrganizationEvent {
  id: string
  title: string
  description: string
  date: string
  time: string
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
  total_reviews?: number
  max_attendees?: number | null
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
  const { user } = useAuth()

  const [events, setEvents] = useState<OrganizationEvent[]>([])
  const [eventSpaces, setEventSpaces] = useState<EventSpace[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpace, setSelectedSpace] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [openMenuEventId, setOpenMenuEventId] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvents = async () => {
      if (!organization?.id) return
      try {
        setIsLoading(true)
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
            max_attendees,
            venue_id,
            created_at,
            categories:category_id(name),
            event_spaces:event_space_id(name),
            creator:created_by(first_name, last_name, username)
          `)
          .eq('organization_id', organization.id)
          .order('date', { ascending: true })

        if (error) throw error

        const eventIds = (data || []).map((e: any) => e?.id).filter(Boolean) as string[]
        const statsById: Record<string, { attendees_count: number; average_rating: number; total_reviews: number }> = {}

        if (eventIds.length > 0) {
          // Pull stats (bookings + rating) from read-only view
          const { data: statsData, error: statsError } = await supabase
            .from('event_discovery_stats')
            .select('event_id, attendees_count, average_rating, total_reviews')
            .in('event_id', eventIds)

          if (statsError) {
            console.error('Failed to load event stats:', statsError)
          }

          for (const row of statsData || []) {
            if (!row?.event_id) continue
            statsById[row.event_id] = {
              attendees_count: Number(row.attendees_count ?? 0),
              average_rating: Number(row.average_rating ?? 0),
              total_reviews: Number(row.total_reviews ?? 0),
            }
          }
        }

        const transformedEvents = (data || []).map((event: any) => ({
          ...event,
          creator_name: event.creator
            ? `${event.creator.first_name} ${event.creator.last_name}`.trim()
            : 'Unknown',
          total_bookings: statsById[event.id]?.attendees_count ?? 0,
          category_name: event.categories?.name || null,
          event_space_name: event.event_spaces?.name || null,
          average_rating: (statsById[event.id]?.average_rating ?? null),
          total_reviews: (statsById[event.id]?.total_reviews ?? 0),
          max_attendees: event.max_attendees ?? null
        }))

        setEvents(transformedEvents)
      } catch (error) {
        toast({ title: "Fetch Error", description: "Failed to sync event matrix.", variant: "destructive" })
      } finally {
        setIsLoading(false)
      }
    }
    fetchEvents()
  }, [organization?.id, toast])

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

  const getStatusConfig = (event: OrganizationEvent) => {
    if (!event.is_approved) return { label: 'Pending', icon: Clock, class: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' }
    if (event.is_public) return { label: 'Public', icon: Eye, class: 'bg-green-500/10 text-green-500 border-green-500/20' }
    return { label: 'Private', icon: EyeOff, class: 'bg-blue-500/10 text-blue-500 border-blue-500/20' }
  }

  const updateEventFlags = async (eventId: string, patch: Partial<Pick<OrganizationEvent, 'is_public' | 'requires_approval'>>) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .update(patch)
        .eq('id', eventId)
        .select('id, is_public, requires_approval')
        .single()

      if (error) throw error

      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, ...data } : e))
    } catch (e: any) {
      toast({ title: "Update Error", description: e?.message || "Failed to update event flags.", variant: "destructive" })
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-x-hidden">
      {/* Mesh Background */}
      <div className="fixed inset-0 z-[-1] opacity-30 dark:opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-400/20 blur-[120px]" />
      </div>

      <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />

      <main className="flex-grow pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8"
          >
            <div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-2 leading-[0.9]">
                Event Matrix.
              </h1>
              <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">
                Advanced lifecycle control for {organization.name}
              </p>
            </div>

            {canCreateEvents && (
              <Button
                onClick={() => router.push('/organization/create-event')}
                className="h-14 px-8 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-black tracking-tight hover:scale-[1.02] transition-transform shadow-2xl"
              >
                <Plus className="w-5 h-5 mr-2" /> New Deployment
              </Button>
            )}
          </motion.div>

          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-12"
          >
            <GlassTile className="p-4" interactive={false}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    placeholder="Filter by title or origin..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-12 pl-12 rounded-xl bg-background/50 border-neutral-200 dark:border-white/5 font-bold"
                  />
                </div>

                <Select value={selectedSpace} onValueChange={setSelectedSpace}>
                  <SelectTrigger className="h-12 rounded-xl bg-background/50 border-neutral-200 dark:border-white/5 font-bold">
                    <SelectValue placeholder="All Matrix Spaces" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-white/10 backdrop-blur-xl">
                    <SelectItem value="all">All Matrix Spaces</SelectItem>
                    {eventSpaces.map(space => (
                      <SelectItem key={space.id} value={space.name}>{space.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-12 rounded-xl bg-background/50 border-neutral-200 dark:border-white/5 font-bold">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-white/10 backdrop-blur-xl">
                    <SelectItem value="all">All Categories</SelectItem>
                    {(categories || []).map(cat => (
                      <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-12 rounded-xl bg-background/50 border-neutral-200 dark:border-white/5 font-bold">
                    <SelectValue placeholder="Status Filter" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-white/10 backdrop-blur-xl">
                    <SelectItem value="all">Status Filter</SelectItem>
                    <SelectItem value="approved">Approved Zone</SelectItem>
                    <SelectItem value="pending">Pending Validation</SelectItem>
                    <SelectItem value="public">Global Access</SelectItem>
                    <SelectItem value="private">Restricted Access</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </GlassTile>
          </motion.div>

          {/* Events Matrix */}
          {isLoading ? (
            <EventListSkeleton count={8} />
          ) : filteredEvents.length === 0 ? (
            <GlassTile className="p-20 text-center" interactive={false}>
              <div className="w-20 h-20 rounded-3xl bg-neutral-100 dark:bg-white/5 flex items-center justify-center text-neutral-400 mx-auto mb-8">
                <Calendar className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-black tracking-tighter mb-4">Matrix Empty</h3>
              <p className="text-neutral-500 mb-10 font-medium max-w-md mx-auto">
                No active events detected in this coordinate range. Initialize a new mission to begin.
              </p>
              {canCreateEvents && events.length === 0 && (
                <Button
                  onClick={() => router.push('/organization/create-event')}
                  className="h-14 px-8 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-black tracking-tight"
                >
                  <Plus className="w-5 h-5 mr-2" /> Initialize Hub
                </Button>
              )}
            </GlassTile>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredEvents.map((event, index) => {
                  const status = getStatusConfig(event)
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.6, delay: index * 0.05 }}
                    >
                      <GlassTile className="p-0 overflow-hidden flex flex-col h-full group" hoverScale={1.02}>
                        <div className="relative h-40 overflow-hidden">
                          {event.image_url ? (
                            <img src={event.image_url} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          ) : (
                            <div className="w-full h-full bg-neutral-100 dark:bg-white/5 flex items-center justify-center">
                              <Calendar className="h-12 w-12 text-neutral-300" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                          <div className="absolute top-3 right-3">
                            <Badge className={cn("px-2.5 py-1 rounded-lg backdrop-blur-md border font-black tracking-tighter uppercase text-[8px]", status.class)}>
                              {status.label}
                            </Badge>
                          </div>

                          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                            <div>
                              <div className="text-[8px] font-bold uppercase tracking-widest text-white/60 mb-0.5">Category</div>
                              <div className="text-xs font-black text-white">{event.category_name || 'General'}</div>
                            </div>
                            {event.requires_approval && (
                              <div className="p-1.5 rounded-lg bg-yellow-500/20 backdrop-blur-md border border-yellow-500/30 text-yellow-500">
                                <ShieldCheck className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="p-5 flex-grow flex flex-col">
                          <h4 className="text-lg font-black tracking-tight mb-2 line-clamp-1 leading-tight group-hover:text-blue-500 transition-colors">
                            {event.title}
                          </h4>

                          <div className="space-y-2 mb-6">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                              <Calendar className="h-3 w-3 text-blue-500" />
                              {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                              <MapPin className="h-3 w-3 text-blue-500" />
                              <span className="truncate max-w-[150px]">{event.location}</span>
                            </div>
                          </div>

                          <div className="mt-auto grid grid-cols-2 gap-4 pb-4 border-b border-neutral-100 dark:border-white/5">
                            <div>
                              <div className="text-[8px] font-bold uppercase tracking-widest text-neutral-400">Attendees</div>
                              <div className="text-sm font-black flex items-center gap-1.5">
                                <Users className="h-3 w-3" /> {event.total_bookings}
                              {typeof event.max_attendees === 'number' && event.max_attendees > 0 && (
                                <span className="text-[10px] font-bold text-neutral-400">
                                  / {event.max_attendees}
                                </span>
                              )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-[8px] font-bold uppercase tracking-widest text-neutral-400">Admission</div>
                              <div className="text-sm font-black text-blue-500">${event.price}</div>
                            </div>
                          </div>

                        <div className="pt-4 pb-2">
                          <EventRating
                            rating={event.average_rating || 0}
                            reviewCount={event.total_reviews || 0}
                            size="sm"
                            showCount={true}
                            className="text-[9px] font-black uppercase tracking-widest text-neutral-400"
                          />
                        </div>

                          <div className="pt-4 flex gap-2">
                            <Button
                              onClick={() => router.push(`/events/${event.id}`)}
                              variant="outline"
                              className="flex-grow h-10 rounded-xl border-neutral-200 dark:border-white/10 font-bold uppercase tracking-widest text-[9px] hover:bg-neutral-50 dark:hover:bg-white/5"
                            >
                              Details
                            </Button>
                            <div className="relative">
                              <Button
                                className="h-10 w-10 p-0 rounded-xl border-neutral-200 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
                                variant="ghost"
                                onClick={() => setOpenMenuEventId(prev => prev === event.id ? null : event.id)}
                                aria-label="Event actions"
                              >
                              <MoreVertical className="h-4 w-4" />
                              </Button>

                              <AnimatePresence>
                                {openMenuEventId === event.id && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 top-12 z-20 w-56 rounded-2xl border border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-xl shadow-2xl overflow-hidden"
                                  >
                                    <button
                                      className="w-full px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-neutral-700 dark:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/5"
                                      onClick={() => {
                                        setOpenMenuEventId(null)
                                        router.push(`/organization/create-event?id=${event.id}`)
                                      }}
                                    >
                                      Edit Event
                                    </button>

                                    <button
                                      className="w-full px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-neutral-700 dark:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/5"
                                      onClick={() => {
                                        setOpenMenuEventId(null)
                                        router.push(`/events/${event.id}`)
                                      }}
                                    >
                                      Open Public Page
                                    </button>

                                    <button
                                      className="w-full px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-neutral-700 dark:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/5"
                                      onClick={() => {
                                        setOpenMenuEventId(null)
                                        router.push(`/organization/events/${event.id}/tickets`)
                                      }}
                                    >
                                      Manage Ticket Tiers
                                    </button>

                                    <button
                                      className="w-full px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-neutral-700 dark:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/5"
                                      onClick={() => {
                                        setOpenMenuEventId(null)
                                        router.push(`/organization/events/${event.id}/check-in`)
                                      }}
                                    >
                                      Check-in / Attendees
                                    </button>

                                    <button
                                      className="w-full px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-neutral-700 dark:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/5"
                                      onClick={() => {
                                        setOpenMenuEventId(null)
                                        router.push(`/organization/events/${event.id}/schedule`)
                                      }}
                                    >
                                      Manage Schedule
                                    </button>

                                    <button
                                      className="w-full px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-neutral-700 dark:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/5"
                                      onClick={() => {
                                        setOpenMenuEventId(null)
                                        router.push(`/organization/events/${event.id}/speakers`)
                                      }}
                                    >
                                      Manage Speakers
                                    </button>

                                    <button
                                      className="w-full px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-neutral-700 dark:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/5"
                                      onClick={async () => {
                                        setOpenMenuEventId(null)
                                        await updateEventFlags(event.id, { is_public: !event.is_public })
                                      }}
                                    >
                                      {event.is_public ? 'Make Private' : 'Make Public'}
                                    </button>

                                    <button
                                      className="w-full px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-neutral-700 dark:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/5"
                                      onClick={async () => {
                                        setOpenMenuEventId(null)
                                        await updateEventFlags(event.id, { requires_approval: !event.requires_approval })
                                      }}
                                    >
                                      {event.requires_approval ? 'Disable Approval Gate' : 'Enable Approval Gate'}
                                    </button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </div>
                      </GlassTile>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
