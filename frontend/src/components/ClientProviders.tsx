'use client'

import { ReactNode } from 'react'
import dynamic from 'next/dynamic'
import AuthDebugger from './AuthDebugger'

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
  return (
    <OrganizationProvider>
      <CategoryProvider>
        <EventProvider>
          <BookingProvider>
            <CustomerProvider>
              <SocialProvider>
                <NotificationProvider>
                  <ReviewProvider>
                    {/* Optimized page transition with reduced animations */}
                    <OptimizedPageTransition>
                      {children}
                    </OptimizedPageTransition>
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
