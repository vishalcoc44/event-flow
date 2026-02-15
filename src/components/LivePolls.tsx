'use client'

import React, { useState, useEffect } from 'react'
import { usePolls } from '@/contexts/PollContext'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, Plus, Trash2, X, CheckCircle2, Lock, Unlock, Users } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

interface LivePollsProps {
    eventId: string
    isOrganizer?: boolean
    isAttendee?: boolean
}

export const LivePolls: React.FC<LivePollsProps> = ({ eventId, isOrganizer = false, isAttendee = false }) => {
    const { polls, userVotes, loading, createPoll, vote, togglePollStatus, deletePoll, loadEventPolls } = usePolls()
    const { user } = useAuth()
    const { toast } = useToast()

    const [showCreateForm, setShowCreateForm] = useState(false)
    const [newQuestion, setNewQuestion] = useState('')
    const [newOptions, setNewOptions] = useState(['', ''])
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        loadEventPolls(eventId)
    }, [eventId])

    const handleCreatePoll = async (e: React.FormEvent) => {
        e.preventDefault()
        const validOptions = newOptions.filter(opt => opt.trim() !== '')
        if (validOptions.length < 2) {
            toast({
                title: "Invalid Poll",
                description: "Please provide at least two options.",
                variant: "destructive"
            })
            return
        }

        setIsSubmitting(true)
        try {
            await createPoll(eventId, newQuestion, validOptions)
            toast({
                title: "Poll Created",
                description: "Your interactive poll is now live!"
            })
            setShowCreateForm(false)
            setNewQuestion('')
            setNewOptions(['', ''])
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to create poll",
                variant: "destructive"
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleVote = async (pollId: string, optionIndex: number) => {
        if (!isAttendee) {
            toast({
                title: "Access Denied",
                description: "Only confirmed attendees can vote in polls.",
                variant: "destructive"
            })
            return
        }

        try {
            await vote(pollId, optionIndex)
            toast({
                title: "Vote Recorded",
                description: "Thank you for your feedback!"
            })
        } catch (error: any) {
            toast({
                title: "Voting Failed",
                description: error.message || "Unable to process your vote.",
                variant: "destructive"
            })
        }
    }

    const addOption = () => setNewOptions([...newOptions, ''])
    const removeOption = (index: number) => {
        if (newOptions.length > 2) {
            setNewOptions(newOptions.filter((_, i) => i !== index))
        }
    }

    const getTotalVotes = (results: number[]) => results.reduce((a, b) => a + b, 0)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    <h3 className="text-xl font-bold tracking-tight">Interactive Polls</h3>
                </div>
                {isOrganizer && (
                    <Button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        variant={showCreateForm ? "ghost" : "outline"}
                        size="sm"
                        className="rounded-xl font-bold uppercase tracking-widest text-[10px]"
                    >
                        {showCreateForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                        {showCreateForm ? "Cancel" : "Create Poll"}
                    </Button>
                )}
            </div>

            <AnimatePresence>
                {showCreateForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <Card className="border-2 border-dashed border-blue-500/30 bg-blue-500/5 rounded-2xl">
                            <CardContent className="pt-6 space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Question</Label>
                                    <Input
                                        placeholder="What would you like to ask?"
                                        value={newQuestion}
                                        onChange={(e) => setNewQuestion(e.target.value)}
                                        className="h-12 rounded-xl font-bold"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Options</Label>
                                    {newOptions.map((option, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Input
                                                placeholder={`Option ${index + 1}`}
                                                value={option}
                                                onChange={(e) => {
                                                    const updated = [...newOptions]
                                                    updated[index] = e.target.value
                                                    setNewOptions(updated)
                                                }}
                                                className="h-10 rounded-xl"
                                            />
                                            {newOptions.length > 2 && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeOption(index)}
                                                    className="h-10 w-10 text-red-500"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                    <Button
                                        variant="ghost"
                                        onClick={addOption}
                                        className="w-full h-10 border border-dashed border-neutral-200 dark:border-white/10 rounded-xl text-xs font-bold"
                                    >
                                        <Plus className="h-3 w-3 mr-2" /> Add Option
                                    </Button>
                                </div>
                                <Button
                                    onClick={handleCreatePoll}
                                    disabled={isSubmitting || !newQuestion.trim()}
                                    className="w-full h-12 rounded-xl bg-blue-600 text-white font-black uppercase tracking-widest text-[10px]"
                                >
                                    Launch Poll
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid gap-4">
                {polls.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-neutral-100 dark:border-white/5 rounded-3xl">
                        <Users className="h-8 w-8 text-neutral-300 mx-auto mb-3" />
                        <p className="text-sm font-bold text-neutral-400">No active polls at the moment.</p>
                    </div>
                ) : (
                    polls.map((poll) => {
                        const totalVotes = getTotalVotes(poll.results)
                        const hasVoted = userVotes[poll.id] !== undefined
                        const selectedOption = userVotes[poll.id]

                        return (
                            <Card key={poll.id} className="rounded-2xl overflow-hidden border-neutral-200 dark:border-white/10">
                                <CardHeader className="pb-4">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <Badge variant={poll.is_active ? "default" : "secondary"} className="rounded-lg font-black text-[8px] uppercase tracking-widest mb-1">
                                                {poll.is_active ? "Live" : "Closed"}
                                            </Badge>
                                            <CardTitle className="text-lg font-bold leading-tight">{poll.question}</CardTitle>
                                        </div>
                                        {isOrganizer && (
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => togglePollStatus(poll.id, poll.is_active)}
                                                    title={poll.is_active ? "Close Poll" : "Open Poll"}
                                                    className="h-8 w-8"
                                                >
                                                    {poll.is_active ? <Unlock className="h-4 w-4 text-green-500" /> : <Lock className="h-4 w-4 text-amber-500" />}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => deletePoll(poll.id)}
                                                    className="h-8 w-8 text-red-500"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest">
                                        {totalVotes} Total Votes
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {poll.options.map((option, idx) => {
                                        const votes = poll.results[idx] || 0
                                        const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0
                                        const isSelected = selectedOption === idx

                                        return (
                                            <div key={idx} className="relative">
                                                <Button
                                                    variant="outline"
                                                    disabled={!poll.is_active || hasVoted || !isAttendee}
                                                    onClick={() => handleVote(poll.id, idx)}
                                                    className={cn(
                                                        "w-full h-12 justify-start px-4 rounded-xl font-bold relative overflow-hidden transition-all duration-500",
                                                        isSelected && "border-blue-500 ring-1 ring-blue-500",
                                                        (hasVoted || !poll.is_active) && "hover:bg-transparent cursor-default"
                                                    )}
                                                >
                                                    <div
                                                        className={cn(
                                                            "absolute left-0 top-0 bottom-0 bg-blue-500/10 transition-all duration-1000 ease-out",
                                                            (hasVoted || !poll.is_active) ? "opacity-100" : "opacity-0"
                                                        )}
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                    <span className="relative z-10 flex items-center justify-between w-full">
                                                        <span className="flex items-center gap-2">
                                                            {option}
                                                            {isSelected && <CheckCircle2 className="h-4 w-4 text-blue-500" />}
                                                        </span>
                                                        {(hasVoted || !poll.is_active) && (
                                                            <span className="text-[10px] font-black opacity-50">{Math.round(percentage)}%</span>
                                                        )}
                                                    </span>
                                                </Button>
                                            </div>
                                        )
                                    })}
                                    {!isAttendee && !isOrganizer && poll.is_active && (
                                        <p className="text-[9px] font-bold text-neutral-400 text-center uppercase tracking-widest">
                                            Join this event to participate in polls
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })
                )}
            </div>
        </div>
    )
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ')
}
