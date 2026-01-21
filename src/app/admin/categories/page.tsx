'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCategories } from '@/contexts/CategoryContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Plus, Tag, AlertCircle, Activity } from 'lucide-react'

import { useRouter } from 'next/navigation'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

export default function AllCategories() {
    const { categories, deleteCategory, updateCategory, loading } = useCategories()
    const { user } = useAuth()
    const router = useRouter()
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editForm, setEditForm] = useState({ name: '', description: '' })

    const handleEdit = (id: string, name: string, description: string) => {
        setEditingId(id)
        setEditForm({ name, description })
    }

    const handleUpdate = async (id: string) => {
        await updateCategory(id, editForm)
        setEditingId(null)
    }

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            await deleteCategory(id)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
                <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />
                <div className="flex-grow flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
                    <p className="text-slate-500 font-medium animate-pulse">Synchronizing categories...</p>
                </div>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC] relative overflow-hidden">
            {/* Mesh Gradient Background Elements */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
                <div className="absolute bottom-[20%] right-[-10%] w-[30%] h-[30%] rounded-full bg-purple-500/10 blur-[100px]" />
            </div>

            <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />

            <main className="flex-grow container mx-auto px-4 py-16 max-w-5xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-12"
                >
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2 text-purple-600">
                                <Tag size={18} />
                                <span className="text-xs font-bold uppercase tracking-widest">Metadata Engine</span>
                            </div>
                            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                                Category Protocols
                            </h1>
                            <p className="text-slate-500 mt-2 text-lg">Manage the primary classification vectors for our system.</p>
                        </div>
                        <Button
                            onClick={() => router.push('/admin/category')}
                            className="rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-xl py-6 px-8 transition-all hover:scale-[1.02] active:scale-[0.98] flex gap-2"
                        >
                            <Plus className="w-5 h-5" /> New Classification
                        </Button>
                    </div>

                    {categories.length === 0 ? (
                        <Card className="rounded-[32px] border-dashed border-2 bg-white/40 backdrop-blur-sm border-slate-200 shadow-none">
                            <CardContent className="flex flex-col items-center justify-center p-20 space-y-6">
                                <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400">
                                    <Tag className="w-10 h-10" />
                                </div>
                                <div className="text-center space-y-2">
                                    <h3 className="text-2xl font-bold text-slate-900">Vault Empty</h3>
                                    <p className="text-slate-500">No category signatures detected in the primary database.</p>
                                </div>
                                <Button variant="outline" onClick={() => window.location.reload()} className="rounded-xl border-slate-200 px-8 py-6">
                                    Re-sync Database
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6">
                            <AnimatePresence>
                                {categories?.map((category, index) => (
                                    <motion.div
                                        key={category.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Card className="group overflow-hidden rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-300 bg-white/80 backdrop-blur-sm">
                                            <CardContent className="p-0">
                                                {editingId === category.id ? (
                                                    <div className="p-8 space-y-6 bg-purple-50/30">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <div className="space-y-2">
                                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Name</label>
                                                                <Input
                                                                    value={editForm.name}
                                                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                                    className="h-12 rounded-xl bg-white border-slate-200 focus:ring-purple-500"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Summary</label>
                                                                <Input
                                                                    value={editForm.description}
                                                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                                    className="h-12 rounded-xl bg-white border-slate-200 focus:ring-purple-500"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-3">
                                                            <Button onClick={() => handleUpdate(category.id)} className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-6">
                                                                Apply Updates
                                                            </Button>
                                                            <Button variant="ghost" onClick={() => setEditingId(null)} className="rounded-xl">
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="p-8 flex items-start justify-between gap-6">
                                                        <div className="flex items-start gap-6">
                                                            <div className="mt-1 w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all duration-500">
                                                                <Tag className="w-6 h-6" />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <h2 className="text-2xl font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                                                                    {category.name || category.title || "Legacy Entry"}
                                                                </h2>
                                                                <p className="text-slate-500 leading-relaxed max-w-2xl">
                                                                    {category.description || "No classification details logged."}
                                                                </p>
                                                                <div className="flex items-center gap-4 pt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                                    <span className="flex items-center gap-1"><Activity size={10} /> {category.id.slice(0, 12)}...</span>
                                                                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                                                                    <span>Authored: {category.created_at ? new Date(category.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleEdit(category.id, category.name || category.title || '', category.description)}
                                                                className="rounded-xl border-slate-200 hover:bg-slate-50"
                                                            >
                                                                Modify
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => handleDelete(category.id)}
                                                                className="rounded-xl"
                                                            >
                                                                Purge
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </motion.div>
            </main>

            <Footer />
        </div>
    )
}

