'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useCategories } from '@/contexts/CategoryContext'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { motion, AnimatePresence } from 'framer-motion'
import { Tag, Plus, Edit, Trash2, Calendar } from 'lucide-react'

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
                title: "Validation Error",
                description: "Please fill in all fields",
                variant: "destructive",
            })
            return
        }

        try {
            setIsSubmitting(true)
            const result = await addCategory(category)
            if (result) {
                toast({
                    title: "Category Added",
                    description: "The category has been successfully created",
                })
                // Reset form
                setCategory({ name: '', description: '' })
                // Refresh categories list
                fetchCategories()
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to create category",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
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
        <div className="min-h-screen flex flex-col bg-white">
            <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />
            
            <main className="flex-grow container mx-auto px-4 py-8">
                <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Add New Category</h1>
                        <p className="text-gray-600">Create a new event category and view existing ones</p>
                    </div>
                    
                    {/* Add Category Form */}
                    <motion.div variants={itemVariants} className="mb-12">
                        <Card className="shadow-sm border border-gray-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Plus className="h-5 w-5 text-[#6CDAEC]" />
                                    Create New Category
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Category Name</Label>
                                        <Input
                                            id="name"
                                            placeholder="Enter category name"
                                            value={category.name}
                                            onChange={(e) => setCategory({ ...category, name: e.target.value })}
                                            required
                                            className="bg-[#F8F8F8] border border-gray-200"
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Category Description</Label>
                                        <Textarea
                                            id="description"
                                            placeholder="Enter category description"
                                            value={category.description}
                                            onChange={(e) => setCategory({ ...category, description: e.target.value })}
                                            required
                                            className="bg-[#F8F8F8] border border-gray-200 min-h-[120px]"
                                        />
                                    </div>
                                    
                                    <div className="pt-4 flex justify-end space-x-4">
                                        <Button 
                                            type="button" 
                                            variant="outline"
                                            onClick={() => setCategory({ name: '', description: '' })}
                                        >
                                            Clear Form
                                        </Button>
                                        <Button 
                                            type="submit" 
                                            className="bg-[#6CDAEC] hover:bg-[#5BCFE3] text-white"
                                            disabled={isSubmitting || loading}
                                        >
                                            {isSubmitting ? 'Creating...' : 'Create Category'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Existing Categories */}
                    <motion.div variants={itemVariants}>
                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Existing Categories</h2>
                            <p className="text-gray-600">All categories currently in the system</p>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center h-32">
                                <motion.div
                                    className="w-8 h-8 border-4 border-t-[#6CDAEC] rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 p-4 rounded-md text-red-800">
                                <p>Error loading categories: {error}</p>
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-gray-400 mb-4">
                                    <Tag className="h-12 w-12 mx-auto" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-600 mb-2">No categories found</h3>
                                <p className="text-gray-500">Create your first category using the form above.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <AnimatePresence>
                                    {categories.map((cat) => (
                                        <motion.div 
                                            key={cat.id} 
                                            variants={itemVariants}
                                            layout
                                        >
                                            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                                <CardHeader className="pb-3">
                                                    <div className="flex items-center justify-between">
                                                        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                                            <Tag className="h-4 w-4 text-[#6CDAEC]" />
                                                            {cat.name}
                                                        </CardTitle>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="pt-0">
                                                    <p className="text-gray-600 text-sm mb-4">
                                                        {cat.description || 'No description provided'}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>
                                                            Created {cat.created_at ? new Date(cat.created_at).toLocaleDateString() : 'N/A'}
                                                        </span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            </main>
            
            <Footer />
        </div>
    )
}

