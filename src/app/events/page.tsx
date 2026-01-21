'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { useEvents } from '@/contexts/EventContext'
import { useBookings } from '@/contexts/BookingContext'
import { motion } from 'framer-motion'
import { Calendar, MapPin, DollarSign, Search, Filter, ArrowRight, Heart, LayoutGrid, List } from 'lucide-react'
import { EventRating } from '@/components/EventRating'

import { GlassTile } from '@/components/ui/glass-tile'
import { supabase } from '@/lib/supabase'
import { cn, slugify } from '@/lib/utils'

export default function EventsPage() {
    const router = useRouter()
    const { user } = useAuth()
    const { events, loading: eventsLoading } = useEvents()
    const { bookings } = useBookings()

    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [priceRange, setPriceRange] = useState('all')
    const [userBookedEvents, setUserBookedEvents] = useState<string[]>([])
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [activeFeed, setActiveFeed] = useState<'trending' | 'for-you' | 'near-you' | 'weekend'>('trending')
    const [selectedTagSlugs, setSelectedTagSlugs] = useState<string[]>([])
    const [savedEventIds, setSavedEventIds] = useState<Set<string>>(new Set())
    const [statsByEventId, setStatsByEventId] = useState<Record<string, { attendees_count: number; average_rating: number; total_reviews: number; trending_score: number }>>({})
    const [followedCategoryIds, setFollowedCategoryIds] = useState<Set<string>>(new Set())

    useEffect(() => {
        if (user && bookings) {
            const bookedEventIds = bookings
                .filter(booking => booking.user_id === user.id && booking.status === 'CONFIRMED')
                .map(booking => booking.event?.id)
                .filter(Boolean) as string[]
            setUserBookedEvents(bookedEventIds)
        }
    }, [user, bookings])

    useEffect(() => {
        const loadSaved = async () => {
            if (!user?.id) {
                setSavedEventIds(new Set())
                return
            }

            const { data, error } = await supabase
                .from('follows')
                .select('target_id')
                .eq('follower_id', user.id)
                .eq('target_type', 'EVENT')

            if (error) {
                console.error('Failed to load saved events:', error)
                return
            }

            setSavedEventIds(new Set((data || []).map(r => r.target_id).filter(Boolean)))
        }

        loadSaved()
    }, [user?.id])

    useEffect(() => {
        const loadFollowedCategories = async () => {
            if (!user?.id) {
                setFollowedCategoryIds(new Set())
                return
            }

            const { data, error } = await supabase
                .from('follows')
                .select('target_id')
                .eq('follower_id', user.id)
                .eq('target_type', 'CATEGORY')

            if (error) {
                console.error('Failed to load followed categories:', error)
                return
            }

            setFollowedCategoryIds(new Set((data || []).map(r => r.target_id).filter(Boolean)))
        }

        loadFollowedCategories()
    }, [user?.id])

    useEffect(() => {
        const loadDiscoveryStats = async () => {
            if (!events || !Array.isArray(events) || events.length === 0) {
                setStatsByEventId({})
                return
            }

            const eventIds = events.map(e => e?.id).filter(Boolean) as string[]
            if (eventIds.length === 0) return

            const { data, error } = await supabase
                .from('event_discovery_stats')
                .select('event_id, attendees_count, average_rating, total_reviews, trending_score')
                .in('event_id', eventIds)

            if (error) {
                console.error('Failed to load discovery stats:', error)
                return
            }

            const next: Record<string, { attendees_count: number; average_rating: number; total_reviews: number; trending_score: number }> = {}
            for (const row of data || []) {
                if (!row?.event_id) continue
                next[row.event_id] = {
                    attendees_count: Number(row.attendees_count ?? 0),
                    average_rating: Number(row.average_rating ?? 0),
                    total_reviews: Number(row.total_reviews ?? 0),
                    trending_score: Number(row.trending_score ?? 0),
                }
            }
            setStatsByEventId(next)
        }

        loadDiscoveryStats()
    }, [events])

    const categories = events && Array.isArray(events)
        ? [...new Set(
            events
                .filter(event => event && typeof event === 'object' && event.categories && event.categories.name)
                .map(event => event.categories!.name)
                .filter(Boolean)
        )]
        : []

    const availableTags = useMemo(() => {
        const map = new Map<string, { slug: string; name: string; count: number }>()
        if (!events || !Array.isArray(events)) return []

        for (const event of events as any[]) {
            const eventTags = event?.event_tags
            if (!Array.isArray(eventTags)) continue
            for (const et of eventTags) {
                const tag = et?.tag
                const slug = tag?.slug || (tag?.name ? slugify(tag.name) : null)
                const name = tag?.name
                if (!slug || !name) continue
                const prev = map.get(slug)
                map.set(slug, { slug, name, count: (prev?.count ?? 0) + 1 })
            }
        }

        return Array.from(map.values()).sort((a, b) => b.count - a.count)
    }, [events])

    const filteredEvents = (events && Array.isArray(events))
        ? events.filter(event => {
            if (!event || typeof event !== 'object') return false

            const title = event.title || ''
            const description = event.description || ''
            const location = event.location || ''
            const price = event.price || 0

            const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                location.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesCategory = selectedCategory === 'all' || event.categories?.name === selectedCategory

            let matchesPrice = true
            if (priceRange === 'free') {
                matchesPrice = price === 0
            } else if (priceRange === 'low') {
                matchesPrice = price > 0 && price <= 50
            } else if (priceRange === 'medium') {
                matchesPrice = price > 50 && price <= 200
            } else if (priceRange === 'high') {
                matchesPrice = price > 200
            }

            const matchesTags =
                selectedTagSlugs.length === 0 ||
                (Array.isArray((event as any).event_tags) &&
                    (event as any).event_tags.some((et: any) => selectedTagSlugs.includes(et?.tag?.slug)))

            return matchesSearch && matchesCategory && matchesPrice && matchesTags
        })
        : []

    const feedEvents = useMemo(() => {
        const now = new Date()
        const next = [...filteredEvents]

        if (activeFeed === 'for-you') {
            if (user?.id && followedCategoryIds.size > 0) {
                return next.filter((e: any) => e?.category_id && followedCategoryIds.has(e.category_id))
            }
            return next
        }

        if (activeFeed === 'near-you') {
            const city = user?.city?.toLowerCase?.() || ''
            if (!city) return next
            return next.filter((e: any) => (e?.location || '').toLowerCase().includes(city))
        }

        if (activeFeed === 'weekend') {
            const end = new Date(now)
            end.setDate(end.getDate() + 10)
            return next.filter((e: any) => {
                if (!e?.date) return false
                const d = new Date(e.date)
                if (isNaN(d.getTime())) return false
                const day = d.getDay()
                const isWeekend = day === 0 || day === 6
                return isWeekend && d >= now && d <= end
            })
        }

        // trending (default)
        return next.sort((a: any, b: any) => {
            const aScore = statsByEventId[a?.id]?.trending_score ?? 0
            const bScore = statsByEventId[b?.id]?.trending_score ?? 0
            return bScore - aScore
        })
    }, [activeFeed, filteredEvents, followedCategoryIds, statsByEventId, user?.city, user?.id])

    const toggleSave = async (eventId: string) => {
        if (!user?.id) {
            router.push('/auth')
            return
        }

        const isSaved = savedEventIds.has(eventId)

        if (isSaved) {
            const { error } = await supabase
                .from('follows')
                .delete()
                .eq('follower_id', user.id)
                .eq('target_type', 'EVENT')
                .eq('target_id', eventId)

            if (!error) {
                setSavedEventIds(prev => {
                    const next = new Set(prev)
                    next.delete(eventId)
                    return next
                })
            }
        } else {
            const { error } = await supabase
                .from('follows')
                .insert({ follower_id: user.id, target_type: 'EVENT', target_id: eventId })

            if (!error) {
                setSavedEventIds(prev => new Set(prev).add(eventId))
            }
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-background relative overflow-x-hidden">
            {/* Mesh Background */}
            <div className="fixed inset-0 z-[-1] opacity-30 dark:opacity-20 pointer-events-none">
                <div className="absolute top-[-5%] right-[-5%] w-[35%] h-[35%] rounded-full bg-blue-300/20 blur-[100px]" />
                <div className="absolute bottom-[-5%] left-[-5%] w-[35%] h-[35%] rounded-full bg-indigo-300/20 blur-[100px]" />
            </div>

            <Header />

            <main className="flex-grow container mx-auto px-4 pt-40 pb-20">
                {/* Header Section */}
                <motion.div
                    className="mb-16 text-center max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="inline-block px-4 py-1.5 mb-6 text-[10px] font-bold rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 uppercase tracking-[0.2em]">
                        Explore the Collection
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 tracking-tight leading-[0.9]">Discover <br /> Remarkable Events.</h1>
                    <p className="text-xl text-muted-foreground font-medium">Curation of world-class experiences designed for organizers who demand excellence.</p>
                </motion.div>

                {/* Feed Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    className="mb-8"
                >
                    <GlassTile className="p-2" interactive={false}>
                        <div className="flex flex-wrap justify-center gap-2">
                            {[
                                { key: 'trending', label: 'Trending' },
                                { key: 'for-you', label: 'For You' },
                                { key: 'near-you', label: 'Near You' },
                                { key: 'weekend', label: 'This Weekend' },
                            ].map((t) => (
                                <button
                                    key={t.key}
                                    onClick={() => setActiveFeed(t.key as any)}
                                    className={cn(
                                        'h-10 px-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all',
                                        activeFeed === t.key
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20'
                                            : 'bg-white/20 dark:bg-black/20 border-white/60 dark:border-white/10 text-neutral-500 hover:text-blue-500'
                                    )}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </GlassTile>
                </motion.div>

                {/* Filter Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-16"
                >
                    <GlassTile className="p-4" interactive={false}>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="md:col-span-2 relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 group-focus-within:text-blue-500 transition-colors" />
                                <Input
                                    type="text"
                                    placeholder="Search by title, location, or vibes..."
                                    className="pl-12 h-14 rounded-2xl bg-white/20 dark:bg-black/20 border-white/60 dark:border-white/10 focus:ring-2 focus:ring-blue-500/20 transition-all text-lg font-medium"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="relative group">
                                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full h-14 pl-10 pr-4 rounded-2xl bg-white/20 dark:bg-black/20 border border-white/60 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none text-sm font-bold uppercase tracking-widest cursor-pointer"
                                >
                                    <option value="all">All Categories</option>
                                    {(categories && Array.isArray(categories)) ? categories.filter(category => category && typeof category === 'string').map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    )) : null}
                                </select>
                            </div>

                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                <select
                                    value={priceRange}
                                    onChange={(e) => setPriceRange(e.target.value)}
                                    className="w-full h-14 pl-10 pr-4 rounded-2xl bg-white/20 dark:bg-black/20 border border-white/60 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none text-sm font-bold uppercase tracking-widest cursor-pointer"
                                >
                                    <option value="all">All Prices</option>
                                    <option value="free">Free Access</option>
                                    <option value="low">Under $50</option>
                                    <option value="medium">$50 - $200</option>
                                    <option value="high">$200+</option>
                                </select>
                            </div>
                        </div>
                    </GlassTile>

                    {/* Tag Chips */}
                    {availableTags.length > 0 && (
                        <div className="mt-4">
                            <GlassTile className="p-3" interactive={false}>
                                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
                                    <span className="shrink-0 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 pl-2">
                                        Tags
                                    </span>
                                    {availableTags.slice(0, 16).map(tag => {
                                        const active = selectedTagSlugs.includes(tag.slug)
                                        return (
                                            <button
                                                key={tag.slug}
                                                onClick={() => {
                                                    setSelectedTagSlugs(prev =>
                                                        active ? prev.filter(s => s !== tag.slug) : [...prev, tag.slug]
                                                    )
                                                }}
                                                className={cn(
                                                    'shrink-0 h-9 px-4 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all',
                                                    active
                                                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20'
                                                        : 'bg-white/20 dark:bg-black/20 border-white/60 dark:border-white/10 text-neutral-500 hover:text-blue-500'
                                                )}
                                            >
                                                {tag.name}
                                                <span className={cn('ml-2 opacity-70', active ? 'text-white/80' : 'text-neutral-400')}>
                                                    {tag.count}
                                                </span>
                                            </button>
                                        )
                                    })}
                                    {selectedTagSlugs.length > 0 && (
                                        <button
                                            onClick={() => setSelectedTagSlugs([])}
                                            className="shrink-0 h-9 px-4 rounded-full border border-white/60 dark:border-white/10 bg-white/20 dark:bg-black/20 text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-blue-500 transition-colors"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                            </GlassTile>
                        </div>
                    )}
                </motion.div>

                {/* Results Count */}
                <div className="flex justify-between items-center mb-10 px-2">
                    <p className="text-sm font-bold uppercase tracking-[0.1em] text-neutral-500">
                        {eventsLoading ? 'Loading universe...' : `${feedEvents.length} Event${feedEvents.length !== 1 ? 's' : ''} Curated`}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={cn(
                                'p-2 rounded-xl border transition-colors',
                                viewMode === 'grid'
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white/20 dark:bg-black/20 border-white/60 dark:border-white/10 text-neutral-500 hover:text-blue-500'
                            )}
                            aria-label="Grid view"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn(
                                'p-2 rounded-xl border transition-colors',
                                viewMode === 'list'
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white/20 dark:bg-black/20 border-white/60 dark:border-white/10 text-neutral-500 hover:text-blue-500'
                            )}
                            aria-label="List view"
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Events Grid */}
                {eventsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-[450px] rounded-3xl bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
                        ))}
                    </div>
                ) : feedEvents.length === 0 ? (
                    <GlassTile className="py-32 text-center" interactive={false}>
                        <div className="bg-neutral-100 dark:bg-neutral-900 h-20 w-20 rounded-3xl flex items-center justify-center mx-auto mb-8">
                            <Calendar className="h-10 w-10 text-neutral-400" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">No Events Found</h3>
                        <p className="text-muted-foreground mb-10 max-w-sm mx-auto font-medium">
                            Adjust your filters or broaden your search to discover new experiences.
                        </p>
                        {(searchTerm || selectedCategory !== 'all' || priceRange !== 'all') && (
                            <Button
                                variant="outline"
                                className="rounded-full px-10 h-14 text-sm font-bold uppercase"
                                onClick={() => {
                                    setSearchTerm('')
                                    setSelectedCategory('all')
                                    setPriceRange('all')
                                }}
                            >
                                Reset Filters
                            </Button>
                        )}
                    </GlassTile>
                ) : (
                    <div className={cn(
                        'grid gap-8',
                        viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1'
                    )}>
                        {feedEvents.map((event, index) => {
                            if (!event || typeof event !== 'object' || !event.id) return null
                            const isBooked = userBookedEvents.includes(event.id)
                            const isSaved = savedEventIds.has(event.id)
                            const stats = statsByEventId[event.id]
                            const rating = stats?.average_rating ?? 0
                            const reviewCount = stats?.total_reviews ?? 0

                            return (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.05 }}
                                >
                                    <GlassTile className="p-4 h-full flex flex-col group" hoverScale={1.03}>
                                        <div className="relative h-56 rounded-[2rem] overflow-hidden mb-6">
                                            <img
                                                src={event.image_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=600&auto=format&fit=crop'}
                                                alt={event.title || 'Event'}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                            <button
                                                type="button"
                                                onClick={() => toggleSave(event.id)}
                                                className={cn(
                                                    'absolute top-4 right-4 h-10 w-10 rounded-2xl backdrop-blur-md border flex items-center justify-center transition-all',
                                                    isSaved
                                                        ? 'bg-red-500/20 border-red-500/30 text-red-400'
                                                        : 'bg-white/20 border-white/20 text-white hover:bg-white/30'
                                                )}
                                                aria-label={isSaved ? 'Unsave event' : 'Save event'}
                                            >
                                                <Heart className={cn('h-4 w-4', isSaved ? 'fill-red-400' : '')} />
                                            </button>

                                            {event.categories && (
                                                <div className="absolute top-4 left-4">
                                                    <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-white/90 text-black backdrop-blur-md">
                                                        {event.categories.name}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                                <div className="bg-white/20 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 text-white">
                                                    <div className="text-[10px] font-bold uppercase opacity-60">Entry From</div>
                                                    <div className="text-lg font-black leading-none">
                                                        {event.price === 0 || !event.price ? 'Free' : `$${event.price}`}
                                                    </div>
                                                </div>
                                                {isBooked && (
                                                    <span className="px-3 py-1.5 rounded-xl bg-green-500 text-white text-[10px] font-bold uppercase">
                                                        Reserved
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex-grow space-y-3 pb-6 border-b border-neutral-100 dark:border-neutral-800">
                                            <h3 className="text-xl font-bold line-clamp-2 tracking-tight">
                                                {event.title || 'Untitled Event'}
                                            </h3>

                                            <div className="flex flex-wrap gap-4 text-neutral-500 font-medium text-xs">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {event.date ? new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                    <span className="line-clamp-1">{event.location?.split(',')[0] || 'Worldwide'}</span>
                                                </div>
                                            </div>

                                            <div className="pt-2">
                                                <EventRating
                                                    rating={rating}
                                                    reviewCount={reviewCount}
                                                    size="sm"
                                                    showCount={true}
                                                    className="text-[10px] font-bold uppercase tracking-widest text-neutral-400"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-6">
                                            <Link href={`/events/${event.id}`}>
                                                <Button className="w-full h-12 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-bold text-sm group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                                    Explore Event
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </GlassTile>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    )
}
