'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { FeatureCard } from '@/components/ui/feature-card'
import { TestimonialCard } from '@/components/ui/testimonial-card'
import { GradientButton } from '@/components/ui/gradient-button'
import { motion } from 'motion/react'

export default function Home() {
    const { user } = useAuth()

    return (
        <div className="min-h-screen flex flex-col bg-white">
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
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <motion.h2 
                        className="text-3xl font-bold text-center text-gray-900 mb-12"
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
                className="bg-[#E8FBFD] py-16"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <div className="container mx-auto px-4 text-center">
                    <motion.h2 
                        className="text-3xl font-bold text-gray-900 mb-6"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                    >
                        Ready to Host Your Next Unforgettable Event?
                    </motion.h2>
                    <motion.p 
                        className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto"
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

            {/* Testimonials Section */}
            <motion.section 
                className="py-20"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <div className="container mx-auto px-4">
                    <motion.h2 
                        className="text-3xl font-bold text-center text-gray-900 mb-12"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                    >
                        What Our Users Are Saying
                    </motion.h2>
                    <motion.div 
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
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
                            <TestimonialCard
                                quote="EventFlow transformed our annual conference management! The intuitive interface and powerful features saved us countless hours and ensured a smooth experience for our attendees."
                                author="Sarah Chen"
                                position="Marketing Director, TechSummit Inc"
                            />
                        </motion.div>
                        
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <TestimonialCard
                                quote="As a small business owner, I needed a simple yet effective way to manage my workshops. EventFlow delivered beyond expectations, making registration and promotion a breeze."
                                author="David Lee"
                                position="Founder, Creative Workshops"
                            />
                        </motion.div>
                        
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            <TestimonialCard
                                quote="The real-time analytics provided by EventFlow are invaluable. We can make data-driven decisions on the fly, significantly improving our event outcomes."
                                author="Maria Garcia"
                                position="Event Strategist, Global Events Co."
                            />
                        </motion.div>
                    </motion.div>
                </div>
            </motion.section>

            {/* Trusted By Section */}
            <motion.section 
                className="py-12 border-t border-gray-100"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <div className="container mx-auto px-4">
                    <motion.h2 
                        className="text-xl font-semibold text-center text-gray-900 mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                    >
                        Trusted by Leading Organizations
                    </motion.h2>
                    <motion.div 
                        className="flex flex-wrap justify-center items-center gap-12"
                        initial={{ opacity: 0, y: 25 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    >
                        {/* Replace with actual logos */}
                        <motion.div 
                            className="w-32 h-12 bg-gray-100 rounded-md"
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        ></motion.div>
                        <motion.div 
                            className="w-32 h-12 bg-gray-100 rounded-md"
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        ></motion.div>
                        <motion.div 
                            className="w-32 h-12 bg-gray-100 rounded-md"
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        ></motion.div>
                        <motion.div 
                            className="w-32 h-12 bg-gray-100 rounded-md"
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        ></motion.div>
                        <motion.div 
                            className="w-32 h-12 bg-gray-100 rounded-md"
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                        ></motion.div>
                        <motion.div 
                            className="w-32 h-12 bg-gray-100 rounded-md"
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                        ></motion.div>
                    </motion.div>
                </div>
            </motion.section>

            <Footer />
        </div>
    )
}