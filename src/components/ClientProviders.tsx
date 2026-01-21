'use client'

import { ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import AuthDebugger from './AuthDebugger'
import { SideNavbar } from './SideNavbar'

// Dynamically import providers that aren't needed immediately
// These are client-side only and don't need SSR
const OrganizationProvider = dynamic(() => import('@/contexts/OrganizationContext').then(mod => ({ default: mod.OrganizationProvider })), {
  ssr: false,
  loading: () => null
});

const CategoryProvider = dynamic(() => import('@/contexts/CategoryContext').then(mod => ({ default: mod.CategoryProvider })), {
  ssr: false,
  loading: () => null
});

const EventProvider = dynamic(() => import('@/contexts/EventContext').then(mod => ({ default: mod.EventProvider })), {
  ssr: false,
  loading: () => null
});

const BookingProvider = dynamic(() => import('@/contexts/BookingContext').then(mod => ({ default: mod.BookingProvider })), {
  ssr: false,
  loading: () => null
});

const CustomerProvider = dynamic(() => import('@/contexts/CustomerContext').then(mod => ({ default: mod.CustomerProvider })), {
  ssr: false,
  loading: () => null
});

const SocialProvider = dynamic(() => import('@/contexts/SocialContext').then(mod => ({ default: mod.SocialProvider })), {
  ssr: false,
  loading: () => null
});

const NotificationProvider = dynamic(() => import('@/contexts/NotificationContext').then(mod => ({ default: mod.NotificationProvider })), {
  ssr: false,
  loading: () => null
});

const ReviewProvider = dynamic(() => import('@/contexts/ReviewContext').then(mod => ({ default: mod.ReviewProvider })), {
  ssr: false,
  loading: () => null
});

// Optimize PageTransition for better performance
const OptimizedPageTransition = dynamic(() => import('@/components/PageTransition').then(mod => ({ default: mod.default })), {
  ssr: false,
  loading: () => null
});

interface ClientProvidersProps {
  children: ReactNode
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  const pathname = usePathname()

  // Public pages that don't need any of the heavy providers
  const isLandingPage = pathname === '/'
  const isAuthPage = pathname.startsWith('/auth') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password')
  const isLegalPage = pathname.startsWith('/privacy') || pathname.startsWith('/terms')

  const isBasicPublicPage = isLandingPage || isAuthPage || isLegalPage

  // Content always wrapped in PageTransition
  const content = (
    <OptimizedPageTransition>
      {children}
    </OptimizedPageTransition>
  )

  if (isBasicPublicPage) {
    return (
      <>
        {content}
        <AuthDebugger />
      </>
    )
  }

  return (
    <OrganizationProvider>
      <CategoryProvider>
        <EventProvider>
          <BookingProvider>
            <CustomerProvider>
              <SocialProvider>
                <NotificationProvider>
                  <ReviewProvider>
                    {/* Global Side Navbar */}
                    <SideNavbar />
                    <div className="pl-0 md:pl-[80px] transition-all duration-300"> {/* Add padding for side navbar */}
                      {content}
                    </div>
                    {/* Auth debugger for development */}
                    <AuthDebugger />
                  </ReviewProvider>
                </NotificationProvider>
              </SocialProvider>
            </CustomerProvider>
          </BookingProvider>
        </EventProvider>
      </CategoryProvider>
    </OrganizationProvider>
  )
}
