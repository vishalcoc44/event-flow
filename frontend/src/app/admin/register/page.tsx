'use client'

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Label } from '@/components/ui/label'

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await register({ ...formData, role: 'ADMIN' })
            toast({
                title: "Admin Registered",
                description: "The admin account has been successfully created",
            })
            router.push('/admin/dashboard')
        } catch (error: any) {
            toast({
                title: "Registration Error",
                description: error.message || "Failed to register admin",
                variant: "destructive",
            })
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />
            
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Register New Admin</h1>
                    
                    <Card className="shadow-sm border border-gray-200">
                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input 
                                            id="firstName"
                                            name="firstName" 
                                            placeholder="Enter first name" 
                                            value={formData.firstName}
                                            onChange={handleChange} 
                                            required 
                                            className="bg-[#F8F8F8] border border-gray-200" 
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input 
                                            id="lastName"
                                            name="lastName" 
                                            placeholder="Enter last name" 
                                            value={formData.lastName}
                                            onChange={handleChange} 
                                            required 
                                            className="bg-[#F8F8F8] border border-gray-200" 
                                        />
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input 
                                        id="email"
                                        name="email" 
                                        type="email" 
                                        placeholder="Enter email address" 
                                        value={formData.email}
                                        onChange={handleChange} 
                                        required 
                                        className="bg-[#F8F8F8] border border-gray-200" 
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input 
                                        id="password"
                                        name="password" 
                                        type="password" 
                                        placeholder="Enter password" 
                                        value={formData.password}
                                        onChange={handleChange} 
                                        required 
                                        className="bg-[#F8F8F8] border border-gray-200" 
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="contactNumber">Contact Number</Label>
                                    <Input 
                                        id="contactNumber"
                                        name="contactNumber" 
                                        placeholder="Enter contact number" 
                                        value={formData.contactNumber}
                                        onChange={handleChange} 
                                        required 
                                        className="bg-[#F8F8F8] border border-gray-200" 
                                    />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City</Label>
                                        <Input 
                                            id="city"
                                            name="city" 
                                            placeholder="Enter city" 
                                            value={formData.city}
                                            onChange={handleChange} 
                                            required 
                                            className="bg-[#F8F8F8] border border-gray-200" 
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="pincode">Pincode</Label>
                                        <Input 
                                            id="pincode"
                                            name="pincode" 
                                            placeholder="Enter pincode" 
                                            value={formData.pincode}
                                            onChange={handleChange} 
                                            required 
                                            className="bg-[#F8F8F8] border border-gray-200" 
                                        />
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="streetAddress">Street Address</Label>
                                    <Input 
                                        id="streetAddress"
                                        name="streetAddress" 
                                        placeholder="Enter street address" 
                                        value={formData.streetAddress}
                                        onChange={handleChange} 
                                        required 
                                        className="bg-[#F8F8F8] border border-gray-200" 
                                    />
                                </div>
                                
                                <div className="pt-4 flex justify-end space-x-4">
                                    <Button 
                                        type="button" 
                                        variant="outline"
                                        onClick={() => router.push('/admin/dashboard')}
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        className="bg-[#6CDAEC] hover:bg-[#5BCFE3] text-white"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Registering...' : 'Register Admin'}
                                    </Button>
                                </div>
                </form>
            </CardContent>
        </Card>
                </div>
            </main>
            
            <Footer />
        </div>
    )
}

