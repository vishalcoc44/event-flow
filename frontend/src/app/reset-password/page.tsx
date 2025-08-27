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
  const [debugMessage, setDebugMessage] = useState<string>('Initializing...')

  // Supabase sends access_token and refresh_token as query params for password reset
  const accessToken = searchParams?.get('access_token') || ''
  const refreshToken = searchParams?.get('refresh_token') || ''
  const type = searchParams?.get('type') || ''
  const mode = searchParams?.get('mode') || ''

  const handlePasswordReset = async () => {
    console.log('=== PASSWORD RESET DEBUG ===')
    console.log('Reset page params:', { accessToken: accessToken ? 'Present' : 'Missing', refreshToken: refreshToken ? 'Present' : 'Missing', type, mode })
    console.log('Current URL:', typeof window !== 'undefined' ? window.location.href : 'undefined')

    setDebugMessage('Starting password reset process...')

    // Check if this is a password reset flow
    if ((type === 'recovery' && accessToken && refreshToken) || (mode === 'reset' && accessToken)) {
      console.log('✅ Processing password reset flow')
      setDebugMessage('Detected password reset flow, setting up session...')

      try {
        // Store password reset mode in sessionStorage BEFORE setting session
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('passwordResetMode', 'true')
          sessionStorage.setItem('passwordResetTimestamp', Date.now().toString())
          console.log('🔧 Password reset mode set in sessionStorage')
          setDebugMessage('SessionStorage configured, calling Supabase...')
        }

        // Set the session using the tokens from the URL
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || ''
        })

        if (error) {
          console.error('❌ Error setting session:', error)
          setDebugMessage(`Session error: ${error.message}`)
          setError(`Session error: ${error.message}`)
          toast({
            title: 'Invalid link',
            description: 'This password reset link is invalid or expired.',
            variant: 'destructive'
          })
          return
        }

        console.log('✅ Session set successfully')
        setDebugMessage('Session setup complete, showing password form...')
        setSessionSet(true)
      } catch (err: any) {
        console.error('❌ Session error:', err)
        setDebugMessage(`Session setup failed: ${err?.message || 'Unknown error'}`)
        setError(`Session setup failed: ${err?.message || 'Unknown error'}`)
      }
    } else {
      console.log('❌ No valid reset tokens found')
      setDebugMessage('No valid reset tokens found')
      setError('Missing required parameters for password reset')
    }
  }

  useEffect(() => {
    // Only proceed if we have some parameters that suggest this is a reset attempt
    if (accessToken || refreshToken || type || mode === 'reset') {
      setTimeout(() => {
        handlePasswordReset()
      }, 100)
    } else {
      setDebugMessage('No reset parameters found')
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
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        setError(error.message || 'Failed to update password.')
        return
      }

      toast({ title: 'Password updated', description: 'You can now sign in with your new password.' })

      // Clear password reset mode flag
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('passwordResetMode')
        sessionStorage.removeItem('passwordResetTimestamp')
      }

      // Sign out and redirect to login
      await supabase.auth.signOut()
      router.push('/login')
    } catch (err: any) {
      setError(err?.message || 'Failed to reset password.')
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

              <div className="text-left text-xs bg-gray-50 p-3 rounded">
                <p><strong>Status:</strong> {debugMessage}</p>
                <p><strong>Debug Info:</strong></p>
                <p>Type: {type || 'Not set'}</p>
                <p>Mode: {mode || 'Not set'}</p>
                <p>Access Token: {accessToken ? 'Present' : 'Missing'}</p>
                <p>Refresh Token: {refreshToken ? 'Present' : 'Missing'}</p>
                <p>Session Set: {sessionSet ? 'Yes' : 'No'}</p>
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
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="New password"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
                <Input
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  type="password"
                  placeholder="Confirm password"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Saving...' : 'Save password'}
              </Button>
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
