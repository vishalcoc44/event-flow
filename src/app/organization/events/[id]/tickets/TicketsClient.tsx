'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { GlassTile } from '@/components/ui/glass-tile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Ticket, Plus, Trash2 } from 'lucide-react'

type TicketType = {
  id: string
  name: string
  description: string | null
  price: number
  currency: string
  quantity_available: number | null
  is_active: boolean
}

export default function TicketsClient() {
  const params = useParams()
  const eventId = params.id as string | undefined
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([])
  const [name, setName] = useState('')
  const [price, setPrice] = useState('0')
  const [quantity, setQuantity] = useState('')

  const canSubmit = useMemo(() => name.trim().length > 0, [name])

  const load = async () => {
    if (!eventId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('ticket_types')
      .select('id, name, description, price, currency, quantity_available, is_active')
      .eq('event_id', eventId)
      .order('price', { ascending: true })
    if (!error) {
      setTicketTypes((data || []).map((t: any) => ({ ...t, price: Number(t.price ?? 0) })))
    } else {
      console.error(error)
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId])

  const createTier = async () => {
    if (!eventId || !user?.id) return
    if (!canSubmit) return

    const qty = quantity.trim() ? parseInt(quantity, 10) : null
    const payload = {
      event_id: eventId,
      name: name.trim(),
      price: Number(price || 0),
      currency: 'USD',
      quantity_available: Number.isFinite(qty as any) && (qty as number) > 0 ? qty : null,
      is_active: true,
      created_by: user.id,
    }

    const { error } = await supabase.from('ticket_types').insert(payload)
    if (error) {
      console.error(error)
      return
    }
    setName('')
    setPrice('0')
    setQuantity('')
    await load()
  }

  const deleteTier = async (id: string) => {
    const { error } = await supabase.from('ticket_types').delete().eq('id', id)
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
        <div className="container mx-auto px-4 max-w-5xl space-y-8">
          <GlassTile className="p-10" interactive={false}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                <Ticket className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-[0.9]">Ticket Tiers</h1>
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mt-2">
                  Configure pricing ladders per event
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tier name (e.g. VIP)" className="h-12 rounded-2xl font-bold" />
              <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" type="number" step="0.01" className="h-12 rounded-2xl font-bold" />
              <Input value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Quantity (optional)" type="number" className="h-12 rounded-2xl font-bold" />
            </div>

            <div className="mt-5">
              <Button onClick={createTier} disabled={!canSubmit} className="h-12 rounded-2xl font-black">
                <Plus className="h-4 w-4 mr-2" />
                Add Tier
              </Button>
            </div>
          </GlassTile>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(loading ? [] : ticketTypes).map((t) => (
              <GlassTile key={t.id} className="p-6" interactive={false}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-lg font-black tracking-tight">{t.name}</div>
                    <div className="mt-2 text-sm font-bold text-blue-500">
                      {t.price === 0 ? 'Free' : `$${t.price}`} <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-2">{t.currency}</span>
                    </div>
                    {typeof t.quantity_available === 'number' && (
                      <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                        Quantity: {t.quantity_available}
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" className="h-10 w-10 p-0 rounded-2xl" onClick={() => deleteTier(t.id)} aria-label="Delete tier">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </GlassTile>
            ))}
          </div>

          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-40 rounded-3xl bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

