'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { GlassTile } from '@/components/ui/glass-tile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { CalendarPlus, Trash2 } from 'lucide-react'

type Session = {
  id: string
  title: string
  description: string | null
  start_at: string | null
  end_at: string | null
  location: string | null
}

export default function ScheduleClient() {
  const params = useParams()
  const eventId = params.id as string | undefined
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState<Session[]>([])

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')
  const [location, setLocation] = useState('')

  const canSubmit = useMemo(() => title.trim().length > 0, [title])

  const load = async () => {
    if (!eventId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('event_sessions')
      .select('id, title, description, start_at, end_at, location')
      .eq('event_id', eventId)
      .order('start_at', { ascending: true })
    if (!error) setSessions(data || [])
    else console.error(error)
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId])

  const createSession = async () => {
    if (!eventId || !user?.id) return
    if (!canSubmit) return

    const payload = {
      event_id: eventId,
      title: title.trim(),
      description: description.trim() ? description.trim() : null,
      start_at: startAt ? new Date(startAt).toISOString() : null,
      end_at: endAt ? new Date(endAt).toISOString() : null,
      location: location.trim() ? location.trim() : null,
      created_by: user.id,
    }

    const { error } = await supabase.from('event_sessions').insert(payload)
    if (error) {
      console.error(error)
      return
    }

    setTitle('')
    setDescription('')
    setStartAt('')
    setEndAt('')
    setLocation('')
    await load()
  }

  const deleteSession = async (id: string) => {
    const { error } = await supabase.from('event_sessions').delete().eq('id', id)
    if (error) {
      console.error(error)
      return
    }
    await load()
  }

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-x-hidden">
      <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />
      <main className="flex-grow pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-6xl space-y-8">
          <GlassTile className="p-10" interactive={false}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                <CalendarPlus className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-[0.9]">Schedule</h1>
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mt-2">
                  Build the agenda sessions shown on the public event page
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Session title" className="h-12 rounded-2xl font-bold" />
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location (optional)" className="h-12 rounded-2xl font-bold" />
              <Input value={startAt} onChange={(e) => setStartAt(e.target.value)} type="datetime-local" className="h-12 rounded-2xl font-bold" />
              <Input value={endAt} onChange={(e) => setEndAt(e.target.value)} type="datetime-local" className="h-12 rounded-2xl font-bold" />
            </div>
            <div className="mt-4">
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Session description (optional)" className="rounded-2xl min-h-[120px]" />
            </div>
            <div className="mt-5">
              <Button onClick={createSession} disabled={!canSubmit} className="h-12 rounded-2xl font-black">
                Add Session
              </Button>
            </div>
          </GlassTile>

          {loading ? (
            <div className="grid grid-cols-1 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-28 rounded-3xl bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {sessions.map((s) => (
                <GlassTile key={s.id} className="p-6" interactive={false}>
                  <div className="flex items-start justify-between gap-6">
                    <div className="min-w-0">
                      <div className="text-lg font-black tracking-tight">{s.title}</div>
                      {s.description && <div className="text-sm text-neutral-500 font-medium mt-2 whitespace-pre-wrap">{s.description}</div>}
                      <div className="mt-3 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                        {s.start_at ? new Date(s.start_at).toLocaleString() : 'TBD'}
                        {s.end_at ? ` → ${new Date(s.end_at).toLocaleTimeString()}` : ''}
                        {s.location ? ` • ${s.location}` : ''}
                      </div>
                    </div>
                    <Button variant="ghost" className="h-10 w-10 p-0 rounded-2xl" onClick={() => deleteSession(s.id)} aria-label="Delete session">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </GlassTile>
              ))}

              {sessions.length === 0 && (
                <GlassTile className="p-12 text-center" interactive={false}>
                  <div className="text-sm font-bold uppercase tracking-widest text-neutral-400">No sessions yet.</div>
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

