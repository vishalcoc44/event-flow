'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Button } from './ui/button'
import { GradientButton } from './ui/gradient-button'
import { GradientLink } from './ui/gradient-link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useOrganizationData, useOrganizationPermissions } from '@/hooks/useOrganizationData'
import { HoverShadowEffect } from './ui/hover-shadow-effect'
import { cn } from '@/lib/utils'
import { OrgNavigation } from './OrgNavigation'
import { OrgSwitcher } from './OrgSwitcher'
import { adminLinks, customerLinks, guestLinks } from '@/config/navigation'
import { PreviewMarquee } from './ui/PreviewMarquee'

// Lazy load NotificationBell for better performance
const NotificationBell = dynamic(() => import('./NotificationBell').then(mod => ({ default: mod.NotificationBell })), {
    ssr: false,
    loading: () => (
        <div className="relative p-2">
            <div className="w-5 h-5 bg-gray-300 rounded-full animate-pulse" />
        </div>
    )
})

// Shared navigation link configurations

const organizationLinks = [
    { href: '/organization/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { href: '/organization/events', label: 'Events', icon: 'events' },
    { href: '/organization/members', label: 'Members', icon: 'members', permission: 'canManageMembers' },
    { href: '/organization/refunds', label: 'Refunds', icon: 'refunds' },
    { href: '/organization/spaces', label: 'Event Spaces', icon: 'spaces', permission: 'canManageEventSpaces' },
    { href: '/organization/plans', label: 'Plans & Pricing', icon: 'plans', permission: 'isOwner' },
    { href: '/organization/settings', label: 'Settings', icon: 'settings', permission: 'isOwner' },
    { href: '/organization/onboarding', label: 'Onboarding', icon: 'onboarding', permission: 'isOwner' }
]

// Reusable NavItem component for consistent styling
interface NavItemProps {
    href: string
    label: string
    isActive: boolean
    isSpecial?: boolean
    className?: string
    onClick?: () => void
}

function NavItem({ href, label, isActive, isSpecial = false, className, onClick }: NavItemProps) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={cn(
                "group relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-out",
                isActive
                    ? "text-white"
                    : isSpecial
                        ? "text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
                        : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400",
                className
            )}
        >
            {/* Active background with gradient */}
            {isActive && (
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25 animate-in fade-in duration-300" />
            )}
            {/* Hover background */}
            {!isActive && (
                <span className="absolute inset-0 rounded-full bg-blue-500/0 group-hover:bg-blue-500/5 dark:group-hover:bg-blue-400/10 transition-all duration-300" />
            )}
            {/* Label */}
            <span className="relative z-10">{label}</span>
            {/* Special indicator dot */}
            {isSpecial && !isActive && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 shadow-lg shadow-cyan-400/50" />
            )}
        </Link>
    )
}

// Mobile NavItem for touch-friendly interactions
function MobileNavItem({ href, label, isActive, isSpecial = false, onClick }: NavItemProps) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={cn(
                "group relative block px-4 py-3.5 text-sm font-medium rounded-2xl transition-all duration-300 overflow-hidden",
                isActive
                    ? "text-white"
                    : isSpecial
                        ? "text-gray-700 dark:text-gray-200"
                        : "text-gray-600 dark:text-gray-300"
            )}
        >
            {/* Active background */}
            {isActive && (
                <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25" />
            )}
            {/* Hover background */}
            {!isActive && (
                <span className="absolute inset-0 rounded-2xl bg-blue-500/0 group-hover:bg-blue-500/5 dark:group-hover:bg-blue-400/10 transition-all duration-300" />
            )}
            <span className="relative z-10 flex items-center justify-between">
                {label}
                {isSpecial && !isActive && (
                    <span className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 shadow-lg shadow-cyan-400/50" />
                )}
            </span>
        </Link>
    )
}

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
    user?: {
        role: 'ADMIN' | 'USER' | 'customer' | string
        id?: string
        email?: string
        username?: string
        first_name?: string
        last_name?: string
        contact_number?: string
        city?: string
        pincode?: string
        street_address?: string
        created_at?: string
        organization_id?: string
        role_in_org?: 'OWNER' | 'ADMIN' | 'USER'
        is_org_admin?: boolean
        joined_at?: string
    } | null
}

export default function Header({ onRegisterClick, onLoginClick, user: propUser }: HeaderProps) {
    const pathname = usePathname()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const { logout, user: authUser } = useAuth()
    const { organization, orgLoading } = useOrganizationData()
    const { isOwner, isAdmin, canManageMembers, canManageEventSpaces } = useOrganizationPermissions()

    // Use the passed user prop if available, otherwise use the auth context user
    const user = propUser !== undefined ? propUser : authUser

    const handleLogout = async () => {
        try {
            await logout()
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    return (
        <>
            {/* Navbar wrapper with subtle side shadows */}
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] group/nav">
                {/* Left side dark shadow */}
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-3/4 bg-black/5 dark:bg-black/20 blur-xl rounded-full opacity-0 group-hover/nav:opacity-100 transition-opacity duration-500" />
                {/* Right side dark shadow */}
                <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-3/4 bg-black/5 dark:bg-black/20 blur-xl rounded-full opacity-0 group-hover/nav:opacity-100 transition-opacity duration-500" />

                <header className="relative w-fit mx-auto max-w-[95vw] bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/40 dark:border-white/10 py-2.5 px-4 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-500 hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] hover:bg-white/80 dark:hover:bg-gray-900/80">
                    <div className="flex items-center justify-center gap-6 whitespace-nowrap">
                        {/* Logo */}
                        <Link href="/" className="flex items-center flex-shrink-0 pl-3 pr-4 group/logo">
                            <div className="relative">
                                <img src="/logo.svg" alt="EventFlow Logo" className="h-8 w-auto transition-transform duration-300 group-hover/logo:scale-110" />
                                <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300" />
                            </div>
                            <span className="ml-2.5 text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent transition-all duration-300">EventFlow</span>
                        </Link>

                        {/* Interactive Premium Marquee */}
                        <div className="hidden lg:block ml-2">
                            <PreviewMarquee />
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center justify-center">
                            {!user ? (
                                <div className="flex items-center bg-gray-100/50 dark:bg-white/5 rounded-full p-1">
                                    {guestLinks.map((link) => (
                                        <NavItem
                                            key={link.href}
                                            href={link.href}
                                            label={link.label}
                                            isActive={
                                                link.href === '/'
                                                    ? pathname === link.href
                                                    : pathname.includes(link.href)
                                            }
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    {user.role === 'customer' || user.role === 'USER' || user.role === 'ADMIN' ? (
                                        <>
                                            <OrgSwitcher />
                                            {/* Show Organization Menu only when an organization is active */}
                                            <OrgNavigation />
                                        </>
                                    ) : null}
                                </div>
                            )}
                        </nav>

                        <div className="hidden md:flex items-center space-x-3 flex-shrink-0 pr-1.5">
                            {user ? (
                                <>
                                    <NotificationBell />

                                    {/* Create Organization Button for users without an org */}
                                    {!organization && !orgLoading && (
                                        <div className="mr-2">
                                            <GradientButton
                                                href="/create-organization"
                                                variant="primary"
                                                size="sm"
                                                className="px-4 py-1.5 text-sm rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 border-none shadow-lg shadow-blue-500/20 transition-all font-medium"
                                                containerClassName="rounded-full"
                                                shineColor="#22d3ee"
                                            >
                                                Create Organization
                                            </GradientButton>
                                        </div>
                                    )}

                                    <HoverShadowEffect className="cursor-pointer rounded-full" shadowColor="rgba(239, 68, 68, 0.1)" shadowIntensity={0.2} hoverScale={1.05} hoverLift={-1} transitionDuration={200}>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleLogout}
                                            className="px-5 py-1.5 text-sm rounded-full bg-red-500/10 text-red-600 hover:bg-red-500/20 border border-red-500/20 transition-all font-medium"
                                        >
                                            Logout
                                        </Button>
                                    </HoverShadowEffect>
                                </>
                            ) : (
                                <>
                                    <GradientButton
                                        href="/auth"
                                        variant="outline"
                                        size="sm"
                                        className="px-5 py-1.5 text-sm rounded-full bg-transparent border-neutral-200 dark:border-white/10 hover:border-blue-400/50 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                                        containerClassName="rounded-full"
                                    >
                                        Login
                                    </GradientButton>
                                    <GradientButton
                                        href="/auth"
                                        variant="primary"
                                        size="sm"
                                        className="px-6 py-1.5 text-sm rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 border-none shadow-lg shadow-blue-500/20 transition-all"
                                        containerClassName="rounded-full"
                                        shineColor="#22d3ee"
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
                        <div className="md:hidden fixed inset-x-0 top-[88px] bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border-t border-white/20 dark:border-white/10 shadow-2xl z-40 animate-in slide-in-from-top-2 duration-300">
                            <div className="container mx-auto px-4 py-6 max-h-[calc(100vh-88px)] overflow-y-auto">
                                <div className="space-y-6">
                                    {(() => {
                                        if (!user) {
                                            return (
                                                <div className="space-y-3">
                                                    <div className="px-3 py-2">
                                                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Navigation</h3>
                                                    </div>
                                                    <div className="space-y-1">
                                                        {guestLinks.map((link) => (
                                                            <MobileNavItem
                                                                key={link.href}
                                                                href={link.href}
                                                                label={link.label}
                                                                isActive={
                                                                    link.href === '/'
                                                                        ? pathname === link.href
                                                                        : pathname.includes(link.href)
                                                                }
                                                                onClick={() => setIsMobileMenuOpen(false)}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        }

                                        // Determine links based on role priority
                                        let linksToRender: any[] = [];
                                        let label = "Navigation";
                                        let isSpecialCheck = false;

                                        if (user.role === 'ADMIN' || user.is_org_admin) {
                                            linksToRender = adminLinks;
                                            label = "Admin Tools";
                                            isSpecialCheck = true;
                                        } else if (user.role === 'customer' || user.role === 'USER') {
                                            linksToRender = customerLinks;
                                            label = "User Menu";
                                        }

                                        return (
                                            <div className="space-y-3">
                                                <div className="px-3 py-2">
                                                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</h3>
                                                </div>
                                                <div className="space-y-1">
                                                    {linksToRender.map((link) => (
                                                        <MobileNavItem
                                                            key={link.href}
                                                            href={link.href}
                                                            label={link.label}
                                                            isActive={
                                                                isSpecialCheck && !link.isSpecial
                                                                    ? link.href === '/admin/bookings'
                                                                        ? pathname.includes('/admin/bookings')
                                                                        : pathname === link.href
                                                                    : pathname.includes(link.href)
                                                            }
                                                            isSpecial={link.isSpecial}
                                                            onClick={() => setIsMobileMenuOpen(false)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* Organization Navigation */}
                                    {user && organization && (
                                        <div className="space-y-3">
                                            <div className="px-3 py-2">
                                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Organization</h3>
                                            </div>
                                            <div className="space-y-1">
                                                {organizationLinks.map((link) => {
                                                    // Check permissions if required
                                                    if (link.permission) {
                                                        const permissions: Record<string, boolean> = {
                                                            canManageMembers,
                                                            canManageEventSpaces,
                                                            isOwner
                                                        }
                                                        if (!permissions[link.permission]) return null
                                                    }

                                                    return (
                                                        <MobileNavItem
                                                            key={link.href}
                                                            href={link.href}
                                                            label={link.label}
                                                            isActive={pathname.includes(link.href)}
                                                            onClick={() => {
                                                                setIsMobileMenuOpen(false)
                                                            }}
                                                        />
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Auth Actions */}
                                    <div className="pt-4 border-t border-white/20 dark:border-white/10">
                                        {user ? (
                                            <div className="space-y-3">
                                                {!organization && !orgLoading && (
                                                    <GradientButton
                                                        href="/create-organization"
                                                        variant="primary"
                                                        size="sm"
                                                        className="w-full rounded-xl"
                                                        containerClassName="rounded-xl"
                                                    >
                                                        Create Organization
                                                    </GradientButton>
                                                )}
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={handleLogout}
                                                    className="w-full rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500/20 border border-red-500/20"
                                                >
                                                    Logout
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <GradientButton
                                                    href="/auth"
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full rounded-xl bg-transparent border-neutral-200 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5"
                                                    containerClassName="rounded-xl"
                                                >
                                                    Login
                                                </GradientButton>
                                                <GradientButton
                                                    href="/auth"
                                                    variant="primary"
                                                    size="sm"
                                                    className="w-full rounded-xl"
                                                    containerClassName="rounded-xl"
                                                >
                                                    Sign Up
                                                </GradientButton>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </header>
            </div>
            {pathname !== '/' && <div className="h-8" />}
        </>
    )
}

