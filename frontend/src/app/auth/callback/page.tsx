"use client"

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Auth callback - All URL params:', Object.fromEntries(searchParams?.entries() || []))
        console.log('Current URL:', typeof window !== 'undefined' ? window.location.href : 'undefined')

        const type = searchParams?.get('type')
        const accessToken = searchParams?.get('access_token')
        const refreshToken = searchParams?.get('refresh_token')
        const code = searchParams?.get('code')

        console.log('Auth callback params:', { type, accessToken: accessToken ? 'Present' : 'Missing', refreshToken: refreshToken ? 'Present' : 'Missing', code: code ? 'Present' : 'Missing' })

        // Handle different auth flows
        if (type === 'recovery' && accessToken && refreshToken) {
          // Password reset flow - redirect with tokens but don't create session
          console.log('Redirecting to password reset with tokens (no auto-login)')
          const resetUrl = new URL('/reset-password', window.location.origin)
          resetUrl.searchParams.set('type', type)
          resetUrl.searchParams.set('access_token', accessToken)
          resetUrl.searchParams.set('refresh_token', refreshToken)

          // Clear any existing session to prevent auto-login
          localStorage.removeItem('supabase.auth.token')
          sessionStorage.clear()

          window.location.href = resetUrl.toString()
          return
        } else if (code) {
          // Regular auth flow with code
          console.log('Processing auth code')
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          
          if (error) {
            console.error('Error exchanging code for session:', error)
            router.push('/login?error=auth_failed')
            return
          }
          
          console.log('Auth successful, redirecting to dashboard')
          // Redirect based on user role
          const user = data.user
          if (user?.user_metadata?.role === 'ADMIN') {
            router.push('/admin/dashboard')
          } else {
            router.push('/customer/dashboard')
          }
        } else {
          console.log('No valid auth parameters found, redirecting to login')
          router.push('/login')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        router.push('/login?error=callback_failed')
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-t-[#6CDAEC] rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Processing authentication...</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-t-[#6CDAEC] rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}
