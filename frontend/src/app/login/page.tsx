'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/use-toast'
import { EvervaultCard } from '@/components/ui/evervault-card'

export default function Login() {
    const router = useRouter()
    const { login, isLoading: authLoading } = useAuth()
    const { toast } = useToast()
    
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })
    
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        
        try {
            console.log('Attempting login with:', formData.email)
            const success = await login(formData.email, formData.password)
            
            if (success) {
                toast({
                    title: "Login successful",
                    description: "Welcome back to EventFlow!",
                })
            } else {
                setError('Invalid email or password. Please try again.')
            }
        } catch (err: any) {
            console.error('Login error:', err)
            setError(err?.message || 'Login failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }
    
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header />
            
            <main className="flex-grow py-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row rounded-lg overflow-hidden shadow-lg max-w-4xl mx-auto">
                        {/* Left side - Text with Evervault Effect */}
                        <div className="md:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#6BDFEF] to-[#8FE9F5]">
                            <EvervaultCard text="EventFlow" className="w-full h-full absolute inset-0" />
                            <div className="relative z-10 h-full flex items-center justify-center p-8 pointer-events-none">
                                <div className="text-center text-white pointer-events-none">
                                    <div className="mb-6">
                                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-8 h-8">
                                                <path d="M12.75 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM7.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM8.25 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM9.75 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM10.5 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM12.75 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM14.25 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" />
                                                <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                                        Where Every Event
                                    </h2>
                                    <h3 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
                                        Finds Its Perfect Flow
                                    </h3>
                                    <p className="text-xl text-white/90 max-w-md mx-auto leading-relaxed">
                                        Welcome back to the platform that makes event management effortless and extraordinary.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Right side - Form */}
                        <div className="md:w-1/2 bg-white p-8 md:p-12">
                            <div className="max-w-md mx-auto">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
                                <p className="text-gray-600 mb-8">Sign in to your EventFlow account to manage your events.</p>
                                
                                {error && (
                                    <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6">
                                        {error}
                                    </div>
                                )}
                                
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                            Email
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                                </svg>
                                            </div>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                placeholder="your.email@example.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="pl-10"
                                                disabled={loading || authLoading}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                                Password
                                            </label>
                                            <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                                                Forgot password?
                                            </Link>
                                        </div>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <Input
                                                id="password"
                                                name="password"
                                                type="password"
                                                placeholder="••••••••"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                                className="pl-10"
                                                disabled={loading || authLoading}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center">
                                        <input
                                            id="remember-me"
                                            name="remember-me"
                                            type="checkbox"
                                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                        />
                                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                            Remember me
                                        </label>
                                    </div>
                                    
                                    <Button 
                                        type="submit" 
                                        className="w-full"
                                        disabled={loading || authLoading}
                                    >
                                        {loading || authLoading ? (
                                            <div className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Signing in...
                                            </div>
                                        ) : 'Sign In'}
                                    </Button>
                                    
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600">
                                            Don't have an account?{' '}
                                            <Link href="/register" className="text-primary font-medium hover:underline">
                                                Register
                                            </Link>
                                        </p>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            
            <Footer />
        </div>
    )
} 