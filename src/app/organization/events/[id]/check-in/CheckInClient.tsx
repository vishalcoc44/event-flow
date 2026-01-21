'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { GlassTile } from '@/components/ui/glass-tile'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { CheckCircle2, QrCode, Users } from 'lucide-react'

type BookingRow = {
  id: string
  user_id: string | null
  status: string
  created_at: string
  user?: {
    id: string
    email: string
    first_name: string | null
    last_name: string | null
    username: string | null
  } | null
}

export default function CheckInClient() {
  const params = useParams()
  const eventId = params.id as string | undefined
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [checkedInBookingIds, setCheckedInBookingIds] = useState<Set<string>>(new Set())

  const load = async () => {
    if (!eventId) return
    setLoading(true)

    const [{ data: bookingData, error: bookingError }, { data: checkinsData, error: checkinsError }] = await Promise.all([
      supabase
        .from('bookings')
        .select('id, user_id, status, created_at, user:users(id, email, first_name, last_name, username)')
        .eq('event_id', eventId)
        .eq('status', 'CONFIRMED')
        .order('created_at', { ascending: false }),
      supabase
        .from('event_checkins')
        .select('booking_id')
        .eq('event_id', eventId),
    ])

    if (bookingError) console.error('Failed to load bookings:', bookingError)
    if (checkinsError) console.error('Failed to load check-ins:', checkinsError)

    setBookings((bookingData || []) as any)
    setCheckedInBookingIds(new Set((checkinsData || []).map((c: any) => c.booking_id).filter(Boolean)))
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId])

  const checkedInCount = useMemo(() => {
    let c = 0
    for (const b of bookings) if (checkedInBookingIds.has(b.id)) c++
    return c
  }, [bookings, checkedInBookingIds])

  const toggleCheckIn = async (bookingId: string, isCheckedIn: boolean) => {
    if (!user?.id || !eventId) return

    if (isCheckedIn) {
      const { error } = await supabase
        .from('event_checkins')
        .delete()
        .eq('event_id', eventId)
        .eq('booking_id', bookingId)
      if (!error) await load()
    } else {
      const { error } = await supabase
        .from('event_checkins')
        .insert({ event_id: eventId, booking_id: bookingId, checked_in_by: user.id })
      if (!error) await load()
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-x-hidden">
      <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />
      <main className="flex-grow pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-6xl space-y-8">
          <GlassTile className="p-10" interactive={false}>
            <div className="flex items-center justify-between gap-6 flex-wrap">
              <div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-[0.9]">Check-in</h1>
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mt-2">
                  Checked in {checkedInCount} / {bookings.length}
                </p>
              </div>
              <div className="flex items-center gap-3 text-neutral-500">
                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  <Users className="h-5 w-5" />
                </div>
                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  <QrCode className="h-5 w-5" />
                </div>
              </div>
            </div>
          </GlassTile>

          {loading ? (
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-3xl bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {bookings.map((b) => {
                const isCheckedIn = checkedInBookingIds.has(b.id)
                const label = b.user
                  ? (b.user.first_name || b.user.last_name
                    ? `${b.user.first_name || ''} ${b.user.last_name || ''}`.trim()
                    : (b.user.username || b.user.email))
                  : (b.user_id || 'Unknown')

                return (
                  <GlassTile key={b.id} className="p-6" interactive={false}>
                    <div className="flex items-center justify-between gap-6 flex-wrap">
                      <div className="min-w-0">
                        <div className="text-lg font-black tracking-tight truncate">{label}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mt-2">
                          Booking ID: {b.id}
                        </div>
                      </div>
                      <Button
                        onClick={() => toggleCheckIn(b.id, isCheckedIn)}
                        className={isCheckedIn ? 'h-12 rounded-2xl font-black bg-green-600 hover:bg-green-600' : 'h-12 rounded-2xl font-black'}
                        variant={isCheckedIn ? 'default' : 'outline'}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        {isCheckedIn ? 'Checked In' : 'Check In'}
                      </Button>
                    </div>
                  </GlassTile>
                )
              })}

              {bookings.length === 0 && (
                <GlassTile className="p-12 text-center" interactive={false}>
                  <div className="text-sm font-bold uppercase tracking-widest text-neutral-400">No confirmed bookings yet.</div>
                </GlassTile>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

