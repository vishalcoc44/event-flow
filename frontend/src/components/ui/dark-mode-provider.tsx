'use client'

import { useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

interface DarkModeProviderProps {
  children: React.ReactNode
}

export function DarkModeProvider({ children }: DarkModeProviderProps) {
  const { theme } = useTheme()

  useEffect(() => {
    // Ensure dark class is properly applied to document
    const root = document.documentElement

    if (theme === 'dark') {
      root.classList.add('dark')
      // Force background color to prevent flash
      document.body.style.backgroundColor = 'hsl(0 0% 0%)'
      document.body.style.color = 'hsl(0 0% 95%)'
    } else {
      root.classList.remove('dark')
      // Reset to light mode colors
      document.body.style.backgroundColor = ''
      document.body.style.color = ''
    }

    // Force repaint to ensure all elements update
    document.body.style.display = 'none'
    document.body.offsetHeight // Trigger reflow
    document.body.style.display = ''

    console.log('🌙 DarkModeProvider: Applied theme', theme)
    console.log('🌙 HTML classes:', root.className)
    console.log('🌙 Body background:', document.body.style.backgroundColor)
  }, [theme])

  return <>{children}</>
}

// Hook to check if dark mode is active
export function useIsDarkMode() {
  const { theme } = useTheme()
  return theme === 'dark'
}

// Component to conditionally render based on theme
export function DarkModeOnly({ children }: { children: React.ReactNode }) {
  const isDark = useIsDarkMode()
  return isDark ? <>{children}</> : null
}

export function LightModeOnly({ children }: { children: React.ReactNode }) {
  const isDark = useIsDarkMode()
  return !isDark ? <>{children}</> : null
}
