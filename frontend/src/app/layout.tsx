import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { AuthProvider } from '@/contexts/AuthContext'
import { OrganizationProvider } from '@/contexts/OrganizationContext'
import { CategoryProvider } from '@/contexts/CategoryContext'
import { EventProvider } from '@/contexts/EventContext'
import { BookingProvider } from '@/contexts/BookingContext'
import { CustomerProvider } from '@/contexts/CustomerContext'
import { SocialProvider } from '@/contexts/SocialContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { ReviewProvider } from '@/contexts/ReviewContext'
import { Toaster } from "@/components/ui/toaster";
import PageTransition from '@/components/PageTransition';

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "EventFlow - Event Management System",
    description: "A comprehensive platform for managing events and bookings",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={inter.variable}>
            <body className="min-h-screen bg-background font-sans antialiased">
                <AuthProvider>
                    <OrganizationProvider>
                        <CategoryProvider>
                            <EventProvider>
                                <BookingProvider>
                                    <CustomerProvider>
                                        <SocialProvider>
                                            <NotificationProvider>
                                                <ReviewProvider>
                                                    <PageTransition>
                                                        {children}
                                                    </PageTransition>
                                                    <Toaster />
                                                </ReviewProvider>
                                            </NotificationProvider>
                                        </SocialProvider>
                                    </CustomerProvider>
                                </BookingProvider>
                            </EventProvider>
                        </CategoryProvider>
                    </OrganizationProvider>
                </AuthProvider>
            </body>
        </html>
    )
}




