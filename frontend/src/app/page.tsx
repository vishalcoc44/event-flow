'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Spotlight } from "@/components/ui/spotlight";
import { GradientButton } from "@/components/ui/gradient-button";
import { motion } from "framer-motion";



import { Calendar, Users, Zap, Shield, BarChart3, Globe, Layout, UserPlus, Sparkles, Megaphone, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

import { ActivityDemo, BookingTableDemo, EventCardDemo, SocialDemo, SupportDemo, SecurityDemo, GlobalDemo, VenueDemo, TeamDemo } from '@/components/ui/feature-demos'

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
        <div className="min-h-screen flex flex-col bg-background overflow-x-hidden relative w-full items-center rounded-md antialiased">
            <BackgroundBeams className="fixed inset-0 z-0 opacity-20" />
            <div className="relative z-10 w-full pt-0 pb-0">
                <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />
                <Spotlight
                    className="-top-40 left-0 md:left-60 md:-top-20 opacity-20"
                    fill="#3b82f6"
                />
                <div className="max-w-7xl mx-auto relative z-10 w-full pt-20 md:pt-32 px-4 md:px-8 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="text-4xl md:text-8xl font-black bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 via-neutral-600 to-neutral-900 dark:from-neutral-50 dark:via-neutral-200 dark:to-neutral-50 bg-opacity-20 tracking-tight mb-6 pointer-events-auto animate-gradient-x bg-[length:200%_auto]">
                        The Ultimate <br /> Event Management Platform
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                        className="mt-4 font-normal text-base md:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto pointer-events-auto">
                        The Personal Event Managament Platform for Organizers without clutter
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                        className="mt-10 flex flex-col md:flex-row gap-4 justify-center items-center pointer-events-auto">
                        <Link href="/auth">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <GradientButton variant="primary" size="lg" className="min-w-[160px] rounded-full" containerClassName="rounded-full">
                                    Get Started
                                </GradientButton>
                            </motion.div>
                        </Link>
                        <Link href="/features">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <GradientButton variant="outline" size="lg" className="min-w-[160px] bg-transparent border-neutral-200 dark:border-white/20 text-neutral-600 dark:text-white hover:bg-neutral-100 dark:hover:bg-white/10 rounded-full" containerClassName="rounded-full">
                                    Learn More
                                </GradientButton>
                            </motion.div>
                        </Link>
                    </motion.div>


                </div>
            </div>

            <section className="py-20 bg-background max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl md:text-5xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-neutral-800 via-neutral-600 to-neutral-800 dark:from-neutral-200 dark:via-neutral-400 dark:to-neutral-200 animate-gradient-x bg-[length:200%_auto] opacity-80">
                    Everything you need to run your event.
                </h2>
                <div className="flex flex-col gap-16 md:gap-20">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ margin: "-100px" }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            whileHover={{ y: -5 }}
                            className={cn(
                                "group relative overflow-hidden rounded-3xl bg-neutral-50/50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 p-8 transition-all hover:bg-neutral-100 dark:hover:bg-neutral-900 shadow-sm hover:shadow-md",
                                "flex flex-col md:flex-row gap-8 items-center"
                            )}>
                            <div className={cn("flex-1 space-y-4", idx % 2 === 1 ? "md:order-last" : "")}>
                                <div className="inline-flex items-center justify-center p-2 rounded-xl bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 shadow-sm mb-2">
                                    {feature.icon}
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 via-neutral-600 to-neutral-900 dark:from-white dark:via-neutral-300 dark:to-white tracking-tight animate-gradient-x bg-[length:200%_auto] opacity-80 flex items-center gap-3">
                                    {feature.title}
                                    {feature.comingSoon && (
                                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                            Coming Soon
                                        </span>
                                    )}
                                </h2>
                                <div className="relative">
                                    <div className="absolute -left-4 -top-4 w-8 h-8 bg-blue-500/5 rounded-full blur-xl animate-pulse" />
                                    <p className="text-base md:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-sm relative z-10 font-medium">
                                        {feature.description}
                                    </p>
                                </div>

                            </div>
                            <div className="flex-1 w-full h-full min-h-[250px] relative flex items-center justify-center">
                                {/* <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl blur-3xl -z-10 opacity-10" /> */}
                                {feature.header}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            <section className="py-24 relative w-full overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-neutral-800 via-neutral-600 to-neutral-800 dark:from-neutral-200 dark:via-neutral-400 dark:to-neutral-200 animate-gradient-x bg-[length:200%_auto] opacity-80">
                        From Idea to Event in Minutes
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="group p-8 rounded-3xl bg-neutral-50/50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 hover:border-blue-500/30 transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800/50"
                        >
                            <div className="h-12 w-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                                <span className="text-xs font-mono px-2 py-1 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">01</span>
                                Create
                            </h3>
                            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm">
                                Design stunning event pages with our drag-and-drop builder. No coding required—just pure creativity.
                            </p>
                        </motion.div>

                        {/* Step 2 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="group p-8 rounded-3xl bg-neutral-50/50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 hover:border-purple-500/30 transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800/50"
                        >
                            <div className="h-12 w-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Megaphone className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                                <span className="text-xs font-mono px-2 py-1 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">02</span>
                                Promote
                            </h3>
                            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm">
                                Reach your audience instantly with built-in social tools, email campaigns, and automated invites.
                            </p>
                        </motion.div>

                        {/* Step 3 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="group p-8 rounded-3xl bg-neutral-50/50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 hover:border-green-500/30 transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800/50"
                        >
                            <div className="h-12 w-12 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Settings className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                                <span className="text-xs font-mono px-2 py-1 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">03</span>
                                Manage
                            </h3>
                            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm">
                                Track ticket sales, check in attendees with our app, and analyze real-time insights to grow.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>



            <Footer />
        </div >
    )
}



const features = [
    {
        title: "Event Planning",
        description: "Streamline your event planning process with our intuitive tools.",
        header: <EventCardDemo />,
        icon: <Calendar className="h-4 w-4 text-neutral-500" />,
    },
    {
        title: "Attendee Management",
        description: "Keep track of all your attendees in one place.",
        header: <BookingTableDemo />,
        icon: <Users className="h-4 w-4 text-neutral-500" />,
    },
    {
        title: "Instant Analytics",
        description: "Real-time insights into your event performance.",
        header: <ActivityDemo />,
        icon: <Zap className="h-4 w-4 text-neutral-500" />,
    },

    {
        title: "Marketing Tools",
        description: "Promote your event to wider audiences effectively.",
        header: <SocialDemo />,
        icon: <BarChart3 className="h-4 w-4 text-neutral-500" />,
        comingSoon: true,
    },
    {
        title: "Venue Management",
        description: "Manage multiple event spaces and layouts seamlessly.",
        header: <VenueDemo />,
        icon: <Layout className="h-4 w-4 text-neutral-500" />,
    },
    {
        title: "Team Collaboration",
        description: "Invite team members and assign granular roles.",
        header: <TeamDemo />,
        icon: <UserPlus className="h-4 w-4 text-neutral-500" />,
    },
    {
        title: "Global Reach",
        description: "Connect with attendees from all around the world.",
        header: <GlobalDemo />,
        icon: <Globe className="h-4 w-4 text-neutral-500" />,
    },
    {
        title: "Custom Support",
        description: "24/7 support for all your event query needs.",
        header: <SupportDemo />,
        icon: <Zap className="h-4 w-4 text-neutral-500" />,
    },
];
