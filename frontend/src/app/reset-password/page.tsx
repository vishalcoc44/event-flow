"use client"

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabase'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionSet, setSessionSet] = useState(false)
  const [isPasswordResetMode, setIsPasswordResetMode] = useState(false)

  // Supabase sends access_token and refresh_token as query params for password reset
  // Also check URL hash in case email client moved params there
  let accessToken = searchParams?.get('access_token') || ''
  let refreshToken = searchParams?.get('refresh_token') || ''
  let type = searchParams?.get('type') || ''
  let mode = searchParams?.get('mode') || ''

  // Fallback: Check URL hash if query params are empty (some email clients do this)
  if ((!accessToken || !refreshToken) && typeof window !== 'undefined') {
    const hash = window.location.hash.substring(1) // Remove the '#'
    if (hash) {
      console.log('Checking URL hash for params:', hash)
      const hashParams = new URLSearchParams(hash)
      accessToken = accessToken || hashParams.get('access_token') || ''
      refreshToken = refreshToken || hashParams.get('refresh_token') || ''
      type = type || hashParams.get('type') || ''
    }
  }

  useEffect(() => {
    // Cleanup function to clear password reset mode if user navigates away
    const cleanupPasswordResetMode = () => {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('passwordResetMode')
        sessionStorage.removeItem('passwordResetTimestamp')
      }
    }

    // Add cleanup on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', cleanupPasswordResetMode)
    }

    const handlePasswordReset = async () => {
      console.log('=== PASSWORD RESET DEBUG ===')
      console.log('Reset page params:', { accessToken: accessToken ? 'Present' : 'Missing', refreshToken: refreshToken ? 'Present' : 'Missing', type })
      console.log('All URL params:', Object.fromEntries(searchParams?.entries() || []))
      console.log('Current URL:', typeof window !== 'undefined' ? window.location.href : 'undefined')
      console.log('User agent:', typeof window !== 'undefined' ? window.navigator.userAgent : 'undefined')

      // Check if this is a password reset flow
      const isPasswordResetFlow = (type === 'recovery' && accessToken && refreshToken) ||
                                  (mode === 'reset' && (accessToken || type === 'recovery'))

      if (isPasswordResetFlow) {
        console.log('✅ Processing password reset flow:', { type, mode, hasAccessToken: !!accessToken, hasRefreshToken: !!refreshToken })
        setIsPasswordResetMode(true)

        try {
          // Store password reset mode in sessionStorage BEFORE setting session
          // This ensures AuthContext can detect it immediately
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('passwordResetMode', 'true')
            sessionStorage.setItem('passwordResetTimestamp', Date.now().toString())
            console.log('🔧 Password reset mode set in sessionStorage')
          }

          // Set the session using the tokens from the URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          if (error) {
            console.error('❌ Error setting session:', error)
            // Clear the password reset mode if session setup fails
            if (typeof window !== 'undefined') {
              sessionStorage.removeItem('passwordResetMode')
              sessionStorage.removeItem('passwordResetTimestamp')
            }
            setError(`Session error: ${error.message}`)
            toast({
              title: 'Invalid link',
              description: 'This password reset link is invalid or expired. Please request a new one.',
              variant: 'destructive'
            })
            setTimeout(() => router.push('/login'), 3000)
            return
          }

          console.log('✅ Session set successfully:', data)
          setSessionSet(true)
        } catch (err: any) {
          console.error('❌ Session error:', err)
          setError(`Session setup failed: ${err?.message || 'Unknown error'}`)
          toast({
            title: 'Invalid link',
            description: 'This password reset link is invalid or expired. Please request a new one.',
            variant: 'destructive'
          })
          setTimeout(() => router.push('/login'), 3000)
        }
      } else if (accessToken || (mode === 'reset' && type === 'recovery')) {
        console.log('⚠️  Processing password reset with access token or recovery type')
        setIsPasswordResetMode(true)

        // Fallback: if we only have access_token, try to set session with it
        try {
          // Store password reset mode in sessionStorage BEFORE setting session
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('passwordResetMode', 'true')
            sessionStorage.setItem('passwordResetTimestamp', Date.now().toString())
            console.log('🔧 Password reset mode set in sessionStorage (access token only)')
          }

          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          })

          if (error) {
            console.error('❌ Error setting session with access token only:', error)
            // Clear the password reset mode if session setup fails
            if (typeof window !== 'undefined') {
              sessionStorage.removeItem('passwordResetMode')
              sessionStorage.removeItem('passwordResetTimestamp')
            }
            setError(`Session error: ${error.message}`)
            toast({
              title: 'Invalid link',
              description: 'This password reset link is invalid or expired. Please request a new one.',
              variant: 'destructive'
            })
            setTimeout(() => router.push('/login'), 3000)
            return
          }

          console.log('✅ Session set successfully with access token:', data)
          setSessionSet(true)
        } catch (err: any) {
          console.error('❌ Session error with access token:', err)
          setError(`Session setup failed: ${err?.message || 'Unknown error'}`)
          toast({
            title: 'Invalid link',
            description: 'This password reset link is invalid or expired. Please request a new one.',
            variant: 'destructive'
          })
          setTimeout(() => router.push('/login'), 3000)
        }
      } else {
        // No valid reset tokens, show detailed debug info
        console.log('❌ No valid reset tokens found')
        console.log('Available params:', Object.fromEntries(searchParams?.entries() || []))
        console.log('Expected: type=recovery, access_token=<token>, refresh_token=<token>')

        const debugInfo = Object.fromEntries(searchParams?.entries() || [])
        setError(`Missing required parameters. Found: ${Object.keys(debugInfo).join(', ')}`)

        toast({
          title: 'Invalid reset link',
          description: 'This password reset link is missing required information. Please request a new password reset.',
          variant: 'destructive'
        })

        // Wait a bit to let user see the error, then redirect
        setTimeout(() => {
          router.push('/login')
        }, 5000)
      }
    }

    // Only proceed if we have some parameters that suggest this is a reset attempt
    const hasResetParams = accessToken || refreshToken || type || mode === 'reset'
    if (hasResetParams) {
      handlePasswordReset()
    } else {
      console.log('ℹ️  No reset parameters found, redirecting to login')
      router.push('/login')
    }

    // Cleanup
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', cleanupPasswordResetMode)
      }
    }
  }, [accessToken, refreshToken, type, mode, router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      // Now that we have the session set, we can use the Supabase client to update the password
      const { data, error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        setError(error.message || 'Failed to update password.')
        toast({ title: 'Reset failed', description: error.message || 'Failed to update password.', variant: 'destructive' })
        setLoading(false)
        return
      }

      // Success — password updated
      toast({ title: 'Password updated', description: 'You can now sign in with your new password.' })

      // Clear password reset mode flag
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('passwordResetMode')
        sessionStorage.removeItem('passwordResetTimestamp')
      }

      // Sign out the user so they can login with new password
      await supabase.auth.signOut()

      // Redirect to login
      router.push('/login')
    } catch (err: any) {
      console.error('Reset error:', err)
      setError(err?.message || 'Failed to reset password.')
      toast({ title: 'Error', description: err?.message || 'Failed to reset password.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  // Don't render the form until session is properly set
  if (!sessionSet) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-grow py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600 mb-4">Setting up password reset...</p>

              {/* Debug information */}
              <div className="text-left text-xs bg-gray-50 p-3 rounded">
                <p><strong>Debug Info:</strong></p>
                <p>Type: {type || 'Not set'}</p>
                <p>Access Token: {accessToken ? 'Present' : 'Missing'}</p>
                <p>Refresh Token: {refreshToken ? 'Present' : 'Missing'}</p>
                {error && <p className="text-red-600">Error: {error}</p>}
              </div>

              <button
                onClick={() => router.push('/login')}
                className="mt-4 text-sm text-primary hover:underline"
              >
                Return to Login
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow">
            <h1 className="text-2xl font-semibold mb-2">Set a new password</h1>
            <p className="text-gray-600 mb-4">Enter a strong new password for your account.</p>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
                <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="New password" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
                <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" placeholder="Confirm password" required />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Saving...' : 'Save password'}</Button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-t-[#6CDAEC] rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
