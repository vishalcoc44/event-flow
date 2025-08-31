'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useToast } from '@/components/ui/use-toast'
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { HoverShadowEffect } from '@/components/ui/hover-shadow-effect'

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

    // Update form data when user data becomes available
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
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSave = async () => {
        if (!user) return

        try {
            setLoading(true)
            
            // Update user metadata in Supabase Auth
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

            // Update user record in the users table
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

            toast({
                title: "Profile Updated",
                description: "Your profile has been successfully updated.",
            })
            
            setIsEditing(false)
        } catch (error: any) {
            console.error('Error updating profile:', error)
            toast({
                title: "Error",
                description: error.message || "Failed to update profile",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        setFormData({
            first_name: user?.first_name || '',
            last_name: user?.last_name || '',
            username: user?.username || '',
            contact_number: user?.contact_number || '',
            city: user?.city || '',
            pincode: user?.pincode || '',
            street_address: user?.street_address || ''
        })
        setIsEditing(false)
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 20
            }
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />
            
            <main className="flex-grow container mx-auto px-4 py-8">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <motion.div 
                        className="mb-8"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <h1 className="text-3xl font-bold text-foreground">Profile</h1>
                        <p className="text-muted-foreground">Manage your account information and preferences</p>
                    </motion.div>

                    <motion.div 
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        {/* Profile Overview */}
                        <motion.div 
                            className="lg:col-span-1"
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                        >
                            <HoverShadowEffect className="border border-border rounded-2xl cursor-pointer" shadowColor="rgba(0,0,0,0.15)" shadowIntensity={0.2}>
                                <Card className="border-0 shadow-none">
                                <CardHeader className="text-center pb-4">
                                    <div className="flex justify-center mb-4">
                                        <Avatar className="h-24 w-24 bg-[#6CDAEC] text-white">
                                            <AvatarFallback className="text-2xl">
                                                {getInitials(user?.first_name, user?.last_name, user?.email)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <CardTitle className="text-xl font-semibold text-foreground">
                                        {user?.first_name} {user?.last_name || ''}
                                        {(!user?.first_name && !user?.last_name) && (user?.username || user?.email?.split('@')[0])}
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="h-4 w-4" />
                                            <span>Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <User className="h-4 w-4" />
                                            <span>Role: {user?.role === 'USER' ? 'Customer' : user?.role}</span>
                                        </div>
                                    </div>
                                </CardContent>
                                </Card>
                            </HoverShadowEffect>
                        </motion.div>

                        {/* Profile Details */}
                        <motion.div 
                            className="lg:col-span-2"
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <HoverShadowEffect className="border border-border rounded-2xl cursor-pointer" shadowColor="rgba(0,0,0,0.15)" shadowIntensity={0.2}>
                                <Card className="border-0 shadow-none">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="text-xl font-semibold text-foreground">Personal Information</CardTitle>
                                    <div className="flex gap-2">
                                        {isEditing ? (
                                            <>
                                                <Button 
                                                    size="sm" 
                                                    onClick={handleSave}
                                                    disabled={loading}
                                                >
                                                    {loading ? (
                                                        <motion.div
                                                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                                            animate={{ rotate: 360 }}
                                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                        />
                                                    ) : (
                                                        <Save className="h-4 w-4 mr-1" />
                                                    )}
                                                    Save
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    onClick={handleCancel}
                                                    disabled={loading}
                                                >
                                                    <X className="h-4 w-4 mr-1" />
                                                    Cancel
                                                </Button>
                                            </>
                                        ) : (
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                onClick={() => setIsEditing(true)}
                                            >
                                                <Edit className="h-4 w-4 mr-1" />
                                                Edit
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="first_name">First Name</Label>
                                                <Input
                                                    id="first_name"
                                                    value={formData.first_name}
                                                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                                                    disabled={!isEditing}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="last_name">Last Name</Label>
                                                <Input
                                                    id="last_name"
                                                    value={formData.last_name}
                                                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                                                    disabled={!isEditing}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="username">Username</Label>
                                                <Input
                                                    id="username"
                                                    value={formData.username}
                                                    onChange={(e) => handleInputChange('username', e.target.value)}
                                                    disabled={!isEditing}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    id="email"
                                                    value={user?.email || ''}
                                                    disabled
                                                    className="mt-1 bg-gray-50"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="contact_number">Contact Number</Label>
                                                <Input
                                                    id="contact_number"
                                                    value={formData.contact_number}
                                                    onChange={(e) => handleInputChange('contact_number', e.target.value)}
                                                    disabled={!isEditing}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="street_address">Street Address</Label>
                                                <Input
                                                    id="street_address"
                                                    value={formData.street_address}
                                                    onChange={(e) => handleInputChange('street_address', e.target.value)}
                                                    disabled={!isEditing}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="city">City</Label>
                                                <Input
                                                    id="city"
                                                    value={formData.city}
                                                    onChange={(e) => handleInputChange('city', e.target.value)}
                                                    disabled={!isEditing}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="pincode">Pincode</Label>
                                                <Input
                                                    id="pincode"
                                                    value={formData.pincode}
                                                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                                                    disabled={!isEditing}
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                </Card>
                            </HoverShadowEffect>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </main>
            
            <Footer />
        </div>
    )
} 