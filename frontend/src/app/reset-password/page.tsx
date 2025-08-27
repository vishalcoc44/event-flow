"use client"

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabase'

// Simplified password reset component that bypasses session setup
function SimplifiedPasswordReset({ accessToken, refreshToken, type }: {
  accessToken: string
  refreshToken: string
  type: string
}) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

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
      // Try direct password update with the access token
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          password: password
        })
      })

      if (response.ok) {
        setSuccess(true)
        toast({
          title: 'Password updated successfully!',
          description: 'You can now sign in with your new password.',
        })

        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error_description || 'Failed to update password')
      }
    } catch (err: any) {
      console.error('Password update error:', err)
      setError(err.message || 'Failed to update password. Please try again.')

      // If direct method fails, try with Supabase client
      try {
        console.log('Trying Supabase client method...')
        const { error: supabaseError } = await supabase.auth.updateUser({
          password: password
        })

        if (supabaseError) {
          throw supabaseError
        }

        setSuccess(true)
        toast({
          title: 'Password updated successfully!',
          description: 'You can now sign in with your new password.',
        })

        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } catch (supabaseErr: any) {
        console.error('Supabase method also failed:', supabaseErr)
        setError(`Both methods failed: ${supabaseErr.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-grow py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto bg-green-50 p-8 rounded-lg shadow text-center border border-green-200">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-green-800 mb-2">Password Updated!</h1>
              <p className="text-green-700 mb-4">Your password has been successfully updated.</p>
              <p className="text-sm text-green-600">Redirecting to login page...</p>
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
                {loading ? 'Updating...' : 'Update password'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => router.push('/login')}
                className="text-sm text-gray-600 hover:underline"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  // Extract tokens from URL
  let hashParams = new URLSearchParams()
  if (typeof window !== 'undefined') {
    const urlObj = new URL(window.location.href)
    hashParams = urlObj.hash ? new URLSearchParams(urlObj.hash.substring(1)) : new URLSearchParams()
  }

  const accessToken = searchParams?.get('access_token') || hashParams.get('access_token') || ''
  const refreshToken = searchParams?.get('refresh_token') || hashParams.get('refresh_token') || ''
  const type = searchParams?.get('type') || hashParams.get('type') || ''
  const mode = searchParams?.get('mode') || ''

  // Check if we have valid tokens
  const hasValidTokens = accessToken && accessToken.length > 10 && type === 'recovery'

  console.log('=== PASSWORD RESET DEBUG ===')
  console.log('Full URL:', typeof window !== 'undefined' ? window.location.href : 'undefined')
  console.log('Access Token length:', accessToken?.length || 0)
  console.log('Refresh Token length:', refreshToken?.length || 0)
  console.log('Type:', type)
  console.log('Mode:', mode)
  console.log('Has Valid Tokens:', hasValidTokens)

  // If we have valid tokens, show the simplified password reset form
  if (hasValidTokens) {
    return (
      <SimplifiedPasswordReset
        accessToken={accessToken}
        refreshToken={refreshToken}
        type={type}
      />
    )
  }

  // If no valid tokens, show error message with instructions
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-red-800 mb-2">Invalid Reset Link</h1>
            <p className="text-red-700 mb-4">This password reset link is invalid or missing required authentication tokens.</p>

            <div className="text-left text-xs bg-red-50 p-3 rounded mb-4">
              <p><strong>Debug Info:</strong></p>
              <p>Access Token: {accessToken ? `${accessToken.substring(0, 20)}... (${accessToken.length} chars)` : 'Missing'}</p>
              <p>Refresh Token: {refreshToken ? `${refreshToken.substring(0, 20)}... (${refreshToken.length} chars)` : 'Missing'}</p>
              <p>Type: {type || 'Not set'}</p>
              <p>Has Valid Tokens: {hasValidTokens ? 'Yes' : 'No'}</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/forgot-password')}
                className="block w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Request New Password Reset
              </button>
              <button
                onClick={() => router.push('/login')}
                className="block w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Back to Login
              </button>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-left">
              <p className="text-sm text-yellow-800 font-medium mb-2">🔧 Having issues with password reset?</p>
              <ul className="text-xs text-yellow-700 space-y-1">
                <li>• Check that your Supabase Site URL is set to: <code className="bg-yellow-100 px-1 rounded">https://eventflownow.netlify.app</code></li>
                <li>• Verify redirect URLs include the reset-password path</li>
                <li>• Ensure email templates use <code className="bg-yellow-100 px-1 rounded">&#123;&#123; .ConfirmationURL &#125;&#125;</code></li>
              </ul>
            </div>
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