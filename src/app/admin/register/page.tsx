'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ShieldCheck, UserPlus, Activity, Lock, ArrowLeft, Mail, Phone, MapPin, Sparkles, Loader2 } from 'lucide-react'

export default function RegisterAdmin() {
    const { register, isLoading, user } = useAuth()
    const { toast } = useToast()
    const router = useRouter()

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        contactNumber: '',
        city: '',
        pincode: '',
        streetAddress: '',
    })

    const [errors, setErrors] = useState<Record<string, string>>({})
    const [passwordStrength, setPasswordStrength] = useState(0)

    const validateField = (name: string, value: string) => {
        switch (name) {
            case 'email':
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Invalid email structure'
            case 'password':
                return value.length >= 8 ? '' : 'Security protocol requires 8+ characters'
            case 'contactNumber':
                return /^\d{10}$/.test(value) ? '' : 'Communication digit mismatch (10 required)'
            case 'pincode':
                return /^\d{6}$/.test(value) ? '' : 'Postal code mismatch (6 digits)'
            default:
                return value.trim() ? '' : 'Field population required'
        }
    }

    const calculatePasswordStrength = (pwd: string) => {
        let strength = 0
        if (pwd.length >= 8) strength += 25
        if (/[A-Z]/.test(pwd)) strength += 25
        if (/[0-9]/.test(pwd)) strength += 25
        if (/[^A-Za-z0-9]/.test(pwd)) strength += 25
        return strength
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })

        const error = validateField(name, value)
        setErrors(prev => ({ ...prev, [name]: error }))

        if (name === 'password') {
            setPasswordStrength(calculatePasswordStrength(value))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const newErrors: Record<string, string> = {}
        Object.keys(formData).forEach(key => {
            const error = validateField(key, (formData as any)[key])
            if (error) newErrors[key] = error
        })

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            toast({
                title: "Incomplete Form",
                description: "Please correct the highlighted errors.",
                variant: "destructive",
            })
            return
        }

        try {
            await register({ ...formData, role: 'ADMIN' })
            toast({
                title: "Admin Registered",
                description: "The new administrator account has been created successfully.",
            })
            router.push('/admin/dashboard')
        } catch (error: any) {
            let errorMessage = "Failed to create administrator"
            if (error.message?.includes('already registered')) {
                errorMessage = "Email already exists in the system."
            }
            toast({
                title: "Registration Error",
                description: errorMessage,
                variant: "destructive",
            })
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC] relative overflow-hidden">
            {/* Mesh Gradient Background */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-primary/10 blur-[130px]" />
                <div className="absolute bottom-[0%] right-[-10%] w-[35%] h-[35%] rounded-full bg-purple-500/10 blur-[110px]" />
            </div>

            <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />

            <main className="flex-grow container mx-auto px-4 py-16 max-w-4xl relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-10"
                >
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <button
                                onClick={() => router.push('/admin/dashboard')}
                                className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors mb-4 group font-bold text-xs uppercase tracking-widest"
                            >
                                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                                Admin Dashboard
                            </button>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-primary">
                                    <ShieldCheck size={18} />
                                    <span className="text-xs font-bold uppercase tracking-widest">Administrative Access</span>
                                </div>
                                <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Register New Admin</h1>
                                <p className="text-slate-500 text-lg">Create a new administrator account with system-level permissions.</p>
                            </div>
                        </div>
                    </div>

                    <Card className="rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/60 bg-white/90 backdrop-blur-xl overflow-hidden">
                        <CardHeader className="p-10 pb-0 border-none">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-2xl font-bold text-slate-900">Account Details</CardTitle>
                                    <p className="text-slate-400 text-sm font-medium">Please provide the administrator's information.</p>
                                </div>
                                <div className="w-16 h-16 rounded-3xl bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-900/20">
                                    <UserPlus size={32} />
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-10">
                            <form onSubmit={handleSubmit} className="space-y-10">
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <Label htmlFor="firstName" className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Legal First Name</Label>
                                            <div className="relative">
                                                <Input
                                                    id="firstName"
                                                    name="firstName"
                                                    placeholder="Identification Required"
                                                    value={formData.firstName}
                                                    onChange={handleChange}
                                                    className={cn(
                                                        "h-14 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white focus:ring-primary transition-all text-lg",
                                                        errors.firstName && "border-rose-200 bg-rose-50/30"
                                                    )}
                                                />
                                                {errors.firstName && <p className="absolute -bottom-6 left-1 text-[10px] text-rose-500 font-black uppercase tracking-widest">{errors.firstName}</p>}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="lastName" className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Legal Last Name</Label>
                                            <div className="relative">
                                                <Input
                                                    id="lastName"
                                                    name="lastName"
                                                    placeholder="Identification Required"
                                                    value={formData.lastName}
                                                    onChange={handleChange}
                                                    className={cn(
                                                        "h-14 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white focus:ring-primary transition-all text-lg",
                                                        errors.lastName && "border-rose-200 bg-rose-50/30"
                                                    )}
                                                />
                                                {errors.lastName && <p className="absolute -bottom-6 left-1 text-[10px] text-rose-500 font-black uppercase tracking-widest">{errors.lastName}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="email" className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Communication Channel (Email)</Label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                                                <Mail size={20} />
                                            </div>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                placeholder="registry@network.io"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className={cn(
                                                    "h-14 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white focus:ring-primary transition-all text-lg pl-12",
                                                    errors.email && "border-rose-200 bg-rose-50/30"
                                                )}
                                            />
                                            {errors.email && <p className="absolute -bottom-6 left-1 text-[10px] text-rose-500 font-black uppercase tracking-widest">{errors.email}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-slate-600 font-bold text-xs uppercase tracking-widest ml-1">Password</Label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                                            <Input
                                                id="password"
                                                name="password"
                                                type="password"
                                                placeholder="••••••••"
                                                required
                                                value={formData.password}
                                                onChange={handleChange}
                                                className={cn(
                                                    "h-14 pl-12 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white focus:ring-primary transition-all text-lg",
                                                    errors.password && "border-rose-200 bg-rose-50/30"
                                                )}
                                            />
                                            {formData.password && (
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                    <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={cn(
                                                                "h-full transition-all duration-700",
                                                                passwordStrength <= 25 ? "bg-rose-500" :
                                                                    passwordStrength <= 50 ? "bg-amber-500" :
                                                                        passwordStrength <= 75 ? "bg-emerald-400" : "bg-primary"
                                                            )}
                                                            style={{ width: `${passwordStrength}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            {errors.password && <p className="absolute -bottom-6 left-1 text-[10px] text-rose-500 font-black uppercase tracking-widest">{errors.password}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <Label htmlFor="contactNumber" className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Direct Signal (Phone)</Label>
                                            <div className="relative">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                                                    <Phone size={20} />
                                                </div>
                                                <Input
                                                    id="contactNumber"
                                                    name="contactNumber"
                                                    placeholder="Cellular Interface"
                                                    value={formData.contactNumber}
                                                    onChange={handleChange}
                                                    className={cn(
                                                        "h-14 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white focus:ring-primary transition-all text-lg pl-12",
                                                        errors.contactNumber && "border-rose-200 bg-rose-50/30"
                                                    )}
                                                />
                                                {errors.contactNumber && <p className="absolute -bottom-6 left-1 text-[10px] text-rose-500 font-black uppercase tracking-widest">{errors.contactNumber}</p>}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="city" className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Operational City</Label>
                                            <div className="relative">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                                                    <MapPin size={20} />
                                                </div>
                                                <Input
                                                    id="city"
                                                    name="city"
                                                    placeholder="Deployed Vector"
                                                    value={formData.city}
                                                    onChange={handleChange}
                                                    className={cn(
                                                        "h-14 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white focus:ring-primary transition-all text-lg pl-12",
                                                        errors.city && "border-rose-200 bg-rose-50/30"
                                                    )}
                                                />
                                                {errors.city && <p className="absolute -bottom-6 left-1 text-[10px] text-rose-500 font-black uppercase tracking-widest">{errors.city}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div className="md:col-span-2 space-y-3">
                                            <Label htmlFor="streetAddress" className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">HQ Address</Label>
                                            <div className="relative">
                                                <Input
                                                    id="streetAddress"
                                                    name="streetAddress"
                                                    placeholder="Coordinate Baseline"
                                                    value={formData.streetAddress}
                                                    onChange={handleChange}
                                                    className={cn(
                                                        "h-14 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white focus:ring-primary transition-all text-lg",
                                                        errors.streetAddress && "border-rose-200 bg-rose-50/30"
                                                    )}
                                                />
                                                {errors.streetAddress && <p className="absolute -bottom-6 left-1 text-[10px] text-rose-500 font-black uppercase tracking-widest">{errors.streetAddress}</p>}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="pincode" className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Sector Code</Label>
                                            <div className="relative">
                                                <Input
                                                    id="pincode"
                                                    name="pincode"
                                                    placeholder="Grid Ref"
                                                    value={formData.pincode}
                                                    onChange={handleChange}
                                                    className={cn(
                                                        "h-14 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white focus:ring-primary transition-all text-lg",
                                                        errors.pincode && "border-rose-200 bg-rose-50/30"
                                                    )}
                                                />
                                                {errors.pincode && <p className="absolute -bottom-6 left-1 text-[10px] text-rose-500 font-black uppercase tracking-widest">{errors.pincode}</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-3 text-slate-400">
                                        <Activity size={16} className="text-emerald-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Administrative Rights Granted Post-Auth</span>
                                    </div>
                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        <Button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full h-16 rounded-2xl bg-slate-900 border-none text-white font-bold text-base shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:shadow-slate-900/30 hover:scale-[1.01] active:scale-[0.98] transition-all relative overflow-hidden group flex items-center justify-center gap-3"
                                        >
                                            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                                            {isLoading ? (
                                                <Loader2 className="animate-spin" size={20} />
                                            ) : (
                                                <>
                                                    <UserPlus size={20} />
                                                    Complete Registration
                                                </>
                                            )}
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => router.push('/admin/dashboard')}
                                            className="w-full h-14 rounded-2xl text-slate-400 font-bold hover:text-slate-600"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
                        {[
                            { icon: ShieldCheck, title: "Level 4 Clearance", desc: "Full administrative traversal" },
                            { icon: Activity, title: "Real-time Auditing", desc: "Every action logged in vault" },
                            { icon: Lock, title: "Neural Encryption", desc: "Multi-vector security protocol" }
                        ].map((feat, i) => (
                            <div key={i} className="flex flex-col items-center text-center p-6 bg-white/40 rounded-[32px] border border-slate-100">
                                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white mb-3">
                                    <feat.icon size={18} />
                                </div>
                                <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900">{feat.title}</h4>
                                <p className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-tighter">{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </main>

            <Footer />
        </div>
    )
}

