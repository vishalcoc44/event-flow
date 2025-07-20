'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from './ui/button'
import { GradientButton } from './ui/gradient-button'
import { GradientLink } from './ui/gradient-link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { HoverShadowEffect } from './ui/hover-shadow-effect'
import { NotificationBell } from './NotificationBell'

interface HeaderProps {
    onRegisterClick?: () => void
    onLoginClick?: () => void
    user?: { role: 'admin' | 'ADMIN' | 'customer' } | null
}

export default function Header({ onRegisterClick, onLoginClick, user }: HeaderProps) {
    const pathname = usePathname()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const { logout } = useAuth()

    const handleLogout = async () => {
        try {
            await logout()
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    return (
        <header className="bg-white border-b border-gray-100 py-4">
            <div className="container mx-auto px-4 flex justify-between items-center">
                <Link href="/" className="flex items-center">
                    <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                            <path d="M12.75 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM7.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM8.25 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM9.75 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM10.5 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM12.75 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM14.25 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" />
                            <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <span className="text-xl font-semibold text-gray-900">EventFlow</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-6">
                    {(user?.role === 'admin' || user?.role === 'ADMIN') && (
                        <div className="flex items-center space-x-6">
                            <HoverShadowEffect className="px-3 py-2 rounded-lg cursor-pointer block" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.1} hoverScale={1.01} hoverLift={-0.5} transitionDuration={100}>
                                <Link 
                                    href="/admin/dashboard" 
                                    className={`text-sm font-medium block w-full h-full ${pathname.includes('/admin/dashboard') ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    Dashboard
                                </Link>
                            </HoverShadowEffect>
                            <HoverShadowEffect className="px-3 py-2 rounded-lg cursor-pointer block" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.1} hoverScale={1.01} hoverLift={-0.5} transitionDuration={100}>
                                <Link 
                                    href="/admin/event" 
                                    className={`text-sm font-medium block w-full h-full ${pathname.includes('/admin/event') ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    Add Event
                                </Link>
                            </HoverShadowEffect>
                            <HoverShadowEffect className="px-3 py-2 rounded-lg cursor-pointer block" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.1} hoverScale={1.01} hoverLift={-0.5} transitionDuration={100}>
                                <Link 
                                    href="/admin/category" 
                                    className={`text-sm font-medium block w-full h-full ${pathname.includes('/admin/category') ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    Add Category
                                </Link>
                            </HoverShadowEffect>
                            <HoverShadowEffect className="px-3 py-2 rounded-lg cursor-pointer block" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.1} hoverScale={1.01} hoverLift={-0.5} transitionDuration={100}>
                                <Link 
                                    href="/admin/events" 
                                    className={`text-sm font-medium block w-full h-full ${pathname.includes('/admin/events') ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    All Events
                                </Link>
                            </HoverShadowEffect>
                            <HoverShadowEffect className="px-3 py-2 rounded-lg cursor-pointer block" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.1} hoverScale={1.01} hoverLift={-0.5} transitionDuration={100}>
                                <Link 
                                    href="/admin/bookings" 
                                    className={`text-sm font-medium block w-full h-full ${pathname.includes('/admin/bookings') ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    All Bookings
                                </Link>
                            </HoverShadowEffect>
                            <HoverShadowEffect className="px-3 py-2 rounded-lg cursor-pointer block" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.1} hoverScale={1.01} hoverLift={-0.5} transitionDuration={100}>
                                <Link 
                                    href="/admin/customers" 
                                    className={`text-sm font-medium block w-full h-full ${pathname.includes('/admin/customers') ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    Customers
                                </Link>
                            </HoverShadowEffect>
                            <HoverShadowEffect className="px-3 py-2 rounded-lg cursor-pointer block" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.1} hoverScale={1.01} hoverLift={-0.5} transitionDuration={100}>
                                <Link 
                                    href="/admin/admin-requests" 
                                    className={`text-sm font-medium block w-full h-full ${pathname.includes('/admin/admin-requests') ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    Admin Requests
                                </Link>
                            </HoverShadowEffect>
                            <HoverShadowEffect className="px-3 py-2 rounded-lg cursor-pointer block" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.1} hoverScale={1.01} hoverLift={-0.5} transitionDuration={100}>
                                <Link 
                                    href="/admin/register" 
                                    className={`text-sm font-medium block w-full h-full ${pathname.includes('/admin/register') ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    Register Admin
                                </Link>
                            </HoverShadowEffect>
                        </div>
                    )}

                    {user?.role === 'customer' && (
                        <div className="flex items-center space-x-6">
                            <HoverShadowEffect className="px-3 py-2 rounded-lg cursor-pointer block" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.1} hoverScale={1.01} hoverLift={-0.5} transitionDuration={100}>
                                <Link 
                                    href="/customer/dashboard" 
                                    className={`text-sm font-medium block w-full h-full ${pathname.includes('/customer/dashboard') ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    Dashboard
                                </Link>
                            </HoverShadowEffect>
                            <HoverShadowEffect className="px-3 py-2 rounded-lg cursor-pointer block" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.1} hoverScale={1.01} hoverLift={-0.5} transitionDuration={100}>
                                <Link 
                                    href="/events" 
                                    className={`text-sm font-medium block w-full h-full ${pathname.includes('/events') ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    Events
                                </Link>
                            </HoverShadowEffect>
                            <HoverShadowEffect className="px-3 py-2 rounded-lg cursor-pointer block" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.1} hoverScale={1.01} hoverLift={-0.5} transitionDuration={100}>
                                <Link 
                                    href="/social" 
                                    className={`text-sm font-medium block w-full h-full ${pathname.includes('/social') ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    Social
                                </Link>
                            </HoverShadowEffect>
                            <HoverShadowEffect className="px-3 py-2 rounded-lg cursor-pointer block" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.1} hoverScale={1.01} hoverLift={-0.5} transitionDuration={100}>
                                <Link 
                                    href="/customer/bookings" 
                                    className={`text-sm font-medium block w-full h-full ${pathname.includes('/customer/bookings') ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    My Bookings
                                </Link>
                            </HoverShadowEffect>
                            <HoverShadowEffect className="px-3 py-2 rounded-lg cursor-pointer block" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.1} hoverScale={1.01} hoverLift={-0.5} transitionDuration={100}>
                                <Link 
                                    href="/customer/profile" 
                                    className={`text-sm font-medium block w-full h-full ${pathname.includes('/customer/profile') ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    Profile
                                </Link>
                            </HoverShadowEffect>
                            <HoverShadowEffect className="px-3 py-2 rounded-lg cursor-pointer block" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.1} hoverScale={1.01} hoverLift={-0.5} transitionDuration={100}>
                                <Link 
                                    href="/customer/admin-request-status" 
                                    className={`text-sm font-medium block w-full h-full ${pathname.includes('/customer/admin-request-status') ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    Admin Request
                                </Link>
                            </HoverShadowEffect>
                        </div>
                    )}

                    {!user && (
                        <div className="flex items-center space-x-6">
                            <GradientLink 
                                href="/" 
                                isActive={pathname === '/'}
                            >
                                Home
                            </GradientLink>
                            <GradientLink 
                                href="/events" 
                                isActive={pathname.includes('/events')}
                            >
                                Events
                            </GradientLink>
                            <GradientLink 
                                href="/about" 
                                isActive={pathname.includes('/about')}
                            >
                                About Us
                            </GradientLink>
                            <GradientLink 
                                href="/contact" 
                                isActive={pathname.includes('/contact')}
                            >
                                Contact
                            </GradientLink>
                        </div>
                    )}
                </nav>

                <div className="hidden md:flex items-center space-x-4">
                    {user ? (
                        <>
                            <NotificationBell />
                            <HoverShadowEffect className="cursor-pointer" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.15} hoverScale={1.02} hoverLift={-1} transitionDuration={150}>
                                <Button 
                                    variant="destructive" 
                                    size="sm" 
                                    onClick={handleLogout}
                                >
                                    Logout
                                </Button>
                            </HoverShadowEffect>
                        </>
                    ) : (
                        <>
                            <GradientButton 
                                href="/login"
                                variant="outline"
                                size="sm"
                            >
                                Login
                            </GradientButton>
                            <GradientButton 
                                href="/register"
                                variant="primary"
                                size="sm"
                            >
                                Sign Up
                            </GradientButton>
                        </>
                    )}
                </div>

                {/* Mobile menu button */}
                <button 
                    className="md:hidden flex items-center" 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                        {isMobileMenuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 py-4">
                    <div className="container mx-auto px-4 flex flex-col space-y-4">
                        {(user?.role === 'admin' || user?.role === 'ADMIN') && (
                            <>
                                <Link 
                                    href="/admin/dashboard" 
                                    className={`text-sm font-medium block py-2 px-3 rounded-lg hover:bg-gray-50 ${pathname.includes('/admin/dashboard') ? 'text-primary bg-primary/10' : 'text-gray-600'}`}
                                >
                                    Dashboard
                                </Link>
                                <Link 
                                    href="/admin/event" 
                                    className={`text-sm font-medium block py-2 px-3 rounded-lg hover:bg-gray-50 ${pathname.includes('/admin/event') ? 'text-primary bg-primary/10' : 'text-gray-600'}`}
                                >
                                    Add Event
                                </Link>
                                <Link 
                                    href="/admin/category" 
                                    className={`text-sm font-medium block py-2 px-3 rounded-lg hover:bg-gray-50 ${pathname.includes('/admin/category') ? 'text-primary bg-primary/10' : 'text-gray-600'}`}
                                >
                                    Add Category
                                </Link>
                                <Link 
                                    href="/admin/events" 
                                    className={`text-sm font-medium block py-2 px-3 rounded-lg hover:bg-gray-50 ${pathname.includes('/admin/events') ? 'text-primary bg-primary/10' : 'text-gray-600'}`}
                                >
                                    All Events
                                </Link>
                                <Link 
                                    href="/admin/bookings" 
                                    className={`text-sm font-medium block py-2 px-3 rounded-lg hover:bg-gray-50 ${pathname.includes('/admin/bookings') ? 'text-primary bg-primary/10' : 'text-gray-600'}`}
                                >
                                    All Bookings
                                </Link>
                                <Link 
                                    href="/admin/customers" 
                                    className={`text-sm font-medium block py-2 px-3 rounded-lg hover:bg-gray-50 ${pathname.includes('/admin/customers') ? 'text-primary bg-primary/10' : 'text-gray-600'}`}
                                >
                                    Customers
                                </Link>
                                <Link 
                                    href="/admin/register" 
                                    className={`text-sm font-medium block py-2 px-3 rounded-lg hover:bg-gray-50 ${pathname.includes('/admin/register') ? 'text-primary bg-primary/10' : 'text-gray-600'}`}
                                >
                                    Register Admin
                                </Link>
                            </>
                        )}

                        {user?.role === 'customer' && (
                            <>
                                <Link 
                                    href="/customer/dashboard" 
                                    className={`text-sm font-medium block py-2 px-3 rounded-lg hover:bg-gray-50 ${pathname.includes('/customer/dashboard') ? 'text-primary bg-primary/10' : 'text-gray-600'}`}
                                >
                                    Dashboard
                                </Link>
                                <Link 
                                    href="/events" 
                                    className={`text-sm font-medium block py-2 px-3 rounded-lg hover:bg-gray-50 ${pathname.includes('/events') ? 'text-primary bg-primary/10' : 'text-gray-600'}`}
                                >
                                    Events
                                </Link>
                                <Link 
                                    href="/social" 
                                    className={`text-sm font-medium block py-2 px-3 rounded-lg hover:bg-gray-50 ${pathname.includes('/social') ? 'text-primary bg-primary/10' : 'text-gray-600'}`}
                                >
                                    Social
                                </Link>
                                <Link 
                                    href="/customer/bookings" 
                                    className={`text-sm font-medium block py-2 px-3 rounded-lg hover:bg-gray-50 ${pathname.includes('/customer/bookings') ? 'text-primary bg-primary/10' : 'text-gray-600'}`}
                                >
                                    My Bookings
                                </Link>
                                <Link 
                                    href="/customer/profile" 
                                    className={`text-sm font-medium block py-2 px-3 rounded-lg hover:bg-gray-50 ${pathname.includes('/customer/profile') ? 'text-primary bg-primary/10' : 'text-gray-600'}`}
                                >
                                    Profile
                                </Link>
                            </>
                        )}

                        {!user && (
                            <>
                                <Link 
                                    href="/" 
                                    className={`text-sm font-medium block py-2 px-3 rounded-lg hover:bg-gray-50 ${pathname === '/' ? 'text-primary bg-primary/10' : 'text-gray-600'}`}
                                >
                                    Home
                                </Link>
                                <Link 
                                    href="/events" 
                                    className={`text-sm font-medium block py-2 px-3 rounded-lg hover:bg-gray-50 ${pathname.includes('/events') ? 'text-primary bg-primary/10' : 'text-gray-600'}`}
                                >
                                    Events
                                </Link>
                                <Link 
                                    href="/about" 
                                    className={`text-sm font-medium block py-2 px-3 rounded-lg hover:bg-gray-50 ${pathname.includes('/about') ? 'text-primary bg-primary/10' : 'text-gray-600'}`}
                                >
                                    About Us
                                </Link>
                                <Link 
                                    href="/contact" 
                                    className={`text-sm font-medium block py-2 px-3 rounded-lg hover:bg-gray-50 ${pathname.includes('/contact') ? 'text-primary bg-primary/10' : 'text-gray-600'}`}
                                >
                                    Contact
                                </Link>
                            </>
                        )}

                        {user ? (
                            <HoverShadowEffect className="w-full mt-4 cursor-pointer" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.15} hoverScale={1.02} hoverLift={-1} transitionDuration={150}>
                                <Button 
                                    variant="destructive" 
                                    size="sm" 
                                    onClick={handleLogout}
                                    className="w-full mt-4"
                                >
                                    Logout
                                </Button>
                            </HoverShadowEffect>
                        ) : (
                            <div className="flex flex-col space-y-2 mt-4">
                                <GradientButton 
                                    href="/login"
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                >
                                    Login
                                </GradientButton>
                                <GradientButton 
                                    href="/register"
                                    variant="primary"
                                    size="sm"
                                    className="w-full"
                                >
                                    Sign Up
                                </GradientButton>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    )
}

