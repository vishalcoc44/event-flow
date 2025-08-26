'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { Button } from './ui/button'
import { GradientButton } from './ui/gradient-button'
import { GradientLink } from './ui/gradient-link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useOrganizationData, useOrganizationPermissions } from '@/hooks/useOrganizationData'
import { HoverShadowEffect } from './ui/hover-shadow-effect'
import { NotificationBell } from './NotificationBell'
// Icons as SVG components
const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const BuildingOfficeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
  </svg>
);

const UserGroupIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const CogIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

interface HeaderProps {
    onRegisterClick?: () => void
    onLoginClick?: () => void
}

export default function Header({ onRegisterClick, onLoginClick }: HeaderProps) {
    const pathname = usePathname()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false)
    const { logout, user } = useAuth()
    const { organization, orgLoading } = useOrganizationData()
    const { isOwner, isAdmin, canManageMembers, canManageEventSpaces } = useOrganizationPermissions()
    const orgDropdownRef = useRef<HTMLDivElement>(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (orgDropdownRef.current && !orgDropdownRef.current.contains(event.target as Node)) {
                setIsOrgDropdownOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const handleLogout = async () => {
        try {
            await logout()
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    return (
        <header className="bg-white border-b border-gray-100 py-3">
            <div className="container mx-auto px-2 flex items-center">
                {/* Logo - Moved further left with reduced padding */}
                <Link href="/" className="flex items-center flex-shrink-0 mr-6">
                    <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                            <path d="M12.75 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM7.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM8.25 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM9.75 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM10.5 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM12.75 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM14.25 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" />
                            <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">EventFlow</span>
                </Link>

                {/* Organization Dropdown */}
                {user && organization && (
                    <div className="hidden md:block relative mr-4" ref={orgDropdownRef}>
                        <button
                            onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
                            className="flex items-center space-x-2 px-2 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <BuildingOfficeIcon />
                            <span className="max-w-[120px] truncate">{organization.name}</span>
                            <ChevronDownIcon />
                        </button>
                        
                        {isOrgDropdownOpen && (
                            <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                <div className="p-4 border-b border-gray-100">
                                    <div className="flex items-center space-x-2">
                                        <BuildingOfficeIcon />
                                        <div>
                                            <p className="font-medium text-gray-900">{organization.name}</p>
                                            <p className="text-xs text-gray-500">{organization.subscription_plan} Plan</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="p-2">
                                    <Link
                                        href="/organization/dashboard"
                                        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                                        onClick={() => setIsOrgDropdownOpen(false)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                                        </svg>
                                        <span>Dashboard</span>
                                    </Link>
                                    
                                    <Link
                                        href="/organization/events"
                                        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                                        onClick={() => setIsOrgDropdownOpen(false)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 9l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 15a6 6 0 1012 0v-3H3v3z" />
                                        </svg>
                                        <span>Events</span>
                                    </Link>
                                    
                                    {canManageMembers && (
                                        <Link
                                            href="/organization/members"
                                            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                                            onClick={() => setIsOrgDropdownOpen(false)}
                                        >
                                            <UserGroupIcon />
                                            <span>Members</span>
                                        </Link>
                                    )}
                                    
                                    {canManageEventSpaces && (
                                        <Link
                                            href="/organization/spaces"
                                            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                                            onClick={() => setIsOrgDropdownOpen(false)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                            <span>Event Spaces</span>
                                        </Link>
                                    )}
                                    
                                    {isOwner && (
                                        <Link
                                            href="/organization/plans"
                                            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                                            onClick={() => setIsOrgDropdownOpen(false)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 10c-4.418 0-8-1.79-8-4V7c0-2.21 3.582-4 8-4s8 1.79 8 4v7c0 2.21-3.582 4-8 4z" />
                                            </svg>
                                            <span>Plans & Pricing</span>
                                        </Link>
                                    )}
                                    
                                    {isOwner && (
                                        <Link
                                            href="/organization/settings"
                                            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                                            onClick={() => setIsOrgDropdownOpen(false)}
                                        >
                                            <CogIcon />
                                            <span>Settings</span>
                                        </Link>
                                    )}
                                    {isOwner && (
                                        <Link
                                            href="/organization/onboarding"
                                            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                                            onClick={() => setIsOrgDropdownOpen(false)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            <span>Onboarding</span>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-3 flex-1">
                    {(user?.role === 'ADMIN' || user?.is_org_admin) && (
                        <div className="flex items-center space-x-3 flex-wrap">
                            <HoverShadowEffect className="px-2 py-1.5 rounded-lg cursor-pointer block" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.1} hoverScale={1.01} hoverLift={-0.5} transitionDuration={100}>
                                <Link 
                                    href="/admin/dashboard" 
                                    className={`text-sm font-medium block w-full h-full ${pathname.includes('/admin/dashboard') ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    Dashboard
                                </Link>
                            </HoverShadowEffect>
                            <HoverShadowEffect className="px-2 py-1.5 rounded-lg cursor-pointer block" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.1} hoverScale={1.01} hoverLift={-0.5} transitionDuration={100}>
                                <Link 
                                    href="/admin/event" 
                                    className={`text-sm font-medium block w-full h-full ${pathname.includes('/admin/event') ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    Add Event
                                </Link>
                            </HoverShadowEffect>
                            <HoverShadowEffect className="px-2 py-1.5 rounded-lg cursor-pointer block" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.1} hoverScale={1.01} hoverLift={-0.5} transitionDuration={100}>
                                <Link 
                                    href="/admin/category" 
                                    className={`text-sm font-medium block w-full h-full ${pathname.includes('/admin/category') ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    Categories
                                </Link>
                            </HoverShadowEffect>
                            <HoverShadowEffect className="px-2 py-1.5 rounded-lg cursor-pointer block" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.1} hoverScale={1.01} hoverLift={-0.5} transitionDuration={100}>
                                <Link 
                                    href="/admin/events" 
                                    className={`text-sm font-medium block w-full h-full ${pathname.includes('/admin/events') ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    Events
                                </Link>
                            </HoverShadowEffect>
                            <HoverShadowEffect className="px-2 py-1.5 rounded-lg cursor-pointer block" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.1} hoverScale={1.01} hoverLift={-0.5} transitionDuration={100}>
                                <Link 
                                    href="/admin/bookings" 
                                    className={`text-sm font-medium block w-full h-full ${pathname.includes('/admin/bookings') ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    Bookings
                                </Link>
                            </HoverShadowEffect>
                            <HoverShadowEffect className="px-2 py-1.5 rounded-lg cursor-pointer block" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.1} hoverScale={1.01} hoverLift={-0.5} transitionDuration={100}>
                                <Link 
                                    href="/admin/customers" 
                                    className={`text-sm font-medium block w-full h-full ${pathname.includes('/admin/customers') ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    Customers
                                </Link>
                            </HoverShadowEffect>
                            <HoverShadowEffect className="px-2 py-1.5 rounded-lg cursor-pointer block" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.1} hoverScale={1.01} hoverLift={-0.5} transitionDuration={100}>
                                <Link 
                                    href="/admin/admin-requests" 
                                    className={`text-sm font-medium block w-full h-full ${pathname.includes('/admin/admin-requests') ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    Requests
                                </Link>
                            </HoverShadowEffect>
                            <HoverShadowEffect className="px-2 py-1.5 rounded-lg cursor-pointer block" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.1} hoverScale={1.01} hoverLift={-0.5} transitionDuration={100}>
                                <Link 
                                    href="/admin/register" 
                                    className={`text-sm font-medium block w-full h-full ${pathname.includes('/admin/register') ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    Register
                                </Link>
                            </HoverShadowEffect>
                        </div>
                    )}

                    {user?.role === 'customer' && (
                        <div className="flex items-center space-x-3 flex-wrap">
                            <HoverShadowEffect className="px-2 py-1.5 rounded-lg cursor-pointer block" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.1} hoverScale={1.01} hoverLift={-0.5} transitionDuration={100}>
                                <Link 
                                    href="/customer/dashboard" 
                                    className={`text-sm font-medium block w-full h-full ${pathname.includes('/customer/dashboard') ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    Dashboard
                                </Link>
                            </HoverShadowEffect>
                            <HoverShadowEffect className="px-2 py-1.5 rounded-lg cursor-pointer block" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.1} hoverScale={1.01} hoverLift={-0.5} transitionDuration={100}>
                                <Link 
                                    href="/events" 
                                    className={`text-sm font-medium block w-full h-full ${pathname.includes('/events') ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    Events
                                </Link>
                            </HoverShadowEffect>
                            <HoverShadowEffect className="px-2 py-1.5 rounded-lg cursor-pointer block" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.1} hoverScale={1.01} hoverLift={-0.5} transitionDuration={100}>
                                <Link 
                                    href="/social" 
                                    className={`text-sm font-medium block w-full h-full ${pathname.includes('/social') ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    Social
                                </Link>
                            </HoverShadowEffect>
                            <HoverShadowEffect className="px-2 py-1.5 rounded-lg cursor-pointer block" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.1} hoverScale={1.01} hoverLift={-0.5} transitionDuration={100}>
                                <Link 
                                    href="/customer/bookings" 
                                    className={`text-sm font-medium block w-full h-full ${pathname.includes('/customer/bookings') ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    Bookings
                                </Link>
                            </HoverShadowEffect>
                            <HoverShadowEffect className="px-2 py-1.5 rounded-lg cursor-pointer block" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.1} hoverScale={1.01} hoverLift={-0.5} transitionDuration={100}>
                                <Link 
                                    href="/customer/profile" 
                                    className={`text-sm font-medium block w-full h-full ${pathname.includes('/customer/profile') ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    Profile
                                </Link>
                            </HoverShadowEffect>
                            <HoverShadowEffect className="px-2 py-1.5 rounded-lg cursor-pointer block" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.1} hoverScale={1.01} hoverLift={-0.5} transitionDuration={100}>
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

                <div className="hidden md:flex items-center space-x-3 flex-shrink-0">
                    {user ? (
                        <>
                            <NotificationBell />
                            <HoverShadowEffect className="cursor-pointer" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.15} hoverScale={1.02} hoverLift={-1} transitionDuration={150}>
                                <Button 
                                    variant="destructive" 
                                    size="sm" 
                                    onClick={handleLogout}
                                    className="px-3 py-1.5 text-sm"
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
                                className="px-3 py-1.5 text-sm"
                            >
                                Login
                            </GradientButton>
                            <GradientButton 
                                href="/register"
                                variant="primary"
                                size="sm"
                                className="px-3 py-1.5 text-sm"
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
                <div className="md:hidden bg-white border-t border-gray-100 py-3">
                    <div className="container mx-auto px-2 flex flex-col space-y-3">
                        {(user?.role === 'ADMIN' || user?.is_org_admin) && (
                            <>
                                <Link 
                                    href="/admin/dashboard" 
                                    className={`text-sm font-medium block py-1.5 px-2 rounded-lg hover:bg-gray-50 ${pathname?.includes('/admin/dashboard') ? 'text-primary bg-primary/10' : 'text-gray-600'}`}
                                >
                                    Dashboard
                                </Link>
                                <Link 
                                    href="/admin/event" 
                                    className={`text-sm font-medium block py-1.5 px-2 rounded-lg hover:bg-gray-50 ${pathname.includes('/admin/event') ? 'text-primary bg-primary/10' : 'text-gray-600'}`}
                                >
                                    Add Event
                                </Link>
                                <Link 
                                    href="/admin/category" 
                                    className={`text-sm font-medium block py-1.5 px-2 rounded-lg hover:bg-gray-50 ${pathname.includes('/admin/category') ? 'text-primary bg-primary/10' : 'text-gray-600'}`}
                                >
                                    Categories
                                </Link>
                                <Link 
                                    href="/admin/events" 
                                    className={`text-sm font-medium block py-1.5 px-2 rounded-lg hover:bg-gray-50 ${pathname.includes('/admin/events') ? 'text-primary bg-primary/10' : 'text-gray-600'}`}
                                >
                                    Events
                                </Link>
                                <Link 
                                    href="/admin/bookings" 
                                    className={`text-sm font-medium block py-1.5 px-2 rounded-lg hover:bg-gray-50 ${pathname.includes('/admin/bookings') ? 'text-primary bg-primary/10' : 'text-gray-600'}`}
                                >
                                    Bookings
                                </Link>
                                <Link 
                                    href="/admin/customers" 
                                    className={`text-sm font-medium block py-1.5 px-2 rounded-lg hover:bg-gray-50 ${pathname.includes('/admin/customers') ? 'text-primary bg-primary/10' : 'text-gray-600'}`}
                                >
                                    Customers
                                </Link>
                                <Link 
                                    href="/admin/register" 
                                    className={`text-sm font-medium block py-1.5 px-2 rounded-lg hover:bg-gray-50 ${pathname.includes('/admin/register') ? 'text-primary bg-primary/10' : 'text-gray-600'}`}
                                >
                                    Register
                                </Link>
                            </>
                        )}

                        {user?.role === 'customer' && (
                            <>
                                <Link 
                                    href="/customer/dashboard" 
                                    className={`text-sm font-medium block py-1.5 px-2 rounded-lg hover:bg-gray-50 ${pathname.includes('/customer/dashboard') ? 'text-primary bg-primary/10' : 'text-gray-600'}`}
                                >
                                    Dashboard
                                </Link>
                                <Link 
                                    href="/events" 
                                    className={`text-sm font-medium block py-1.5 px-2 rounded-lg hover:bg-gray-50 ${pathname.includes('/events') ? 'text-primary bg-primary/10' : 'text-gray-600'}`}
                                >
                                    Events
                                </Link>
                                <Link 
                                    href="/social" 
                                    className={`text-sm font-medium block py-1.5 px-2 rounded-lg hover:bg-gray-50 ${pathname.includes('/social') ? 'text-primary bg-primary/10' : 'text-gray-600'}`}
                                >
                                    Social
                                </Link>
                                <Link 
                                    href="/customer/bookings" 
                                    className={`text-sm font-medium block py-1.5 px-2 rounded-lg hover:bg-gray-50 ${pathname.includes('/customer/bookings') ? 'text-primary bg-primary/10' : 'text-gray-600'}`}
                                >
                                    Bookings
                                </Link>
                                <Link 
                                    href="/customer/profile" 
                                    className={`text-sm font-medium block py-1.5 px-2 rounded-lg hover:bg-gray-50 ${pathname.includes('/customer/profile') ? 'text-primary bg-primary/10' : 'text-gray-600'}`}
                                >
                                    Profile
                                </Link>
                            </>
                        )}

                        {/* Organization Navigation for Mobile */}
                        {user && organization && (
                            <>
                                <div className="border-t border-gray-200 pt-4 mt-4">
                                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Organization
                                    </div>
                                    <Link 
                                        href="/organization/dashboard" 
                                        className={`text-sm font-medium block py-1.5 px-2 rounded-lg hover:bg-gray-50 ${pathname?.includes('/organization/dashboard') ? 'text-primary bg-primary/10' : 'text-gray-600'}`}
                                    >
                                        Dashboard
                                    </Link>
                                    <Link 
                                        href="/organization/events" 
                                        className={`text-sm font-medium block py-1.5 px-2 rounded-lg hover:bg-gray-50 ${pathname?.includes('/organization/events') ? 'text-primary bg-primary/10' : 'text-gray-600'}`}
                                    >
                                        Events
                                    </Link>
                                    {canManageMembers && (
                                        <Link 
                                            href="/organization/members" 
                                            className={`text-sm font-medium block py-1.5 px-2 rounded-lg hover:bg-gray-50 ${pathname.includes('/organization/members') ? 'text-primary bg-primary/10' : 'text-gray-600'}`}
                                        >
                                            Members
                                        </Link>
                                    )}
                                    {canManageEventSpaces && (
                                        <Link 
                                            href="/organization/spaces" 
                                            className={`text-sm font-medium block py-1.5 px-2 rounded-lg hover:bg-gray-50 ${pathname.includes('/organization/spaces') ? 'text-primary bg-primary/10' : 'text-gray-600'}`}
                                        >
                                            Event Spaces
                                        </Link>
                                    )}
                                    {isOwner && (
                                        <Link 
                                            href="/organization/settings" 
                                            className={`text-sm font-medium block py-1.5 px-2 rounded-lg hover:bg-gray-50 ${pathname.includes('/organization/settings') ? 'text-primary bg-primary/10' : 'text-gray-600'}`}
                                        >
                                            Settings
                                        </Link>
                                    )}
                                </div>
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

