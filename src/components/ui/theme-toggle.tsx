'use client'

import { Moon, Sun } from 'lucide-react'
import { Button } from './button'
import { useTheme } from '@/contexts/ThemeContext'
import { motion } from 'motion/react'
import { useEffect } from 'react'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  // Debug: Log theme changes
  useEffect(() => {
    console.log('🎨 Theme changed to:', theme)
    console.log('🎨 HTML classes:', document.documentElement.className)
    console.log('🎨 Body classes:', document.body.className)
  }, [theme])

  const handleToggle = () => {
    console.log('🎯 Toggle clicked, current theme:', theme)
    toggleTheme()
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      className="relative h-9 w-9 rounded-full border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-all duration-200 shadow-sm hover:shadow-md"
    >
      <motion.div
        initial={false}
        animate={{
          scale: theme === 'light' ? 1 : 0,
          rotate: theme === 'light' ? 0 : 180,
          opacity: theme === 'light' ? 1 : 0,
        }}
        transition={{
          duration: 0.2,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Sun className="h-4 w-4 text-yellow-400 drop-shadow-sm" />
      </motion.div>

      <motion.div
        initial={false}
        animate={{
          scale: theme === 'dark' ? 1 : 0,
          rotate: theme === 'dark' ? 0 : -180,
          opacity: theme === 'dark' ? 1 : 0,
        }}
        transition={{
          duration: 0.2,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Moon className="h-4 w-4 text-blue-300 drop-shadow-sm" />
      </motion.div>

      <span className="sr-only">
        Toggle theme - Currently {theme} mode
      </span>
    </Button>
  )
}
