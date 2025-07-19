'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { EvervaultCard } from '@/components/ui/evervault-card'

export default function Register() {
    const router = useRouter()
    const { register } = useAuth()
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        contactNumber: '',
        city: '',
        pincode: '',
        streetAddress: '',
        email: '',
        password: '',
    })
    
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isAdmin, setIsAdmin] = useState(false)
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        
        try {
            const success = await register({
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                contactNumber: formData.contactNumber,
                city: formData.city,
                pincode: formData.pincode,
                streetAddress: formData.streetAddress,
                role: isAdmin ? 'ADMIN' : 'USER'
            })
            
            if (success) {
                // Redirect will happen in the register function
                console.log('Registration successful')
            } else {
                setError('Registration failed. Please try again.')
            }
        } catch (err) {
            setError('Registration failed. Please try again.')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }
    
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header />
            
            <main className="flex-grow py-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row rounded-lg overflow-hidden shadow-lg">
                        {/* Left side - Text with Evervault Effect */}
                        <div className="md:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#6BDFEF] to-[#8FE9F5]">
                            <EvervaultCard text="Join Us" className="w-full h-full absolute inset-0" />
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
                                        Your Events,
                                    </h2>
                                    <h3 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                                        Our Expertise,
                                    </h3>
                                    <h4 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
                                        Endless Possibilities
                                    </h4>
                                    <p className="text-xl text-white/90 max-w-md mx-auto leading-relaxed">
                                        Join EventFlow and unlock the power to create extraordinary events with professional tools and expert guidance.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Right side - Form */}
                        <div className="md:w-1/2 bg-white p-8 md:p-12">
                            <div className="max-w-md mx-auto">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your EventFlow Account</h1>
                                <p className="text-gray-600 mb-8">Join EventFlow and start managing your events seamlessly.</p>
                                
                                {error && (
                                    <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6">
                                        {error}
                                    </div>
                                )}
                                
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                                                First Name
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <Input
                                                    id="firstName"
                                                    name="firstName"
                                                    type="text"
                                                    placeholder="John"
                                                    value={formData.firstName}
                                                    onChange={handleChange}
                                                    required
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                                                Last Name
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <Input
                                                    id="lastName"
                                                    name="lastName"
                                                    type="text"
                                                    placeholder="Doe"
                                                    value={formData.lastName}
                                                    onChange={handleChange}
                                                    required
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                            Contact Number
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                                </svg>
                                            </div>
                                            <Input
                                                id="contactNumber"
                                                name="contactNumber"
                                                type="tel"
                                                placeholder="555-123-4567"
                                                value={formData.contactNumber}
                                                onChange={handleChange}
                                                required
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                                                City
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <Input
                                                    id="city"
                                                    name="city"
                                                    type="text"
                                                    placeholder="New York"
                                                    value={formData.city}
                                                    onChange={handleChange}
                                                    required
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                                                Pincode
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <Input
                                                    id="pincode"
                                                    name="pincode"
                                                    type="text"
                                                    placeholder="10001"
                                                    value={formData.pincode}
                                                    onChange={handleChange}
                                                    required
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-700 mb-1">
                                            Street Address
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <Input
                                                id="streetAddress"
                                                name="streetAddress"
                                                type="text"
                                                placeholder="123 Main St"
                                                value={formData.streetAddress}
                                                onChange={handleChange}
                                                required
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                    
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
                                                placeholder="john.doe@example.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                            Password
                                        </label>
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
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters long.</p>
                                    </div>
                                    
                                    <div className="flex items-center">
                                        <input
                                            id="isAdmin"
                                            name="isAdmin"
                                            type="checkbox"
                                            checked={isAdmin}
                                            onChange={e => setIsAdmin(e.target.checked)}
                                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                        />
                                        <label htmlFor="isAdmin" className="ml-2 block text-sm text-gray-700">
                                            Register as Admin
                                        </label>
                                    </div>
                                    
                                    <Button 
                                        type="submit" 
                                        className="w-full"
                                        disabled={loading}
                                    >
                                        {loading ? 'Registering...' : 'Register'}
                                    </Button>
                                    
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600">
                                            Already have an account?{' '}
                                            <Link href="/login" className="text-primary font-medium hover:underline">
                                                Login
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