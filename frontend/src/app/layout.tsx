import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Optimize font loading for better performance
const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: 'swap', // Prevents layout shift
    preload: true,
});

// Import core components
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from "@/components/ui/toaster";
import ClientProviders from '@/components/ClientProviders';

// Prevent authentication errors from being logged to console
if (typeof window !== 'undefined') {
    const originalConsoleError = console.error;
    console.error = function(...args: any[]) {
        // Check if this is an authentication-related error
        const errorMessage = args.join(' ');
        if (errorMessage.includes('Invalid login credentials') ||
            errorMessage.includes('AuthApiError') ||
            errorMessage.includes('Invalid Refresh Token') ||
            errorMessage.includes('Refresh Token Not Found')) {
            // Silently ignore authentication errors - they should only show in UI
            return;
        }
        // Log all other errors normally
        originalConsoleError.apply(console, args);
    };
}

export const metadata: Metadata = {
    title: "EventFlow - Event Management System",
    description: "A comprehensive platform for managing events and bookings",
    robots: {
        index: true,
        follow: true,
    },
    // Preconnect to external domains for better performance
    other: {
        'preconnect': ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
    },
};

// Viewport configuration for static export compatibility
export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={inter.variable}>
            <body className="min-h-screen bg-background font-sans antialiased">
                {/* Core authentication provider - always loaded */}
                <AuthProvider>
                    {/* Client-side providers and page transition */}
                    <ClientProviders>
                        {children}
                    </ClientProviders>
                    <Toaster />
                </AuthProvider>
            </body>
        </html>
    )
}




