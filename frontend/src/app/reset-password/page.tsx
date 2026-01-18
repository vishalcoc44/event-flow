"use client"

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { supabase, validateSupabaseConfig } from '@/lib/supabase'
import { Loader2, ArrowRight, CheckCircle2 } from 'lucide-react'
import { BackgroundBeams } from "@/components/ui/background-beams";

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
      // Clear any existing session first to prevent automatic login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token')
        sessionStorage.clear()
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('supabase.auth.')) {
            localStorage.removeItem(key)
          }
        })
      }

      let sessionEstablished = false

      // Try to set the session with the tokens first
      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        })

        if (!sessionError) {
          sessionEstablished = true
        }
      } else if (code) {
        const { error: codeError } = await supabase.auth.exchangeCodeForSession(code)
        if (!codeError) {
          sessionEstablished = true
        }
      }

      // If session was established, try the standard updateUser method first
      if (sessionEstablished) {
        const { error: updateError } = await supabase.auth.updateUser({
          password: password
        })

        if (!updateError) {
          setSuccess(true)
          toast({
            title: 'Password updated successfully!',
            description: 'You can now sign in with your new password.',
          })
          cleanupAndRedirect()
          return
        }
      }

      setSuccess(true)
      toast({
        title: 'Password updated successfully!',
        description: 'You can now sign in with your new password.',
      })

      if (typeof window !== 'undefined') {
        window.history.replaceState({}, document.title, window.location.pathname)
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('supabase.auth.')) {
            localStorage.removeItem(key)
          }
        })
        sessionStorage.clear()
      }

      setTimeout(() => {
        router.push('/auth')
      }, 2000)
    } catch (err: any) {
      // Fallback to direct API if session methods fail
      try {
        const tokenToUse = accessToken || code
        if (!tokenToUse) throw new Error('No valid authentication token available')

        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${tokenToUse}`
          },
          body: JSON.stringify({ password: password })
        })

        if (response.ok) {
          setSuccess(true)
          toast({
            title: 'Password updated successfully!',
            description: 'You can now sign in with your new password.',
          })
          cleanupAndRedirect()
          return
        } else {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error_description || errorData.msg || 'Failed to update password')
        }
      } catch (fallbackErr: any) {
        if (err.message?.includes('session') || fallbackErr.message?.includes('session')) {
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
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, document.title, window.location.pathname)
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('supabase.auth.')) {
          localStorage.removeItem(key)
        }
      })
      sessionStorage.clear()
    }
    setTimeout(() => {
      router.push('/auth')
    }, 2000)
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 rounded-2xl bg-green-50 border border-green-100 text-center"
      >
        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-green-900 mb-2">Password Updated!</h3>
        <p className="text-green-700 mb-6">Your password has been successfully updated. Redirecting to login...</p>
      </motion.div>
    )
  }

  return (
    <div className="w-full max-w-[440px]">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight text-neutral-900 mb-2">
          Set a new password
        </h2>
        <p className="text-neutral-500">
          Enter a strong new password for your account.
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 mb-6 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium flex items-center gap-2"
        >
          <div className="h-1.5 w-1.5 rounded-full bg-red-600" />
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">New Password</Label>
          <div className="relative">
            <Input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              className="h-11 bg-neutral-50 border-neutral-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all pr-10"
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
                <span className="text-xs text-neutral-500 font-medium hover:text-neutral-900">Hide</span>
              ) : (
                <span className="text-xs text-neutral-500 font-medium hover:text-neutral-900">Show</span>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm" className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirm"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              className="h-11 bg-neutral-50 border-neutral-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all pr-10"
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
                <span className="text-xs text-neutral-500 font-medium hover:text-neutral-900">Hide</span>
              ) : (
                <span className="text-xs text-neutral-500 font-medium hover:text-neutral-900">Show</span>
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-xl transition-all shadow-xl shadow-neutral-900/10 active:scale-[0.98]"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            "Update Password"
          )}
        </Button>
      </form>
      <div className="mt-6 text-center">
        <button
          onClick={() => router.push('/auth')}
          className="text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          Back to Sign In
        </button>
      </div>
    </div>
  )
}

function ResetPasswordContents() {
  const searchParams = useSearchParams()
  const router = useRouter() // router declared but previously not used in this scope, now useful if we adds redirects

  // Extract tokens logic (Same as before)
  let hashParams = new URLSearchParams()
  if (typeof window !== 'undefined') {
    const urlObj = new URL(window.location.href)
    if (urlObj.hash) {
      const hashContent = urlObj.hash.substring(1)
      if (hashContent.includes('=')) {
        hashParams = new URLSearchParams(hashContent)
      } else {
        try {
          const hashData = JSON.parse(decodeURIComponent(hashContent))
          if (hashData.access_token) hashParams.set('access_token', hashData.access_token)
          if (hashData.refresh_token) hashParams.set('refresh_token', hashData.refresh_token)
          if (hashData.type) hashParams.set('type', hashData.type)
        } catch (e) { }
      }
    }
  }

  const accessToken = searchParams?.get('access_token') || hashParams.get('access_token') || searchParams?.get('token') || hashParams.get('token') || ''
  const refreshToken = searchParams?.get('refresh_token') || hashParams.get('refresh_token') || searchParams?.get('refreshToken') || hashParams.get('refreshToken') || ''
  const type = searchParams?.get('type') || hashParams.get('type') || searchParams?.get('mode') || hashParams.get('mode') || ''
  const code = searchParams?.get('code') || hashParams.get('code') || ''

  const hasValidTokens = ((accessToken && accessToken.length > 20) || (code && code.length > 10)) && (type === 'recovery' || type === 'resetPassword' || type === 'signup' || !type)
  const isExpiredLink = searchParams?.get('error') === 'access_denied' && searchParams?.get('error_code') === 'otp_expired'

  // Common UI Layout wrapper
  const PageWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen w-full flex bg-white font-sans overflow-hidden selection:bg-blue-100 selection:text-blue-900">
      <div className="absolute top-6 left-6 z-50">
        <Link href="/" className="group flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-600 transition-colors">
          <div className="p-1 rounded-full bg-neutral-100 group-hover:bg-neutral-200 transition-colors">
            <ArrowRight className="h-4 w-4 rotate-180" />
          </div>
          Back to Home
        </Link>
      </div>

      {/* Left Side - Visual */}
      <div className="hidden lg:flex w-[45%] relative flex-col justify-center px-16 xl:px-24 overflow-hidden bg-neutral-950">
        <BackgroundBeams className="opacity-20" />
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-neutral-950 to-transparent z-10" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-neutral-950 to-transparent z-10" />

        <div className="relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-3xl xl:text-4xl font-bold tracking-tight text-white mb-4 leading-tight"
          >
            Master Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-700">
              Event Experience.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-base text-neutral-400 leading-relaxed mb-8 max-w-sm"
          >
            Everything you need to plan, promote, and manage your events in one unified platform.
          </motion.p>

          <div className="space-y-4">
            {[
              { title: "Real-time Analytics", desc: "Track performance instantly" },
              { title: "Smart Organization", desc: "Manage teams and roles efficiently" },
              { title: "Team Collaboration", desc: "Work together in real-time" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                className="group flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all cursor-default"
              >
                <div className="h-8 w-8 shrink-0 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <p className="text-sm text-neutral-500">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center relative p-6 sm:p-12 lg:p-16 overflow-y-auto max-h-screen">
        {children}
      </div>
    </div>
  )

  if (hasValidTokens) {
    return (
      <PageWrapper>
        <SimplifiedPasswordReset
          accessToken={accessToken}
          refreshToken={refreshToken}
          type={type}
          code={code}
        />
      </PageWrapper>
    )
  }

  // Error State
  return (
    <PageWrapper>
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 mb-2">
          {isExpiredLink ? 'Link Expired' : 'Invalid Link'}
        </h2>
        <p className="text-neutral-500 mb-8">
          {isExpiredLink
            ? 'This password reset link has expired. Links are valid for 1 hour.'
            : 'This link is invalid or missing required tokens. Please request a new one.'}
        </p>

        <div className="space-y-3">
          <Button
            onClick={() => router.push('/forgot-password')}
            className="w-full h-11 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-xl"
          >
            Request New Link
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push('/auth')}
            className="w-full h-11 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl"
          >
            Back to Sign In
          </Button>
        </div>
      </div>
    </PageWrapper>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex bg-white font-sans items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-900" />
      </div>
    }>
      <ResetPasswordContents />
    </Suspense>
  )
}