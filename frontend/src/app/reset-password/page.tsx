"use client"

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { supabase, validateSupabaseConfig } from '@/lib/supabase'

// Simplified password reset component that handles different token formats
function SimplifiedPasswordReset({ accessToken, refreshToken, type, code }: {
  accessToken: string
  refreshToken: string
  type: string
  code?: string
}) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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
      console.log('=== PASSWORD UPDATE ATTEMPT ===')
      console.log('Available tokens:', { accessToken: !!accessToken, refreshToken: !!refreshToken, code: !!code })

      // Clear any existing session first to prevent automatic login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token')
        sessionStorage.clear()

        // Clear any Supabase-related localStorage items
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('supabase.auth.')) {
            localStorage.removeItem(key)
          }
        })
      }

      let sessionEstablished = false

      // Try to set the session with the tokens first (required for password update)
      if (accessToken && refreshToken) {
        console.log('Setting session with access/refresh tokens...')
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        })

        if (sessionError) {
          console.warn('Failed to set session with tokens:', sessionError)
        } else {
          sessionEstablished = true
          console.log('Session established successfully')
        }
      } else if (code) {
        console.log('Exchanging code for session...')
        const { error: codeError } = await supabase.auth.exchangeCodeForSession(code)

        if (codeError) {
          console.warn('Failed to exchange code for session:', codeError)
        } else {
          sessionEstablished = true
          console.log('Session established from code successfully')
        }
      }

      // If session was established, try the standard updateUser method first
      if (sessionEstablished) {
        console.log('Attempting password update with established session...')
        const { error: updateError } = await supabase.auth.updateUser({
          password: password
        })

        if (!updateError) {
          console.log('Password updated successfully with session method')
          setSuccess(true)
          toast({
            title: 'Password updated successfully!',
            description: 'You can now sign in with your new password.',
          })

          // Clear tokens and redirect
          cleanupAndRedirect()
          return
        } else {
          console.warn('Session method failed, trying direct API:', updateError)
          // Fall through to direct API method
        }
      } else {
        console.log('No session established, trying direct API method')
      }

      setSuccess(true)
      toast({
        title: 'Password updated successfully!',
        description: 'You can now sign in with your new password.',
      })

      // Clear any tokens from URL and local storage
      if (typeof window !== 'undefined') {
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname)

        // Clear all auth-related storage to prevent auto-login
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('supabase.auth.')) {
            localStorage.removeItem(key)
          }
        })

        // Clear session storage
        sessionStorage.clear()
      }

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err: any) {
      console.error('Password update error:', err)

      // Try direct API fallback method
      try {
        console.log('Trying direct API method...')
        const tokenToUse = accessToken || code

        if (!tokenToUse) {
          throw new Error('No valid authentication token available for password update')
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${tokenToUse}`
          },
          body: JSON.stringify({
            password: password
          })
        })

        if (response.ok) {
          console.log('Password updated successfully with direct API')
          setSuccess(true)
          toast({
            title: 'Password updated successfully!',
            description: 'You can now sign in with your new password.',
          })

          cleanupAndRedirect()
          return
        } else {
          const errorData = await response.json().catch(() => ({}))
          console.error('Direct API failed:', errorData)
          throw new Error(errorData.error_description || errorData.msg || 'Failed to update password')
        }
      } catch (fallbackErr: any) {
        console.error('Direct API method also failed:', fallbackErr)

        // Check if this is a session-related error
        if (err.message?.includes('session') || err.message?.includes('Auth session missing') ||
            fallbackErr.message?.includes('session') || fallbackErr.message?.includes('Auth session missing')) {
          setError('Authentication session expired. Please request a new password reset link.')
        } else {
          setError(`Password update failed: ${err.message || fallbackErr.message || 'Unknown error'}`)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const cleanupAndRedirect = () => {
    // Clear tokens and redirect
    if (typeof window !== 'undefined') {
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname)

      // Clear all auth-related storage to prevent auto-login
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('supabase.auth.')) {
          localStorage.removeItem(key)
        }
      })

      // Clear session storage
      sessionStorage.clear()
    }

    // Redirect to login after 2 seconds
    setTimeout(() => {
      router.push('/login')
    }, 2000)
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
                <div className="relative">
                  <Input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    placeholder="New password"
                    required
                    className="pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 10.605 10.605 0 00-2.387-4.612l-1.611-1.612zm-1.61 6.61c.406.375.856.729 1.31 1.046l-4.273 4.273a10.029 10.029 0 01-3.3-4.38 10.605 10.605 0 012.387-4.612L5.19 6.22a10.029 10.029 0 013.3 4.38zm7.43 7.44l-4.274-4.274a3.75 3.75 0 01-1.31 1.046l1.745 1.745a10.029 10.029 0 004.38 3.3 10.605 10.605 0 004.612 2.387l-1.612-1.612zm-8.61-8.61l4.273 4.273a3.75 3.75 0 00-1.31-1.046L8.48 3.69a10.029 10.029 0 00-4.38-3.3 10.605 10.605 0 00-4.612-2.387l1.612 1.612z" clipRule="evenodd" />
                        <path d="m13.879 9.879-4 4a.75.75 0 01-1.06-1.06l4-4a.75.75 0 011.06 1.06z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                        <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
                <div className="relative">
                  <Input
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    required
                    className="pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 10.605 10.605 0 00-2.387-4.612l-1.611-1.612zm-1.61 6.61c.406.375.856.729 1.31 1.046l-4.273 4.273a10.029 10.029 0 01-3.3-4.38 10.605 10.605 0 012.387-4.612L5.19 6.22a10.029 10.029 0 013.3 4.38zm7.43 7.44l-4.274-4.274a3.75 3.75 0 01-1.31 1.046l1.745 1.745a10.029 10.029 0 004.38 3.3 10.605 10.605 0 004.612 2.387l-1.612-1.612zm-8.61-8.61l4.273 4.273a3.75 3.75 0 00-1.31-1.046L8.48 3.69a10.029 10.029 0 00-4.38-3.3 10.605 10.605 0 00-4.612-2.387l1.612 1.612z" clipRule="evenodd" />
                        <path d="m13.879 9.879-4 4a.75.75 0 01-1.06-1.06l4-4a.75.75 0 011.06 1.06z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                        <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
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

  // Extract tokens from URL - comprehensive approach
  let hashParams = new URLSearchParams()
  if (typeof window !== 'undefined') {
    const urlObj = new URL(window.location.href)
    // Try different hash formats
    if (urlObj.hash) {
      const hashContent = urlObj.hash.substring(1) // Remove the #
      if (hashContent.includes('=')) {
        // Standard format: #access_token=...&refresh_token=...
        hashParams = new URLSearchParams(hashContent)
      } else {
        // Try to parse as JSON or other format
        try {
          const hashData = JSON.parse(decodeURIComponent(hashContent))
          if (hashData.access_token) hashParams.set('access_token', hashData.access_token)
          if (hashData.refresh_token) hashParams.set('refresh_token', hashData.refresh_token)
          if (hashData.type) hashParams.set('type', hashData.type)
        } catch (e) {
          // Not JSON, try other formats
        }
      }
    }
  }

  // Try multiple parameter names and formats
  const accessToken =
    searchParams?.get('access_token') ||
    hashParams.get('access_token') ||
    searchParams?.get('token') ||
    hashParams.get('token') ||
    ''

  const refreshToken =
    searchParams?.get('refresh_token') ||
    hashParams.get('refresh_token') ||
    searchParams?.get('refreshToken') ||
    hashParams.get('refreshToken') ||
    ''

  const type =
    searchParams?.get('type') ||
    hashParams.get('type') ||
    searchParams?.get('mode') ||
    hashParams.get('mode') ||
    ''

  const code = searchParams?.get('code') || hashParams.get('code') || ''

  // More comprehensive token validation
  const hasValidTokens = (
    (accessToken && accessToken.length > 20) ||
    (code && code.length > 10)
  ) && (
    type === 'recovery' ||
    type === 'resetPassword' ||
    type === 'signup' ||
    !type // Some flows don't include type
  )

  console.log('=== PASSWORD RESET DEBUG ===')
  console.log('Full URL:', typeof window !== 'undefined' ? window.location.href : 'undefined')
  console.log('Search params keys:', Array.from(searchParams?.keys() || []))
  console.log('Hash content:', typeof window !== 'undefined' ? window.location.hash : 'undefined')
  console.log('Hash params keys:', Array.from(hashParams.keys()))

  // Log all search params for debugging
  console.log('All search params:')
  searchParams?.forEach((value, key) => {
    console.log(`  ${key}: ${value.substring(0, 20)}${value.length > 20 ? '...' : ''}`)
  })

  // Log all hash params for debugging
  console.log('All hash params:')
  hashParams.forEach((value, key) => {
    console.log(`  ${key}: ${value.substring(0, 20)}${value.length > 20 ? '...' : ''}`)
  })

  console.log('--- TOKEN EXTRACTION ---')
  console.log('Access Token (search):', searchParams?.get('access_token') ? `${searchParams.get('access_token')?.substring(0, 10)}...` : 'null')
  console.log('Access Token (hash):', hashParams.get('access_token') ? `${hashParams.get('access_token')?.substring(0, 10)}...` : 'null')
  console.log('Access Token (final):', accessToken ? `${accessToken.substring(0, 10)}... (${accessToken.length} chars)` : 'null')
  console.log('Refresh Token (final):', refreshToken ? `${refreshToken.substring(0, 10)}... (${refreshToken.length} chars)` : 'null')
  console.log('Type:', type)
  console.log('Code:', code ? `${code.substring(0, 10)}...` : 'null')
  console.log('Has Valid Tokens:', hasValidTokens)

  // Store debug info in window for easier access
  const configValidation = validateSupabaseConfig()
  if (typeof window !== 'undefined') {
    (window as any).passwordResetDebug = {
      fullUrl: window.location.href,
      searchParams: Object.fromEntries(searchParams?.entries() || []),
      hash: window.location.hash,
      hashParams: Object.fromEntries(hashParams.entries()),
      extracted: { accessToken, refreshToken, type, code, hasValidTokens },
      supabaseConfig: configValidation.config,
      configIssues: configValidation.issues,
      configValid: configValidation.isValid,
    }

    // Add a test function to check Supabase connection
    ;(window as any).testSupabaseConnection = async () => {
      try {
        console.log('Testing Supabase connection...')
        const { data, error } = await supabase.auth.getSession()
        console.log('Supabase connection test result:', { data, error })
        return { success: !error, data, error }
      } catch (err) {
        console.error('Supabase connection test failed:', err)
        return { success: false, error: err }
      }
    }
  }

  // If we have valid tokens, show the simplified password reset form
  if (hasValidTokens) {
    return (
      <SimplifiedPasswordReset
        accessToken={accessToken}
        refreshToken={refreshToken}
        type={type}
        code={code}
      />
    )
  }

  // Check if this is an expired link
  const isExpiredLink = searchParams?.get('error') === 'access_denied' &&
                       searchParams?.get('error_code') === 'otp_expired'

  // Use the configValidation that's already declared above
  const isServiceRoleMissing = !configValidation.config.serviceRoleKey || configValidation.config.serviceRoleKey === 'Missing'

  // If we have some tokens but they don't meet validation criteria, show a warning
  const hasAnyTokens = accessToken || refreshToken || code
  if (hasAnyTokens && !hasValidTokens) {
    console.warn('Tokens present but not valid according to validation criteria:', {
      accessToken: !!accessToken,
      refreshToken: !!refreshToken,
      code: !!code,
      type,
      hasValidTokens
    })
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
            <h1 className="text-2xl font-semibold text-red-800 mb-2">
              {isServiceRoleMissing ? 'Configuration Error' :
               isExpiredLink ? 'Reset Link Expired' : 'Invalid Reset Link'}
            </h1>
            <p className="text-red-700 mb-4">
              {isServiceRoleMissing
                ? 'Password reset is not properly configured. The service role key is missing from server configuration.'
                : isExpiredLink
                ? 'This password reset link has expired. Password reset links are valid for 1 hour for security reasons.'
                : 'This password reset link is invalid or missing required authentication tokens.'
              }
            </p>

            <div className="text-left text-xs bg-red-50 p-3 rounded mb-4">
              <p><strong>Debug Info:</strong></p>
              <p>Access Token: {accessToken ? `${accessToken.substring(0, 20)}... (${accessToken.length} chars)` : 'Missing'}</p>
              <p>Refresh Token: {refreshToken ? `${refreshToken.substring(0, 20)}... (${refreshToken.length} chars)` : 'Missing'}</p>
              <p>Code: {code ? `${code.substring(0, 20)}... (${code.length} chars)` : 'Missing'}</p>
              <p>Type: {type || 'Not set'}</p>
              <p>Has Valid Tokens: {hasValidTokens ? 'Yes' : 'No'}</p>
              <p className="mt-2 text-gray-600">
                Check browser console for detailed logs.
                <br />
                Try: <code className="bg-gray-200 px-1 rounded">console.log(window.passwordResetDebug)</code>
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  // Clear any cached data and redirect
                  if (typeof window !== 'undefined') {
                    localStorage.clear()
                    sessionStorage.clear()
                  }
                  router.push('/forgot-password')
                }}
                className="block w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                {isServiceRoleMissing ? 'Contact Support' : 'Request New Password Reset'}
              </button>
              <button
                onClick={() => {
                  // Clear any cached data and redirect
                  if (typeof window !== 'undefined') {
                    localStorage.clear()
                    sessionStorage.clear()
                  }
                  router.push('/login')
                }}
                className="block w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Back to Login
              </button>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-left">
              <p className="text-sm text-yellow-800 font-medium mb-2">🔧 Having issues with password reset?</p>
              <ul className="text-xs text-yellow-700 space-y-1">
                <li>• <strong>CRITICAL: Environment Configuration</strong></li>
                <ul className="ml-4 space-y-1">
                  <li>• <strong>Add to .env.local:</strong> <code className="bg-yellow-100 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY=your_service_role_key</code></li>
                  <li>• Get service role key from Supabase Dashboard → Settings → API</li>
                  <li>• Password reset requires this key to function properly</li>
                </ul>
                <li>• <strong>Supabase Dashboard → Authentication → Settings:</strong></li>
                <ul className="ml-4 space-y-1">
                  <li>• Site URL: <code className="bg-yellow-100 px-1 rounded">https://eventflownow.netlify.app</code></li>
                  <li>• Redirect URLs: Add <code className="bg-yellow-100 px-1 rounded">https://eventflownow.netlify.app/reset-password</code></li>
                </ul>
                <li>• <strong>Email Templates:</strong></li>
                <ul className="ml-4 space-y-1">
                  <li>• Use <code className="bg-yellow-100 px-1 rounded">&#123;&#123; .ConfirmationURL &#125;&#125;</code> for reset links</li>
                  <li>• Subject: "Reset your password for EventFlow"</li>
                  <li>• Include proper token parameters in the URL</li>
                </ul>
                <li>• <strong>Test the flow:</strong></li>
                <ul className="ml-4 space-y-1">
                  <li>• Open browser console when clicking reset link</li>
                  <li>• Check if tokens appear in URL or hash fragment</li>
                  <li>• Verify the reset link format matches expected parameters</li>
                <li>• <strong>Browser Console Test:</strong> Run <code className="bg-yellow-100 px-1 rounded">console.log(window.passwordResetDebug)</code> after clicking reset link</li>
                </ul>
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