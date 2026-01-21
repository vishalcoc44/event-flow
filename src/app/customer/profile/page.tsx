'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useToast } from '@/components/ui/use-toast'
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, X, Shield, Settings, Briefcase } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { GlassTile } from '@/components/ui/glass-tile'
import { cn } from '@/lib/utils'

export default function CustomerProfile() {
    const { user } = useAuth()
    const { toast } = useToast()
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        username: '',
        contact_number: '',
        city: '',
        pincode: '',
        street_address: ''
    })

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                username: user.username || '',
                contact_number: user.contact_number || '',
                city: user.city || '',
                pincode: user.pincode || '',
                street_address: user.street_address || ''
            })
        }
    }, [user])

    const getInitials = (firstName?: string, lastName?: string, email?: string) => {
        if (firstName && lastName) {
            return `${firstName[0]}${lastName[0]}`.toUpperCase()
        } else if (firstName) {
            return firstName[0].toUpperCase()
        } else if (email) {
            return email[0].toUpperCase()
        }
        return 'U'
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSave = async () => {
        if (!user) return
        setLoading(true)
        try {
            const { error: authError } = await supabase.auth.updateUser({
                data: {
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    username: formData.username,
                    contact_number: formData.contact_number,
                    city: formData.city,
                    pincode: formData.pincode,
                    street_address: formData.street_address
                }
            })
            if (authError) throw authError

            const { error: dbError } = await supabase
                .from('users')
                .update({
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    username: formData.username,
                    contact_number: formData.contact_number,
                    city: formData.city,
                    pincode: formData.pincode,
                    street_address: formData.street_address
                })
                .eq('id', user.id)

            if (dbError) throw dbError

            toast({ title: "Profile Updated", description: "Your digital identity has been synchronized." })
            setIsEditing(false)
        } catch (error: any) {
            toast({ title: "Update Failed", description: error.message, variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                username: user.username || '',
                contact_number: user.contact_number || '',
                city: user.city || '',
                pincode: user.pincode || '',
                street_address: user.street_address || ''
            })
        }
        setIsEditing(false)
    }

    return (
        <div className="min-h-screen flex flex-col bg-background relative overflow-x-hidden">
            {/* Mesh Background */}
            <div className="fixed inset-0 z-[-1] opacity-30 dark:opacity-20 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-400/20 blur-[120px]" />
            </div>

            <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />

            <main className="flex-grow pt-32 pb-20">
                <div className="container mx-auto px-4 max-w-6xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="mb-12"
                    >
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-2 leading-[0.9]">
                            Account Center.
                        </h1>
                        <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">
                            Manage your global presence and preferences
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Sidebar Profile Card */}
                        <motion.div
                            className="lg:col-span-4"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                        >
                            <GlassTile className="p-8 text-center" interactive={false}>
                                <div className="flex justify-center mb-8 relative">
                                    <div className="relative">
                                        <Avatar className="h-32 w-32 bg-blue-500 text-white shadow-2xl border-4 border-white dark:border-white/10">
                                            <AvatarFallback className="text-4xl font-black">
                                                {getInitials(user?.first_name, user?.last_name, user?.email)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-white dark:bg-black border border-neutral-100 dark:border-white/10 flex items-center justify-center text-blue-500 shadow-lg">
                                            <Shield className="h-5 w-5" />
                                        </div>
                                    </div>
                                </div>
                                <h2 className="text-2xl font-black tracking-tight mb-1">
                                    {user?.first_name} {user?.last_name || ''}
                                </h2>
                                <p className="text-sm font-bold text-neutral-400 mb-8 uppercase tracking-widest">{user?.email}</p>

                                <div className="space-y-4 pt-8 border-t border-neutral-100 dark:border-white/5">
                                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                                        <span className="text-neutral-400">Membership</span>
                                        <span className="text-blue-500">{user?.role === 'USER' ? 'Basic Member' : user?.role}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                                        <span className="text-neutral-400">Joined</span>
                                        <span>{user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}</span>
                                    </div>
                                </div>
                            </GlassTile>

                            <div className="mt-8 space-y-4">
                                <Button variant="ghost" className="w-full justify-start h-14 rounded-2xl gap-4 font-bold uppercase tracking-widest text-[10px] bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/5">
                                    <Settings className="h-4 w-4" /> Account Settings
                                </Button>
                                <Button variant="ghost" className="w-full justify-start h-14 rounded-2xl gap-4 font-bold uppercase tracking-widest text-[10px] hover:bg-white/40 dark:hover:bg-white/5">
                                    <Briefcase className="h-4 w-4" /> Security Log
                                </Button>
                            </div>
                        </motion.div>

                        {/* Details Panel */}
                        <motion.div
                            className="lg:col-span-8"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <GlassTile className="p-10" interactive={false}>
                                <div className="flex items-center justify-between mb-12">
                                    <h3 className="text-2xl font-black tracking-tighter">Identity Details</h3>
                                    {!isEditing ? (
                                        <Button
                                            onClick={() => setIsEditing(true)}
                                            className="h-12 px-6 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-black tracking-tight hover:scale-[1.02] transition-transform"
                                        >
                                            <Edit className="h-4 w-4 mr-2" /> Modify Profile
                                        </Button>
                                    ) : (
                                        <div className="flex gap-4">
                                            <Button
                                                variant="ghost"
                                                onClick={handleCancel}
                                                className="h-12 px-6 rounded-2xl font-bold uppercase tracking-widest text-[10px]"
                                            >
                                                <X className="h-4 w-4 mr-2" /> Cancel
                                            </Button>
                                            <Button
                                                onClick={handleSave}
                                                disabled={loading}
                                                className="h-12 px-8 rounded-2xl bg-blue-500 text-white font-black tracking-tight hover:scale-[1.02] transition-transform shadow-lg shadow-blue-500/20"
                                            >
                                                {loading ? (
                                                    <motion.div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                                                ) : (
                                                    <Save className="h-4 w-4 mr-2" />
                                                )}
                                                Update Data
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">First Name</Label>
                                            <Input
                                                value={formData.first_name}
                                                onChange={(e) => handleInputChange('first_name', e.target.value)}
                                                disabled={!isEditing}
                                                className="h-14 rounded-2xl bg-neutral-100/50 dark:bg-black/20 border-neutral-200 dark:border-white/5 font-bold focus:ring-blue-500/20"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Last Name</Label>
                                            <Input
                                                value={formData.last_name}
                                                onChange={(e) => handleInputChange('last_name', e.target.value)}
                                                disabled={!isEditing}
                                                className="h-14 rounded-2xl bg-neutral-100/50 dark:bg-black/20 border-neutral-200 dark:border-white/5 font-bold focus:ring-blue-500/20"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Handle</Label>
                                            <div className="relative">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">@</div>
                                                <Input
                                                    value={formData.username}
                                                    onChange={(e) => handleInputChange('username', e.target.value)}
                                                    disabled={!isEditing}
                                                    className="h-14 pl-10 rounded-2xl bg-neutral-100/50 dark:bg-black/20 border-neutral-200 dark:border-white/5 font-bold focus:ring-blue-500/20"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Contact Access</Label>
                                            <Input
                                                value={formData.contact_number}
                                                onChange={(e) => handleInputChange('contact_number', e.target.value)}
                                                disabled={!isEditing}
                                                className="h-14 rounded-2xl bg-neutral-100/50 dark:bg-black/20 border-neutral-200 dark:border-white/5 font-bold focus:ring-blue-500/20"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Origin City</Label>
                                            <Input
                                                value={formData.city}
                                                onChange={(e) => handleInputChange('city', e.target.value)}
                                                disabled={!isEditing}
                                                className="h-14 rounded-2xl bg-neutral-100/50 dark:bg-black/20 border-neutral-200 dark:border-white/5 font-bold focus:ring-blue-500/20"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Address Matrix</Label>
                                            <Input
                                                value={formData.street_address}
                                                onChange={(e) => handleInputChange('street_address', e.target.value)}
                                                disabled={!isEditing}
                                                className="h-14 rounded-2xl bg-neutral-100/50 dark:bg-black/20 border-neutral-200 dark:border-white/5 font-bold focus:ring-blue-500/20"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </GlassTile>
                        </motion.div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}