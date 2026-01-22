'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { Calendar, Users, Zap, Shield, BarChart3, Globe, Layout, UserPlus, Sparkles, Megaphone, Settings, CheckCircle2, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { GlassTile } from '@/components/ui/glass-tile'
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Spotlight } from "@/components/ui/spotlight";
import { GradientButton } from "@/components/ui/gradient-button";
import { ActivityDemo, BookingTableDemo, EventCardDemo, SocialDemo, SupportDemo, SecurityDemo, GlobalDemo, VenueDemo, TeamDemo } from '@/components/ui/feature-demos'

const StackingCard = ({ feature, index, total, progress }: { feature: any, index: number, total: number, progress: any }) => {
    const targetScale = 1 - ((total - index) * 0.05);
    const range = [index * (1 / total), (index + 1) * (1 / total)];
    const scale = useTransform(progress, range, [1, targetScale]);
    const opacity = useTransform(progress, range, [1, 0.8]);

    return (
        <div className="sticky top-[15vh] w-full flex items-center justify-center pb-20">
            <motion.div
                style={{
                    scale,
                    opacity,
                    top: `calc(15vh + ${index * 20}px)`,
                }}
                className="w-full max-w-5xl h-[600px] rounded-[48px] bg-white/80 dark:bg-neutral-900/80 backdrop-blur-3xl border border-white/20 dark:border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col md:flex-row p-8 md:p-12 gap-12"
            >
                <div className="flex-1 flex flex-col justify-center space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="h-16 w-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500"
                    >
                        {feature.icon}
                    </motion.div>
                    <div className="space-y-4">
                        <h3 className="text-4xl md:text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-neutral-950 to-neutral-500 dark:from-white dark:to-neutral-500">
                            {feature.title}
                        </h3>
                        <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 font-medium leading-tight max-w-md">
                            {feature.description}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-4">
                        {['Fast', 'Secure', 'Global'].map((tag, i) => (
                            <span key={i} className="px-4 py-2 rounded-full bg-neutral-100 dark:bg-white/5 text-xs font-bold uppercase tracking-widest text-neutral-500">
                                {tag}
                            </span>
                        ))}
                    </div>

                    <Button variant="link" className="w-fit p-0 h-auto text-blue-500 font-bold group">
                        Learn more <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
                    </Button>
                </div>

                <div className="flex-1 bg-neutral-100/50 dark:bg-black/50 rounded-[32px] border border-black/5 dark:border-white/5 relative overflow-hidden flex items-center justify-center p-8 group overflow-y-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10" />
                    <motion.div
                        whileHover={{ scale: 1.05, rotate: 2 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="relative z-10 w-full"
                    >
                        {feature.header}
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

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

    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end']
    });

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
                            className="text-7xl md:text-[12rem] font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-950 via-neutral-800 to-neutral-500 dark:from-white dark:via-neutral-200 dark:to-neutral-500 tracking-tighter mb-10 leading-[0.8]">
                            Elevate Every <br /> Experience.
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                            className="mt-6 font-medium text-lg md:text-2xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
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


            <section className="relative w-full max-w-7xl mx-auto px-4 md:px-8 py-32">
                <div className="text-center mb-32 h-[30vh] flex flex-col justify-center">
                    <motion.h2
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="text-5xl md:text-8xl font-black mb-8 tracking-tighter"
                    >
                        Tools Built <br /> For Performance.
                    </motion.h2>
                    <p className="text-xl md:text-2xl text-neutral-500 font-medium">Scroll to explore the ecosystem.</p>
                </div>

                <div ref={containerRef} className="relative">
                    {features.map((feature, idx) => (
                        <StackingCard
                            key={idx}
                            feature={feature}
                            index={idx}
                            total={features.length}
                            progress={scrollYProgress}
                        />
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
