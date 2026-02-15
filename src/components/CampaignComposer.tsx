'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { Mail, Send, Save, X, History } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassTile } from '@/components/ui/glass-tile'

interface CampaignComposerProps {
    eventId: string
    organizationId: string
    recipientCount: number
    onSuccess?: () => void
}

export const CampaignComposer: React.FC<CampaignComposerProps> = ({ eventId, organizationId, recipientCount, onSuccess }) => {
    const { toast } = useToast()
    const [subject, setSubject] = useState('')
    const [content, setContent] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showComposer, setShowComposer] = useState(false)

    const handleSend = async () => {
        if (!subject.trim() || !content.trim()) return

        setIsSubmitting(true)
        try {
            const { error } = await supabase
                .from('email_campaigns')
                .insert({
                    event_id: eventId,
                    organization_id: organizationId,
                    subject,
                    content,
                    status: 'SENT',
                    recipient_count: recipientCount,
                    sent_at: new Date().toISOString()
                })

            if (error) throw error

            toast({
                title: "Campaign Dispatched",
                description: `Successfully initiated broadcast to ${recipientCount} attendees.`
            })
            setSubject('')
            setContent('')
            setShowComposer(false)
            onSuccess?.()
        } catch (error: any) {
            toast({
                title: "Dispatch Failed",
                description: error.message || "Failed to broadcast email campaign.",
                variant: "destructive"
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button 
                    onClick={() => setShowComposer(!showComposer)}
                    className="h-12 px-6 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-[10px]"
                >
                    {showComposer ? <X className="h-4 w-4 mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
                    {showComposer ? "Cancel Campaign" : "Broadcast to Attendees"}
                </Button>
            </div>

            <AnimatePresence>
                {showComposer && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                    >
                        <GlassTile className="p-8 border-2 border-blue-500/20" interactive={false}>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Campaign Subject</Label>
                                    <Input 
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="Important Update Regarding..."
                                        className="h-14 rounded-2xl bg-white/5 border-white/10 font-bold text-lg"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Transmission Content</Label>
                                    <Textarea 
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Dear Attendees..."
                                        className="min-h-[200px] rounded-2xl bg-white/5 border-white/10 font-medium p-6"
                                    />
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-2 text-neutral-500">
                                        <History className="h-4 w-4" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">
                                            Target: {recipientCount} Active Node{recipientCount !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <Button 
                                        onClick={handleSend}
                                        disabled={isSubmitting || !subject.trim() || !content.trim()}
                                        className="h-14 px-10 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-500/20"
                                    >
                                        {isSubmitting ? "Broadcasting..." : "Dispatch Now"}
                                        {!isSubmitting && <Send className="ml-2 h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        </GlassTile>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
