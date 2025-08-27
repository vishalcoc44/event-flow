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
  // Also check for fragment parameters (sometimes Supabase uses hash)
  const url = typeof window !== 'undefined' ? window.location.href : ''
  const urlObj = typeof window !== 'undefined' ? new URL(url) : null
  const hashParams = urlObj?.hash ? new URLSearchParams(urlObj.hash.substring(1)) : new URLSearchParams()

  let accessToken = searchParams?.get('access_token') || hashParams.get('access_token') || ''
  let refreshToken = searchParams?.get('refresh_token') || hashParams.get('refresh_token') || ''
  let type = searchParams?.get('type') || hashParams.get('type') || ''
  const mode = searchParams?.get('mode') || ''

  console.log('=== RESET PAGE PARAMS DEBUG ===')
  console.log('Full URL:', url)
  console.log('Query params:', Object.fromEntries(searchParams?.entries() || []))
  console.log('Hash params:', Object.fromEntries(hashParams.entries()))
  console.log('Access Token length:', accessToken?.length || 0)
  console.log('Refresh Token length:', refreshToken?.length || 0)
  console.log('Type:', type)
  console.log('Mode:', mode)

  // Check if we have the minimum required parameters
  const hasValidTokens = accessToken && accessToken.length > 10 && type === 'recovery'

  // If no valid tokens but we have a mode=reset, show Supabase configuration message
  const needsSupabaseSetup = mode === 'reset' && !hasValidTokens

  console.log('Token validation:', {
    hasAccessToken: !!accessToken,
    accessTokenLength: accessToken?.length || 0,
    hasRefreshToken: !!refreshToken,
    refreshTokenLength: refreshToken?.length || 0,
    hasType: !!type,
    correctType: type === 'recovery',
    hasValidTokens
  })

  const handlePasswordReset = async () => {
    console.log('=== PASSWORD RESET DEBUG ===')
    console.log('Reset page params:', { accessToken: accessToken ? 'Present' : 'Missing', refreshToken: refreshToken ? 'Present' : 'Missing', type, mode })
    console.log('Current URL:', typeof window !== 'undefined' ? window.location.href : 'undefined')
    console.log('Has valid tokens:', hasValidTokens)

    setDebugMessage('Starting password reset process...')

    // Check if this is a password reset flow
    if (hasValidTokens) {
      console.log('✅ Processing password reset flow - valid tokens found')
      setDebugMessage('Valid tokens detected, setting up session...')

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
      console.log('Missing requirements:', {
        hasAccessToken: !!accessToken,
        accessTokenLength: accessToken?.length || 0,
        hasType: !!type,
        correctType: type === 'recovery'
      })
      setDebugMessage('No valid reset tokens found - check email link')
      setError('Missing required parameters for password reset. Please request a new password reset link.')
    }
  }

  useEffect(() => {
    // Only proceed if we have valid tokens or at least some reset parameters
    if (hasValidTokens || accessToken || refreshToken || type || mode === 'reset') {
      console.log('🔄 Starting password reset process...')

      if (needsSupabaseSetup) {
        console.log('⚠️ Supabase setup needed')
        setDebugMessage('Supabase configuration needed - check email templates and SMTP settings')
        setError('Password reset emails are not properly configured. Please check your Supabase Auth settings.')
      } else {
        setTimeout(() => {
          handlePasswordReset()
        }, 100)
      }
    } else {
      console.log('ℹ️ No reset parameters found')
      setDebugMessage('No reset parameters found - please request a new password reset link')
    }
  }, [hasValidTokens, accessToken, refreshToken, type, mode, router, toast, needsSupabaseSetup])

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
                <p>Full URL: <code className="bg-gray-200 px-1 rounded text-xs">{url}</code></p>
                <p>Type: {type || 'Not set'}</p>
                <p>Mode: {mode || 'Not set'}</p>
                <p>Access Token: {accessToken ? `${accessToken.substring(0, 20)}... (${accessToken.length} chars)` : 'Missing'}</p>
                <p>Refresh Token: {refreshToken ? `${refreshToken.substring(0, 20)}... (${refreshToken.length} chars)` : 'Missing'}</p>
                <p>Has Valid Tokens: {hasValidTokens ? 'Yes' : 'No'}</p>
                <p>Needs Supabase Setup: {needsSupabaseSetup ? 'Yes' : 'No'}</p>
                <p>Session Set: {sessionSet ? 'Yes' : 'No'}</p>
                {error && <p className="text-red-600">Error: {error}</p>}
                {needsSupabaseSetup && (
                  <div className="mt-2 p-2 bg-yellow-100 text-yellow-800 rounded">
                    <strong>Supabase Configuration Required:</strong>
                    <ul className="mt-1 list-disc list-inside text-xs">
                      <li>Go to Supabase Dashboard → Authentication → Email Templates</li>
                      <li>Enable password reset email template (should use {{ "{{ .ConfirmationURL }}" }})</li>
                      <li>Configure SMTP settings or enable Supabase email service</li>
                      <li>Verify Site URL matches your deployment domain</li>
                      <li>The template should automatically include access_token, refresh_token, and type=recovery</li>
                    </ul>
                  </div>
                )}
                {!hasValidTokens && !needsSupabaseSetup && (
                  <div className="mt-2 p-2 bg-red-100 text-red-800 rounded">
                    <strong>Invalid Reset Link:</strong>
                    <ul className="mt-1 list-disc list-inside text-xs">
                      <li>The reset link is missing required authentication tokens</li>
                      <li>Try requesting a new password reset</li>
                      <li>Check that your Supabase email template is working correctly</li>
                    </ul>
                  </div>
                )}
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
