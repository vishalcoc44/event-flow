'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { FeatureCard } from '@/components/ui/feature-card'
import { GradientButton } from '@/components/ui/gradient-button'
import { motion } from 'motion/react'

export default function Home() {
    const { user, isLoading } = useAuth()

    // Show loading state while auth is being determined
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />
            
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                {/* Background Image */}
                <motion.div 
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                >
                    <img 
                        src="/hero-image.jpg" 
                        alt="Event Management Background" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/1920x800?text=Event+Management';
                        }}
                    />
                    {/* Overlay for better text readability */}
                    <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-blue-600/50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    ></motion.div>
                </motion.div>
                
                {/* Content */}
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col items-center justify-center text-center min-h-[600px]">
                        <div className="max-w-4xl">
                            <motion.h1 
                                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                            >
                                Your Events, Effortlessly Managed.
                            </motion.h1>
                            <motion.p 
                                className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                            >
                                EventFlow empowers you to create, promote, and manage stunning events with ease. From intimate workshops to grand conferences, we streamline everything.
                            </motion.p>
                            <motion.div 
                                className="flex flex-col sm:flex-row gap-4 justify-center"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
                            >
                                <GradientButton 
                                    href="/events" 
                                    size="lg" 
                                    variant="primary"
                                    className="w-full sm:w-auto"
                                >
                                    Browse Events
                                </GradientButton>
                                <GradientButton 
                                    href="/register" 
                                    size="lg" 
                                    variant="outline"
                                    className="w-full sm:w-auto"
                                >
                                    Get Started
                                </GradientButton>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gradient-to-br from-gray-50 to-white shadow-[0_8_32px_rgba(59,130,246,0.2),0_16_64px_rgba(0,0,0,0.1)] border border-blue-100/50 rounded-3xl mx-4 my-8">
                <div className="container mx-auto px-4">
                    <motion.h2 
                        className="text-3xl font-bold text-center text-foreground mb-12"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        Features Designed to Simplify Event Management
                    </motion.h2>
                    <motion.div 
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                        >
                            <FeatureCard
                                title="Effortless Event Creation"
                                description="Design and publish stunning event pages in minutes with our intuitive tools and integrated ticketing solutions."
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                }
                            />
                        </motion.div>
                        
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <FeatureCard
                                title="Seamless Ticketing & Registration"
                                description="Manage registrations effortlessly with customizable forms and automated confirmation emails."
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                }
                            />
                        </motion.div>
                        
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            <FeatureCard
                                title="Insightful Analytics"
                                description="Gain valuable insights into your event performance and attendee engagement with detailed reports."
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                }
                            />
                        </motion.div>
                        
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            <FeatureCard
                                title="Engaged Community"
                                description="Foster meaningful interactions between attendees with integrated networking features and discussion forums."
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                }
                            />
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <motion.section 
                className="bg-[#E8FBFD] py-16 shadow-[0_10_40px_rgba(6,182,212,0.25),0_20_80px_rgba(0,0,0,0.15)] border border-cyan-200/60 rounded-3xl mx-4 my-8"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <div className="container mx-auto px-4 text-center">
                    <motion.h2 
                        className="text-3xl font-bold text-foreground mb-6"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                    >
                        Ready to Host Your Next Unforgettable Event?
                    </motion.h2>
                    <motion.p 
                        className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: 25 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                    >
                        Join thousands of satisfied organizers who trust EventFlow for their event planning needs. Get started today and bring your vision to life.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 25 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                    >
                        <GradientButton 
                            href="/register" 
                            size="lg" 
                            variant="cta"
                            shineColor="#9CA3AF"
                        >
                            Join EventFlow Today
                        </GradientButton>
                    </motion.div>
                </div>
            </motion.section>

            <Footer />
        </div>
    )
}