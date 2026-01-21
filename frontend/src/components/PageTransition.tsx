'use client'

import { motion, AnimatePresence } from 'motion/react'
import { easeOut } from 'motion'
import { usePathname } from 'next/navigation'
import { ReactNode, useEffect, useState, memo } from 'react'
import { usePerformance } from '@/lib/performance'

interface PageTransitionProps {
    children: ReactNode
}

const OptimizedPageTransition = memo(function PageTransition({ children }: PageTransitionProps) {
    const pathname = usePathname()
    const [isLoading, setIsLoading] = useState(false)
    const [prevPathname, setPrevPathname] = useState(pathname)
    const { startNavigation, endNavigation } = usePerformance()

    useEffect(() => {
        // Track navigation timing
        if (prevPathname !== pathname) {
            startNavigation(pathname)
            setIsLoading(true)
            const timer = setTimeout(() => {
                setIsLoading(false)
                endNavigation()
            }, 150)
            setPrevPathname(pathname)
            return () => clearTimeout(timer)
        }
    }, [pathname, prevPathname, startNavigation, endNavigation])

    // Simplified animation styles for better performance
    const getAnimationStyle = (path: string) => {
        // Use simpler animations for better performance
        return {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            transition: {
                duration: 0.15,
                ease: easeOut
            }
        }
    }

    const animationStyle = getAnimationStyle(pathname)

    return (
        <>
            {/* Simplified loading indicator */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        exit={{ opacity: 0, scaleX: 1 }}
                        transition={{ duration: 0.15 }}
                        className="fixed top-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 z-50 origin-left"
                    />
                )}
            </AnimatePresence>

            {/* Optimized page transition - removed mode="wait" for faster feel */}
            <AnimatePresence initial={false}>
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
        </>
    )
})

export default OptimizedPageTransition 