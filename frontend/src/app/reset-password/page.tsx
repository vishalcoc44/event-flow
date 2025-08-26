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

  // Supabase sends access_token and refresh_token as query params for password reset
  const accessToken = searchParams?.get('access_token') || ''
  const refreshToken = searchParams?.get('refresh_token') || ''
  const type = searchParams?.get('type') || ''

  useEffect(() => {
    const handlePasswordReset = async () => {
      console.log('Reset page params:', { accessToken, refreshToken, type })
      console.log('All URL params:', Object.fromEntries(searchParams?.entries() || []))
      console.log('Current URL:', typeof window !== 'undefined' ? window.location.href : 'undefined')
      
      // Check if this is a password reset flow
      if (type === 'recovery' && accessToken && refreshToken) {
        console.log('Processing password reset with recovery type and tokens')
        try {
          // Set the session using the tokens from the URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })
          
          if (error) {
            console.error('Error setting session:', error)
            toast({ title: 'Invalid link', description: 'This password reset link is invalid or expired.' })
            router.push('/login')
            return
          }
          
          console.log('Session set successfully:', data)
          setSessionSet(true)
        } catch (err) {
          console.error('Session error:', err)
          toast({ title: 'Invalid link', description: 'This password reset link is invalid or expired.' })
          router.push('/login')
        }
      } else if (accessToken) {
        console.log('Processing password reset with access token only')
        // Fallback: if we only have access_token, try to set session with it
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          })
          
          if (error) {
            console.error('Error setting session:', error)
            toast({ title: 'Invalid link', description: 'This password reset link is invalid or expired.' })
            router.push('/login')
            return
          }
          
          console.log('Session set successfully with access token:', data)
          setSessionSet(true)
        } catch (err) {
          console.error('Session error:', err)
          toast({ title: 'Invalid link', description: 'This password reset link is invalid or expired.' })
          router.push('/login')
        }
      } else {
        // No valid reset tokens, show debug info and redirect
        console.log('No valid reset tokens found. Available params:', Object.fromEntries(searchParams?.entries() || []))
        console.log('Expected: type=recovery, access_token=<token>, refresh_token=<token>')
        toast({ title: 'Invalid link', description: 'This password reset link is invalid or expired. Please request a new one.' })
        
        // Wait a bit to let user see the error, then redirect
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      }
    }

    if (accessToken || refreshToken || type) {
      handlePasswordReset()
    } else {
      console.log('No reset parameters found, redirecting to login')
      router.push('/login')
    }
  }, [accessToken, refreshToken, type, router, toast])

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
              <p className="text-gray-600">Setting up password reset...</p>
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
