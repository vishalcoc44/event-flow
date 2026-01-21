'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { useCategories } from '@/contexts/CategoryContext'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ArrowLeft, Tag, Plus, Activity, Calendar, Sparkles, Loader2 } from 'lucide-react'

export default function AddCategory() {
    const { addCategory, categories, loading, error, fetchCategories } = useCategories()
    const { toast } = useToast()
    const router = useRouter()
    const { user } = useAuth()
    const [category, setCategory] = useState({ name: '', description: '' })
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        fetchCategories()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!category.name.trim() || !category.description.trim()) {
            toast({
                title: "Protocol Error",
                description: "All classification fields must be populated.",
                variant: "destructive",
            })
            return
        }

        try {
            setIsSubmitting(true)
            const result = await addCategory(category)
            if (result) {
                toast({
                    title: "System Update Complete",
                    description: "Initial classification sequence has been established.",
                })
                setCategory({ name: '', description: '' })
                fetchCategories()
            }
        } catch (error: any) {
            toast({
                title: "Initialization Failure",
                description: error.message || "The categorization engine encountered an error.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC] relative overflow-hidden">
            {/* Mesh Gradient Background */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-[-5%] right-[-5%] w-[35%] h-[35%] rounded-full bg-primary/10 blur-[100px]" />
                <div className="absolute bottom-[10%] left-[-5%] w-[25%] h-[25%] rounded-full bg-purple-500/10 blur-[80px]" />
            </div>

            <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />

            <main className="flex-grow container mx-auto px-4 py-16 max-w-5xl relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-12"
                >
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <button
                                onClick={() => router.push('/admin/categories')}
                                className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors mb-4 group font-bold text-xs uppercase tracking-widest"
                            >
                                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                                Return to Vault
                            </button>
                            <div className="flex items-center gap-2 mb-2 text-primary">
                                <Sparkles size={18} />
                                <span className="text-xs font-bold uppercase tracking-widest">Classification Terminal</span>
                            </div>
                            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">New Category Signature</h1>
                            <p className="text-slate-500 mt-2 text-lg">Define a new classification protocol for the event network.</p>
                        </div>
                    </div>

                    {/* Add Category Form */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                        <div className="lg:col-span-2">
                            <Card className="rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-md overflow-hidden">
                                <CardHeader className="p-8 border-b border-slate-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                            <Plus size={24} />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl">Initialization Form</CardTitle>
                                            <p className="text-xs text-slate-500 mt-0.5 font-medium">Capture core metadata</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        <div className="space-y-3">
                                            <Label htmlFor="name" className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                                                Classification Identifier
                                            </Label>
                                            <Input
                                                id="name"
                                                placeholder="e.g. Cyber Security Summit"
                                                value={category.name}
                                                onChange={(e) => setCategory({ ...category, name: e.target.value })}
                                                required
                                                className="h-14 rounded-2xl bg-white border-slate-200 focus:ring-primary text-lg font-medium"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="description" className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                                                Functional Description
                                            </Label>
                                            <Textarea
                                                id="description"
                                                placeholder="Detail the scope and purpose of this categorization..."
                                                value={category.description}
                                                onChange={(e) => setCategory({ ...category, description: e.target.value })}
                                                required
                                                className="h-40 rounded-2xl bg-white border-slate-200 focus:ring-primary resize-none p-4 text-base"
                                            />
                                        </div>

                                        <div className="pt-4 flex items-center gap-4">
                                            <Button
                                                type="submit"
                                                className="h-14 px-10 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-slate-900/10 flex gap-2"
                                                disabled={isSubmitting || loading}
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                        Deploying...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sparkles className="w-5 h-5" />
                                                        Initialize Protocol
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() => setCategory({ name: '', description: '' })}
                                                className="h-14 px-6 rounded-2xl text-slate-500 font-bold"
                                            >
                                                Wipe Inputs
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <div className="p-6 bg-slate-900 rounded-[32px] text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 text-white/5">
                                    <Activity size={100} />
                                </div>
                                <h3 className="text-lg font-black uppercase tracking-tighter mb-4 relative z-10">Vault Status</h3>
                                <div className="space-y-4 relative z-10">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-white/60">Active Signatures:</span>
                                        <span className="font-mono font-bold">{categories.length}</span>
                                    </div>
                                    <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                                        <div className="bg-primary h-full w-[65%]" />
                                    </div>
                                    <p className="text-[10px] text-white/40 font-bold leading-relaxed uppercase tracking-widest">
                                        System capacity at nominal levels. All classificaiton vectors stable.
                                    </p>
                                </div>
                            </div>

                            <Card className="rounded-[32px] border border-slate-100 shadow-sm bg-white p-6">
                                <h4 className="text-sm font-bold uppercase tracking-widest mb-4">Quick Guidance</h4>
                                <ul className="space-y-4">
                                    {[
                                        "Use clear, identifier-based names",
                                        "Descriptions should define scope",
                                        "Avoid overlapping classifications"
                                    ].map((tip, i) => (
                                        <li key={i} className="flex gap-3 text-xs text-slate-500 font-medium">
                                            <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                                < Sparkles size={10} />
                                            </div>
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        </div>
                    </div>

                    {/* Existing Categories Summary */}
                    <div className="pt-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Recent Definitions</h2>
                                <p className="text-slate-500 mt-1">Snapshot of the most current classification signatures.</p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                                {[1, 2, 3].map(i => <div key={i} className="h-40 bg-slate-100 rounded-[28px]" />)}
                            </div>
                        ) : error ? (
                            <div className="bg-rose-50 p-6 rounded-[28px] text-rose-800 border border-rose-100 flex items-center gap-4">
                                <Activity className="shrink-0" />
                                <p className="font-medium">Initialization Feed Failure: {error}</p>
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="text-center py-16 bg-white/40 rounded-[32px] border-dashed border-2 border-slate-200">
                                <div className="text-slate-300 mb-4 flex justify-center">
                                    <Tag size={48} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Signatures Empty</h3>
                                <p className="text-slate-500 mt-1">Initiate a new definition to begin population.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <AnimatePresence mode="popLayout">
                                    {categories?.slice(0, 6).map((cat, index) => (
                                        <motion.div
                                            key={cat.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.4, delay: index * 0.05 }}
                                        >
                                            <Card className="group h-full flex flex-col rounded-[28px] border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 bg-white/80 backdrop-blur-sm overflow-hidden border-b-2 hover:border-b-primary">
                                                <CardHeader className="pb-3 flex-row items-center gap-3 space-y-0">
                                                    <div className="p-2.5 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-500">
                                                        <Tag size={16} />
                                                    </div>
                                                    <CardTitle className="text-base font-bold text-slate-900">
                                                        {cat.name}
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="flex-grow pt-0">
                                                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
                                                        {cat.description || 'Metadata signature unavailable.'}
                                                    </p>
                                                </CardContent>
                                                <CardFooter className="pt-0 pb-6 border-t border-slate-50/50 mt-auto flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-6 pr-6">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={10} /> {cat.created_at ? new Date(cat.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A'}
                                                    </span>
                                                    <button className="text-slate-300 group-hover:text-primary transition-colors">
                                                        <Sparkles size={12} />
                                                    </button>
                                                </CardFooter>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}

                        <div className="mt-12 flex justify-center">
                            <Button
                                variant="outline"
                                onClick={() => router.push('/admin/categories')}
                                className="rounded-xl border-slate-200 text-slate-500 font-bold px-8 hover:bg-slate-50 transition-all flex gap-2"
                            >
                                <ArrowLeft size={16} />
                                View Full Archive
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </main>

            <Footer />
        </div>
    )
}

