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
import { Mic, Plus, Trash2 } from 'lucide-react'

type Speaker = {
  id: string
  name: string
  bio: string | null
  avatar_url: string | null
  website_url: string | null
}

type EventSpeaker = {
  role: string | null
  sort_order: number
  speaker: Speaker | null
}

export default function SpeakersClient() {
  const params = useParams()
  const eventId = params.id as string | undefined
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [eventSpeakers, setEventSpeakers] = useState<EventSpeaker[]>([])

  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [bio, setBio] = useState('')

  const canSubmit = useMemo(() => name.trim().length > 0, [name])

  const load = async () => {
    if (!eventId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('event_speakers')
      .select('role, sort_order, speaker:speakers(id, name, bio, avatar_url, website_url)')
      .eq('event_id', eventId)
      .order('sort_order', { ascending: true })
    if (!error) setEventSpeakers((data || []) as any)
    else console.error(error)
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId])

  const addSpeaker = async () => {
    if (!eventId || !user?.id) return
    if (!canSubmit) return

    const { data: speakerRow, error: speakerError } = await supabase
      .from('speakers')
      .insert({
        name: name.trim(),
        bio: bio.trim() ? bio.trim() : null,
        created_by: user.id,
      })
      .select('id')
      .single()

    if (speakerError || !speakerRow?.id) {
      console.error(speakerError)
      return
    }

    const { error: linkError } = await supabase
      .from('event_speakers')
      .insert({
        event_id: eventId,
        speaker_id: speakerRow.id,
        role: role.trim() ? role.trim() : null,
        sort_order: eventSpeakers.length,
      })

    if (linkError) {
      console.error(linkError)
      return
    }

    setName('')
    setRole('')
    setBio('')
    await load()
  }

  const removeSpeaker = async (speakerId: string) => {
    if (!eventId) return
    const { error } = await supabase
      .from('event_speakers')
      .delete()
      .eq('event_id', eventId)
      .eq('speaker_id', speakerId)
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
                <Mic className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-[0.9]">Speakers</h1>
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mt-2">
                  Add speakers shown on the public event page
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Speaker name" className="h-12 rounded-2xl font-bold" />
              <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role (optional) e.g. Keynote" className="h-12 rounded-2xl font-bold" />
            </div>
            <div className="mt-4">
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Bio (optional)" className="rounded-2xl min-h-[120px]" />
            </div>
            <div className="mt-5">
              <Button onClick={addSpeaker} disabled={!canSubmit} className="h-12 rounded-2xl font-black">
                <Plus className="h-4 w-4 mr-2" />
                Add Speaker
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {eventSpeakers.map((row) => {
                const sp = row.speaker
                if (!sp) return null
                return (
                  <GlassTile key={sp.id} className="p-6" interactive={false}>
                    <div className="flex items-start justify-between gap-6">
                      <div className="min-w-0">
                        <div className="text-lg font-black tracking-tight">{sp.name}</div>
                        {row.role && <div className="text-[10px] font-black uppercase tracking-widest text-blue-500 mt-1">{row.role}</div>}
                        {sp.bio && <div className="text-sm text-neutral-500 font-medium mt-3 whitespace-pre-wrap line-clamp-5">{sp.bio}</div>}
                      </div>
                      <Button variant="ghost" className="h-10 w-10 p-0 rounded-2xl" onClick={() => removeSpeaker(sp.id)} aria-label="Remove speaker">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </GlassTile>
                )
              })}

              {eventSpeakers.length === 0 && (
                <GlassTile className="p-12 text-center md:col-span-2" interactive={false}>
                  <div className="text-sm font-bold uppercase tracking-widest text-neutral-400">No speakers yet.</div>
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

