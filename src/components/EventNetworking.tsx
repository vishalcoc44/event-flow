'use client'

import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { NetworkingMessage } from '@/types/database'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Users, MessageSquare, X, ShieldCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface EventNetworkingProps {
    eventId: string
    isOpen: boolean
    onClose: () => void
}

export const EventNetworking: React.FC<EventNetworkingProps> = ({ eventId, isOpen, onClose }) => {
    const { user } = useAuth()
    const [messages, setMessages] = useState<NetworkingMessage[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!isOpen) return

        const fetchMessages = async () => {
            setIsLoading(true)
            const { data, error } = await supabase
                .from('networking_messages')
                .select('*, user:users(id, first_name, last_name, username)')
                .eq('event_id', eventId)
                .order('created_at', { ascending: true })

            if (!error && data) {
                setMessages(data)
            }
            setIsLoading(false)
            scrollToBottom()
        }

        fetchMessages()

        // Subscribe to Realtime
        const channel = supabase
            .channel(`event_chat:${eventId}`)
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'networking_messages',
                filter: `event_id=eq.${eventId}`
            }, async (payload) => {
                const { data } = await supabase
                    .from('users')
                    .select('id, first_name, last_name, username')
                    .eq('id', payload.new.user_id)
                    .single()
                
                const messageWithUser = { ...payload.new, user: data } as NetworkingMessage
                setMessages(prev => [...prev, messageWithUser])
                scrollToBottom()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [eventId, isOpen])

    const scrollToBottom = () => {
        setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight
            }
        }, 100)
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user || !newMessage.trim()) return

        const messageContent = newMessage.trim()
        setNewMessage('')

        const { error } = await supabase
            .from('networking_messages')
            .insert({
                event_id: eventId,
                user_id: user.id,
                content: messageContent
            })

        if (error) {
            console.error('Error sending message:', error)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-neutral-950 shadow-2xl z-50 border-l border-neutral-200 dark:border-white/10 flex flex-col"
                >
                    <div className="p-6 border-b border-neutral-100 dark:border-white/5 flex items-center justify-between bg-blue-600 text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-black tracking-tight text-lg leading-none">Event Pulse.</h3>
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mt-1">Live Networking Chat</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="flex-grow overflow-y-auto scrollbar-hide" ref={scrollRef}>
                        <div className="p-6 space-y-6">
                            <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-3">
                                <ShieldCheck className="h-4 w-4 text-blue-500 mt-0.5" />
                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest leading-relaxed">
                                    This is a private space for confirmed attendees. Maintain respect and professional conduct.
                                </p>
                            </div>

                            {isLoading ? (
                                <div className="flex justify-center py-10">
                                    <motion.div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="text-center py-20">
                                    <MessageSquare className="h-12 w-12 text-neutral-100 dark:text-white/5 mx-auto mb-4" />
                                    <p className="text-sm font-bold text-neutral-400">Be the first to say hello!</p>
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isOwn = msg.user_id === user?.id
                                    return (
                                        <div key={msg.id} className={cn("flex flex-col gap-1", isOwn ? "items-end" : "items-start")}>
                                            <div className="flex items-center gap-2 mb-1">
                                                {!isOwn && (
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">
                                                        {msg.user?.username || msg.user?.first_name || 'Attendee'}
                                                    </span>
                                                )}
                                                <span className="text-[8px] font-bold text-neutral-400 uppercase">
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div className={cn(
                                                "px-4 py-3 rounded-2xl text-sm font-medium max-w-[85%] shadow-sm",
                                                isOwn 
                                                    ? "bg-black dark:bg-white text-white dark:text-black rounded-tr-none" 
                                                    : "bg-neutral-100 dark:bg-white/5 text-neutral-800 dark:text-neutral-200 rounded-tl-none"
                                            )}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>

                    <div className="p-6 bg-neutral-50 dark:bg-white/5 border-t border-neutral-100 dark:border-white/5">
                        <form onSubmit={handleSendMessage} className="relative">
                            <Input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Sync message..."
                                className="h-14 pl-6 pr-14 rounded-2xl bg-white dark:bg-black border-neutral-200 dark:border-white/10 font-bold focus:ring-blue-500/20 shadow-inner"
                            />
                            <Button 
                                type="submit"
                                disabled={!newMessage.trim()}
                                size="icon"
                                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}