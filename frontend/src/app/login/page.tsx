'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/use-toast'
import { EvervaultCard } from '@/components/ui/evervault-card'
import { HoverShadowEffect } from '@/components/ui/hover-shadow-effect'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'

export default function Login() {
    const router = useRouter()
    const { login, isLoading: authLoading, user } = useAuth()
    const { toast } = useToast()
    
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [showErrorDialog, setShowErrorDialog] = useState(false)
    const isShowingErrorRef = useRef(false)
    
    // Reset form when component mounts or when navigating back
    useEffect(() => {
        // Don't reset error states if we're currently showing an error
        if (!isShowingErrorRef.current) {
            setLoading(false)
            setError(null)
            setShowErrorDialog(false)
        }

        console.log('🔍 Login page state:', {
            user: !!user,
            authLoading,
            userRole: user?.role,
            isShowingError: isShowingErrorRef.current
        })

        // If user is already logged in, redirect them
        if (user && !authLoading) {
            console.log('🔄 Redirecting authenticated user to dashboard...')
            if (user.role === 'ADMIN') {
                router.push('/admin/dashboard')
            } else {
                router.push('/customer/dashboard')
            }
        } else if (!authLoading && !isShowingErrorRef.current) {
            console.log('✅ Auth initialization complete - showing login form')
        }
    }, [user, authLoading, router])
    
    // Track error dialog state to prevent interference
    useEffect(() => {
        isShowingErrorRef.current = showErrorDialog
        if (showErrorDialog) {
            console.log('🔍 Error dialog is now showing - protecting state')
        } else {
            console.log('🔍 Error dialog closed - allowing normal state management')
        }
    }, [showErrorDialog])
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        // Clear error and dialog when user starts typing
        if (error) {
            setError(null)
            setShowErrorDialog(false)
            isShowingErrorRef.current = false
        }
    }
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setShowErrorDialog(false)
        isShowingErrorRef.current = false

        try {
            console.log('🚀 Starting login process...')
            console.log('📧 Email:', formData.email)

            const startTime = Date.now()
            const success = await login(formData.email, formData.password)
            const endTime = Date.now()

            console.log('⏱️ Login process took:', (endTime - startTime) / 1000, 'seconds')
            console.log('🔍 Login result:', success)

            if (success) {
                console.log('✅ Login successful, showing toast')
                toast({
                    title: "Login successful",
                    description: "Welcome back to EventFlow!",
                })
                // The AuthContext will handle the redirect
            } else {
                console.log('❌ Login returned false - showing invalid credentials error')
                console.log('🔍 Setting error state and dialog state')
                setError('Invalid email or password. Please try again.')
                setShowErrorDialog(true)
                isShowingErrorRef.current = true
                console.log('🔍 Error state set, showErrorDialog should be true')
            }
        } catch (err: any) {
            console.log('❌ Login error caught:', err?.message);
            console.log('🔍 Error object:', err);
            // Provide more specific error messages
            let errorMessage = 'Login failed. Please try again.'

            if (err?.message?.includes('timeout')) {
                errorMessage = 'Connection timeout. Please check your internet connection and try again.'
            } else if (err?.message?.includes('Invalid login credentials')) {
                errorMessage = 'Invalid email or password. Please check your credentials and try again.'
            } else if (err?.message?.includes('invalid_credentials')) {
                errorMessage = 'Invalid email or password. Please check your credentials and try again.'
            } else if (err?.message?.includes('Email not confirmed')) {
                errorMessage = 'Please check your email and click the confirmation link before logging in.'
            } else if (err?.message?.includes('Too many requests')) {
                errorMessage = 'Too many login attempts. Please wait a few minutes and try again.'
            } else if (err?.message?.includes('User not found')) {
                errorMessage = 'No account found with this email address. Please check your email or register for a new account.'
            } else if (err?.message?.includes('Email link is invalid')) {
                errorMessage = 'The login link has expired. Please request a new one.'
            } else if (err?.message?.includes('Login failed')) {
                errorMessage = 'Invalid email or password. Please check your credentials and try again.'
            } else if (err?.message) {
                // Show the actual error message for debugging
                errorMessage = `Login failed: ${err.message}`
            }

            console.log('🔍 Setting error message:', errorMessage);
            setError(errorMessage)
            setShowErrorDialog(true)
            isShowingErrorRef.current = true
            console.log('🔍 Error state set in catch block, showErrorDialog should be true')
        } finally {
            setLoading(false)
        }
    }
    
    // Show loading screen during auth initialization with stabilized loading
    // But don't show loading if we have an error dialog to show
    if (authLoading && !isShowingErrorRef.current) {
        console.log('⏳ Showing loading screen - auth initializing...')
        return (
            <div className="min-h-screen flex flex-col bg-white">
                <Header />
                <main className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-t-[#6CDAEC] rounded-full animate-spin mx-auto mb-4"></div>
                        <h1 className="text-xl font-semibold text-gray-700 mb-2">Initializing...</h1>
                        <p className="text-gray-500 text-sm">Checking authentication status</p>
                        <div className="mt-4 text-xs text-gray-400">
                            <p>This should only take a few seconds</p>
                        </div>
                        <div className="mt-4 flex justify-center">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-[#6CDAEC] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-[#6CDAEC] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-[#6CDAEC] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        )
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
                                
                                {/* Error Dialog */}
                                <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
                                    <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle className="flex items-center space-x-2 text-red-600">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                                <span>Login Failed</span>
                                            </DialogTitle>
                                            <DialogDescription className="text-gray-600">
                                                {error}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="flex justify-end space-x-2 mt-4">
                                            <Button
                                                variant="outline"
                                                onClick={() => setShowErrorDialog(false)}
                                            >
                                                Try Again
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>


                                
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
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                                className="pl-10 pr-10"
                                                disabled={loading || authLoading}
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                onClick={() => setShowPassword(!showPassword)}
                                                disabled={loading || authLoading}
                                                tabIndex={-1}
                                            >
                                                {showPassword ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 10.605 10.605 0 00-2.387-4.612l-1.611-1.612zm-1.61 6.61c.406.375.856.729 1.31 1.046l-4.273 4.273a10.029 10.029 0 01-3.3-4.38 10.605 10.605 0 012.387-4.612L5.19 6.22a10.029 10.029 0 013.3 4.38zm7.43 7.44l-4.274-4.274a3.75 3.75 0 01-1.31 1.046l1.745 1.745a10.029 10.029 0 004.38 3.3 10.605 10.605 0 004.612 2.387l-1.612-1.612zm-8.61-8.61l4.273 4.273a3.75 3.75 0 00-1.31-1.046L8.48 3.69a10.029 10.029 0 00-4.38-3.3 10.605 10.605 0 00-4.612-2.387l1.612 1.612z" clipRule="evenodd" />
                                                        <path d="m13.879 9.879-4 4a.75.75 0 01-1.06-1.06l4-4a.75.75 0 011.06 1.06z" />
                                                    </svg>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                                                        <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </button>
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
                                    
                                    <HoverShadowEffect className="w-full cursor-pointer" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.15} hoverScale={1.02} hoverLift={-1} transitionDuration={150}>
                                        <Button
                                            type="submit"
                                            className="w-full"
                                            disabled={loading || authLoading}
                                        >
                                            {loading ? (
                                                <div className="flex items-center">
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Authenticating...
                                                </div>
                                            ) : authLoading ? (
                                                <div className="flex items-center">
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Checking session...
                                                </div>
                                            ) : 'Sign In'}
                                        </Button>
                                    </HoverShadowEffect>
                                    
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