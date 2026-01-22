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

            <main className="flex-grow container mx-auto px-4 pt-40 pb-20 max-w-7xl">
                {/* Header Section */}
                <motion.div
                    className="mb-16 text-center max-w-3xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="inline-block px-4 py-1.5 mb-6 text-[10px] font-black rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 uppercase tracking-[0.2em]">
                        The Global Matrix
                    </span>
                    <h1 className="text-5xl md:text-8xl font-black text-foreground mb-6 tracking-tighter leading-[0.85]">Remarkable <br /> Experiences.</h1>
                    <p className="text-lg text-neutral-500 font-bold uppercase tracking-widest text-[11px]">Curation of world-class events designed for the extraordinary.</p>
                </motion.div>

                {/* Feed Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    className="mb-10"
                >
                    <GlassTile className="p-2 border-none bg-neutral-100/50 dark:bg-white/5" interactive={false}>
                        <div className="flex flex-wrap justify-center gap-2">
                            {[
                                { key: 'trending', label: 'Trending' },
                                { key: 'for-you', label: 'For You' },
                                { key: 'near-you', label: 'Near You' },
                                { key: 'weekend', label: 'Weekend' },
                            ].map((t) => (
                                <button
                                    key={t.key}
                                    onClick={() => setActiveFeed(t.key as any)}
                                    className={cn(
                                        'h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all',
                                        activeFeed === t.key
                                            ? 'bg-black dark:bg-white text-white dark:text-black border-transparent shadow-2xl scale-[1.02]'
                                            : 'bg-transparent border-transparent text-neutral-400 hover:text-black dark:hover:text-white'
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
                    className="mb-12"
                >
                    <GlassTile className="p-4 bg-neutral-100/30 dark:bg-white/5" interactive={false}>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-2 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                <Input
                                    type="text"
                                    placeholder="Filter by title, origin, or vibes..."
                                    className="pl-12 h-12 rounded-xl bg-background/50 border-neutral-200 dark:border-white/5 font-bold"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="relative">
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full h-12 pl-4 pr-4 rounded-xl bg-background/50 border border-neutral-200 dark:border-white/5 focus:outline-none focus:ring-0 text-[10px] font-black uppercase tracking-widest cursor-pointer appearance-none"
                                >
                                    <option value="all">Categories</option>
                                    {(categories && Array.isArray(categories)) ? categories.filter(category => category && typeof category === 'string').map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    )) : null}
                                </select>
                            </div>

                            <div className="relative">
                                <select
                                    value={priceRange}
                                    onChange={(e) => setPriceRange(e.target.value)}
                                    className="w-full h-12 pl-4 pr-4 rounded-xl bg-background/50 border border-neutral-200 dark:border-white/5 focus:outline-none focus:ring-0 text-[10px] font-black uppercase tracking-widest cursor-pointer appearance-none"
                                >
                                    <option value="all">Pricing</option>
                                    <option value="free">Free Access</option>
                                    <option value="low">Under $50</option>
                                    <option value="medium">$50 - $200</option>
                                    <option value="high">$200+</option>
                                </select>
                            </div>
                        </div>
                    </GlassTile>
                </motion.div>

                {/* Results Count */}
                <div className="flex justify-between items-center mb-10 px-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                        {eventsLoading ? 'Scanning Universe...' : `${feedEvents.length} Mission${feedEvents.length !== 1 ? 's' : ''} Identified`}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={cn(
                                'p-2 rounded-xl transition-all',
                                viewMode === 'grid'
                                    ? 'bg-black dark:bg-white text-white dark:text-black'
                                    : 'text-neutral-400 hover:text-black dark:hover:text-white'
                            )}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn(
                                'p-2 rounded-xl transition-all',
                                viewMode === 'list'
                                    ? 'bg-black dark:bg-white text-white dark:text-black'
                                    : 'text-neutral-400 hover:text-black dark:hover:text-white'
                            )}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Events Grid */}
                {eventsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-96 rounded-[2rem] bg-neutral-100 dark:bg-white/5 animate-pulse" />
                        ))}
                    </div>
                ) : feedEvents.length === 0 ? (
                    <GlassTile className="py-32 text-center rounded-[32px]" interactive={false}>
                        <div className="bg-neutral-100 dark:bg-white/5 h-20 w-20 rounded-3xl flex items-center justify-center mx-auto mb-8">
                            <Calendar className="h-10 w-10 text-neutral-400" />
                        </div>
                        <h3 className="text-3xl font-black tracking-tighter mb-4">Matrix Empty</h3>
                        <p className="text-neutral-500 mb-10 max-w-sm mx-auto font-bold uppercase tracking-widest text-[10px]">
                            No missions detected in this coordinate range.
                        </p>
                    </GlassTile>
                ) : (
                    <div className={cn(
                        'grid gap-6',
                        viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5' : 'grid-cols-1'
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
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: index * 0.05 }}
                                >
                                    <GlassTile className="p-0 h-full flex flex-col group overflow-hidden rounded-[2rem]" hoverScale={1.02}>
                                        <div className="relative h-40 overflow-hidden">
                                            <img
                                                src={event.image_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=600&auto=format&fit=crop'}
                                                alt={event.title || 'Event'}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                                            <button
                                                type="button"
                                                onClick={() => toggleSave(event.id)}
                                                className={cn(
                                                    'absolute top-3 right-3 h-8 w-8 rounded-xl backdrop-blur-md border flex items-center justify-center transition-all',
                                                    isSaved
                                                        ? 'bg-red-500/20 border-red-500/30 text-red-400'
                                                        : 'bg-white/20 border-white/20 text-white hover:bg-white/30'
                                                )}
                                            >
                                                <Heart className={cn('h-3 w-3', isSaved ? 'fill-red-400' : '')} />
                                            </button>

                                            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                                                <div>
                                                    <div className="text-[7px] font-bold uppercase tracking-widest text-white/60 mb-0.5">Origin</div>
                                                    <div className="text-[10px] font-black text-white">{event.categories?.name || 'General'}</div>
                                                </div>
                                                <div className="bg-white/20 backdrop-blur-md border border-white/20 rounded-lg px-2 py-1 text-white">
                                                    <div className="text-xs font-black leading-none">
                                                        {event.price === 0 || !event.price ? 'FREE' : `$${event.price}`}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-5 flex-grow flex flex-col">
                                            <h4 className="text-base font-black tracking-tight mb-2 line-clamp-1 leading-tight group-hover:text-blue-500 transition-colors">
                                                {event.title || 'Untitled Event'}
                                            </h4>

                                            <div className="space-y-1.5 mb-4">
                                                <div className="flex items-center gap-2 text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
                                                    <Calendar className="h-2.5 w-2.5 text-blue-500" />
                                                    {event.date ? new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}
                                                </div>
                                                <div className="flex items-center gap-2 text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
                                                    <MapPin className="h-2.5 w-2.5 text-blue-500" />
                                                    <span className="truncate">{event.location?.split(',')[0] || 'Worldwide'}</span>
                                                </div>
                                            </div>

                                            <div className="mt-auto pt-3 border-t border-neutral-100 dark:border-white/5">
                                                <EventRating
                                                    rating={rating}
                                                    reviewCount={reviewCount}
                                                    size="sm"
                                                    showCount={true}
                                                    className="text-[8px] font-black uppercase tracking-widest text-neutral-400"
                                                />
                                            </div>

                                            <div className="pt-4">
                                                <Link href={`/events/${event.id}`}>
                                                    <Button className="w-full h-10 rounded-xl bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-[9px] hover:scale-[1.02] transition-transform">
                                                        Access Mission
                                                        <ArrowRight className="ml-2 h-3 w-3" />
                                                    </Button>
                                                </Link>
                                            </div>
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
