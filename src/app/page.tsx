'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Spotlight } from "@/components/ui/spotlight";
import { GradientButton } from "@/components/ui/gradient-button";
import { motion } from "framer-motion";



import { Calendar, Users, Zap, Shield, BarChart3, Globe, Layout, UserPlus, Sparkles, Megaphone, Settings, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlassTile } from '@/components/ui/glass-tile'

import { ActivityDemo, BookingTableDemo, EventCardDemo, SocialDemo, SupportDemo, SecurityDemo, GlobalDemo, VenueDemo, TeamDemo } from '@/components/ui/feature-demos'

const FloatingAsset = ({ children, className, delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => (
    <motion.div
        initial={{ y: 0 }}
        animate={{
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1]
        }}
        transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay
        }}
        className={cn("absolute pointer-events-none z-20 opacity-40 blur-[1px] md:blur-none", className)}
    >
        {children}
    </motion.div>
)

export default function Home() {
    const { user, isLoading } = useAuth()
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY } = e
        const { innerWidth, innerHeight } = window
        setMousePosition({
            x: (clientX / innerWidth - 0.5) * 20,
            y: (clientY / innerHeight - 0.5) * 20
        })
    }

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
        <div
            onMouseMove={handleMouseMove}
            className="min-h-screen flex flex-col bg-background overflow-x-hidden relative w-full items-center rounded-md antialiased"
        >
            {/* Mesh Background */}
            <div className="fixed inset-0 z-[-1] opacity-30 dark:opacity-20 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-400/20 blur-[120px] animate-pulse delay-700" />
            </div>

            {/* Grainy overlay */}
            <div className="fixed inset-0 z-10 pointer-events-none opacity-[0.03] contrast-150 brightness-110" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

            <BackgroundBeams className="fixed inset-0 z-0 opacity-10" />

            <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />

            <div className="relative z-10 w-full pt-12 pb-20">
                <Spotlight
                    className="-top-40 left-0 md:left-60 md:-top-20 opacity-30 scale-150"
                    fill="#3b82f6"
                />

                <div className="max-w-7xl mx-auto relative z-20 w-full pt-16 md:pt-28 px-4 md:px-8 text-center">
                    {/* Floating Assets */}
                    <FloatingAsset className="top-10 left-[10%] md:left-[15%]">
                        <div className="w-16 h-16 md:w-24 md:h-24 bg-white/20 dark:bg-black/20 rounded-3xl border border-white/40 dark:border-white/10 backdrop-blur-2xl flex items-center justify-center shadow-2xl">
                            <Calendar className="w-8 h-8 md:w-12 md:h-12 text-blue-500" />
                        </div>
                    </FloatingAsset>

                    <FloatingAsset className="bottom-0 right-[10%] md:right-[15%]" delay={1}>
                        <div className="w-16 h-16 md:w-24 md:h-24 bg-white/20 dark:bg-black/20 rounded-3xl border border-white/40 dark:border-white/10 backdrop-blur-2xl flex items-center justify-center shadow-2xl">
                            <Zap className="w-8 h-8 md:w-12 md:h-12 text-purple-500" />
                        </div>
                    </FloatingAsset>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="perspective-1000"
                        >
                            <span className="inline-block px-4 py-1.5 mb-8 text-[10px] md:text-xs font-bold rounded-full bg-white/50 dark:bg-white/5 text-blue-600 dark:text-blue-400 border border-white/60 dark:border-white/10 backdrop-blur-md tracking-[0.2em] uppercase shadow-sm">
                                <Sparkles className="inline-block w-3 h-3 mr-2 -mt-1" />
                                Premium Event Management
                            </span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                            className="text-6xl md:text-[10rem] font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-950 via-neutral-800 to-neutral-500 dark:from-white dark:via-neutral-200 dark:to-neutral-500 tracking-tighter mb-10 leading-[0.85]">
                            Elevate Every <br /> Experience.
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                            className="mt-6 font-medium text-base md:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
                            The personal management platform for organizers <br className="hidden md:block" /> who value clarity, speed, and premium aesthetics.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                            className="mt-14 flex flex-col md:flex-row gap-8 justify-center items-center">
                            <Link href="/auth">
                                <motion.div
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="relative group"
                                >
                                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500" />
                                    <GradientButton variant="primary" size="lg" className="min-w-[220px] h-16 text-xl rounded-full px-10 relative bg-neutral-950 text-white font-bold" containerClassName="rounded-full">
                                        Get Started Free
                                    </GradientButton>
                                </motion.div>
                            </Link>
                            <Link href="/events">
                                <motion.div
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <GradientButton variant="outline" size="lg" className="min-w-[220px] h-16 text-xl bg-white/40 dark:bg-white/5 border-white/60 dark:border-white/10 text-neutral-900 dark:text-white hover:bg-white/60 dark:hover:bg-white/10 rounded-full px-10 backdrop-blur-xl font-bold" containerClassName="rounded-full">
                                        Browse Events
                                    </GradientButton>
                                </motion.div>
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </div>


            <section className="py-32 w-full max-w-7xl mx-auto px-4 md:px-8">
                <div className="text-center mb-24">
                    <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Powerful Tools. Seamless Flow.</h2>
                    <p className="text-neutral-500 dark:text-neutral-400 text-lg md:text-xl font-medium">Everything you need to orchestrate unforgettable events.</p>
                </div>

                <div className="grid grid-cols-1 gap-12">
                    {features.map((feature, idx) => (
                        <div key={idx} className="group">
                            <GlassTile
                                className={cn(
                                    "w-full flex flex-col gap-12 items-center min-h-[350px] max-w-5xl mx-auto",
                                    idx % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"
                                )}
                                interactive={false}
                                hoverScale={1}
                            >
                                <div className="flex-1 space-y-6">
                                    <motion.div
                                        initial={{ opacity: 0, x: idx % 2 === 1 ? 20 : -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        className="h-12 w-12 rounded-2xl bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 shadow-xl flex items-center justify-center"
                                    >
                                        {feature.icon}
                                    </motion.div>
                                    <div className="space-y-4">
                                        <h3 className="text-3xl md:text-5xl font-bold tracking-tight flex items-center gap-4">
                                            {feature.title}
                                            {feature.comingSoon && (
                                                <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 uppercase tracking-widest">
                                                    Beta
                                                </span>
                                            )}
                                        </h3>
                                        <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-md font-medium">
                                            {feature.description}
                                        </p>
                                    </div>
                                    <ul className="space-y-3">
                                        {['Lightning fast', 'Intuitive UI', 'Scalable'].map((item, i) => (
                                            <li key={i} className="flex items-center gap-3 text-sm font-semibold text-neutral-500">
                                                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="flex-1 w-full bg-white/20 dark:bg-black/20 rounded-2xl border border-white/40 dark:border-white/10 overflow-hidden relative min-h-[350px] flex items-center justify-center p-8 group-hover:bg-white/40 dark:group-hover:bg-black/40 transition-colors duration-500">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-50" />
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.5 }}
                                        className="relative z-10 w-full"
                                    >
                                        {feature.header}
                                    </motion.div>
                                </div>
                            </GlassTile>
                        </div>
                    ))}
                </div>
            </section>

            <section className="py-32 w-full bg-neutral-50/30 dark:bg-neutral-900/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[150px] -z-10" />

                <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">The Three-Step Flow.</h2>
                        <p className="text-neutral-500 dark:text-neutral-400 text-lg md:text-xl font-medium">Streamlined from inception to execution.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {steps.map((step, idx) => (
                            <GlassTile key={idx} className="p-10 group" delay={idx * 0.1}>
                                <div className="h-16 w-16 rounded-3xl bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-2xl">
                                    {step.icon}
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-bold flex items-center gap-3">
                                        <span className="text-[10px] font-bold px-2 py-1 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-mono">0{idx + 1}</span>
                                        {step.title}
                                    </h3>
                                    <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium">
                                        {step.description}
                                    </p>
                                </div>
                            </GlassTile>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-32 w-full px-4 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-600/5 backdrop-blur-[100px] -z-10" />
                <GlassTile
                    className="max-w-4xl mx-auto p-20 flex flex-col items-center gap-10"
                    interactive={false}
                >
                    <h2 className="text-4xl md:text-7xl font-bold tracking-tighter">Ready to redefine <br className="hidden md:block" /> your events?</h2>
                    <p className="text-xl md:text-2xl text-neutral-500 font-medium max-w-xl">Join the elite community of organizers building high-impact experiences.</p>
                    <div className="flex flex-col md:flex-row gap-6">
                        <GradientButton size="lg" className="rounded-full h-16 px-12 text-xl font-bold">Start Your Journey</GradientButton>
                        <Button variant="ghost" className="rounded-full h-16 px-12 text-xl font-bold">Contact Sales</Button>
                    </div>
                </GlassTile>
            </section>

            <Footer />
        </div >
    )
}

const steps = [
    {
        title: "Create",
        description: "Design stunning event pages with our drag-and-drop builder. No coding required—just pure creativity.",
        icon: <Sparkles className="h-8 w-8 text-blue-500" />,
    },
    {
        title: "Promote",
        description: "Reach your audience instantly with built-in social tools, email campaigns, and automated invites.",
        icon: <Megaphone className="h-8 w-8 text-purple-500" />,
    },
    {
        title: "Manage",
        description: "Track ticket sales, check in attendees with our app, and analyze real-time insights to grow.",
        icon: <Settings className="h-8 w-8 text-green-500" />,
    },
];

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
