'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { EventPoll, EventPollVote } from '@/types/database'
import { useAuth } from './AuthContext'

interface PollContextType {
    polls: EventPoll[]
    userVotes: Record<string, number> // poll_id -> option_index
    loading: boolean
    createPoll: (eventId: string, question: string, options: string[]) => Promise<void>
    vote: (poll_id: string, option_index: number) => Promise<void>
    togglePollStatus: (poll_id: string, currentStatus: boolean) => Promise<void>
    deletePoll: (poll_id: string) => Promise<void>
    loadEventPolls: (eventId: string) => Promise<void>
}

const PollContext = createContext<PollContextType | undefined>(undefined)

export function PollProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth()
    const [polls, setPolls] = useState<EventPoll[]>([])
    const [userVotes, setUserVotes] = useState<Record<string, number>>({})
    const [loading, setLoading] = useState(false)

    const loadEventPolls = async (eventId: string) => {
        setLoading(true)
        try {
            // Load polls
            const { data: pollsData, error: pollsError } = await supabase
                .from('event_polls')
                .select('*')
                .eq('event_id', eventId)
                .order('created_at', { ascending: false })

            if (pollsError) throw pollsError
            setPolls(pollsData || [])

            // Load user votes if logged in
            if (user) {
                const { data: votesData, error: votesError } = await supabase
                    .from('event_poll_votes')
                    .select('poll_id, option_index')
                    .eq('user_id', user.id)

                if (votesError) throw votesError
                const votesMap = (votesData || []).reduce((acc: Record<string, number>, vote) => {
                    acc[vote.poll_id] = vote.option_index
                    return acc
                }, {})
                setUserVotes(votesMap)
            }
        } catch (error) {
            console.error('Error loading polls:', error)
        } finally {
            setLoading(false)
        }
    }

    const createPoll = async (eventId: string, question: string, options: string[]) => {
        const { data, error } = await supabase
            .from('event_polls')
            .insert({
                event_id: eventId,
                question,
                options,
                results: new Array(options.length).fill(0),
                created_by: user?.id,
                is_active: true
            })
            .select()
            .single()

        if (error) throw error

        if (data) {
            setPolls(prev => {
                if (prev.find(p => p.id === data.id)) return prev;
                return [data as EventPoll, ...prev];
            });
        }
    }

    const vote = async (pollId: string, optionIndex: number) => {
        if (!user) throw new Error('Must be logged in to vote')

        const { error } = await supabase
            .from('event_poll_votes')
            .upsert({
                poll_id: pollId,
                user_id: user.id,
                option_index: optionIndex
            })

        if (error) throw error

        setUserVotes(prev => ({ ...prev, [pollId]: optionIndex }))
    }

    const togglePollStatus = async (pollId: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('event_polls')
            .update({ is_active: !currentStatus })
            .eq('id', pollId)

        if (error) throw error
    }

    const deletePoll = async (pollId: string) => {
        const { error } = await supabase
            .from('event_polls')
            .delete()
            .eq('id', pollId)

        if (error) throw error
    }

    // Subscribe to Realtime changes for polls
    useEffect(() => {
        const channel = supabase
            .channel('public:event_polls')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'event_polls' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setPolls(prev => {
                        if (prev.find(p => p.id === payload.new.id)) return prev;
                        return [payload.new as EventPoll, ...prev];
                    })
                } else if (payload.eventType === 'UPDATE') {
                    setPolls(prev => prev.map(p => p.id === payload.new.id ? payload.new as EventPoll : p))
                } else if (payload.eventType === 'DELETE') {
                    setPolls(prev => prev.filter(p => p.id === payload.old.id))
                }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    return (
        <PollContext.Provider value={{
            polls,
            userVotes,
            loading,
            createPoll,
            vote,
            togglePollStatus,
            deletePoll,
            loadEventPolls
        }}>
            {children}
        </PollContext.Provider>
    )
}

export function usePolls() {
    const context = useContext(PollContext)
    if (context === undefined) {
        throw new Error('usePolls must be used within a PollProvider')
    }
    return context
}
