'use client'

import { motion, AnimatePresence } from 'motion/react'
import { usePathname } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'

interface PageTransitionProps {
    children: ReactNode
}

export default function PageTransition({ children }: PageTransitionProps) {
    const pathname = usePathname()
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        setIsLoading(true)
        const timer = setTimeout(() => setIsLoading(false), 100)
        return () => clearTimeout(timer)
    }, [pathname])

    // Determine animation style based on page type
    const getAnimationStyle = (path: string) => {
        if (path === '/') {
            // Home page - slide up with fade
            return {
                initial: { opacity: 0, y: 30, scale: 0.95 },
                animate: { opacity: 1, y: 0, scale: 1 },
                exit: { opacity: 0, y: -30, scale: 0.95 },
                transition: { duration: 0.5 }
            }
        } else if (path.includes('/admin')) {
            // Admin pages - slide from right
            return {
                initial: { opacity: 0, x: 50, scale: 0.98 },
                animate: { opacity: 1, x: 0, scale: 1 },
                exit: { opacity: 0, x: -50, scale: 0.98 },
                transition: { duration: 0.4 }
            }
        } else if (path.includes('/customer')) {
            // Customer pages - slide from left
            return {
                initial: { opacity: 0, x: -50, scale: 0.98 },
                animate: { opacity: 1, x: 0, scale: 1 },
                exit: { opacity: 0, x: 50, scale: 0.98 },
                transition: { duration: 0.4 }
            }
        } else if (path.includes('/events')) {
            // Events pages - zoom in with fade
            return {
                initial: { opacity: 0, scale: 0.9, rotateY: -15 },
                animate: { opacity: 1, scale: 1, rotateY: 0 },
                exit: { opacity: 0, scale: 0.9, rotateY: 15 },
                transition: { duration: 0.5 }
            }
        } else if (path.includes('/login') || path.includes('/register')) {
            // Auth pages - fade with slight scale
            return {
                initial: { opacity: 0, scale: 0.95, y: 20 },
                animate: { opacity: 1, scale: 1, y: 0 },
                exit: { opacity: 0, scale: 0.95, y: -20 },
                transition: { duration: 0.6 }
            }
        } else {
            // Default - fade with slide up
            return {
                initial: { opacity: 0, y: 20, scale: 0.98 },
                animate: { opacity: 1, y: 0, scale: 1 },
                exit: { opacity: 0, y: -20, scale: 0.98 },
                transition: { duration: 0.4 }
            }
        }
    }

    const animationStyle = getAnimationStyle(pathname)

    return (
        <>
            {/* Loading indicator */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 z-50"
                        style={{
                            background: 'linear-gradient(90deg, #3B82F6, #8B5CF6, #EC4899)',
                            backgroundSize: '200% 100%',
                            animation: 'loading 1s ease-in-out infinite'
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Page transition */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={pathname}
                    initial={animationStyle.initial}
                    animate={animationStyle.animate}
                    exit={animationStyle.exit}
                    transition={animationStyle.transition}
                    className="min-h-screen"
                >
                    {children}
                </motion.div>
            </AnimatePresence>

            <style jsx>{`
                @keyframes loading {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
        </>
    )
} 