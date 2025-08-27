"use client"

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { HoverShadowEffect } from '@/components/ui/hover-shadow-effect'
import { supabase } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Call Supabase to send a password reset email, include redirectTo so user lands on our reset page
      const redirectTo = `${window.location.origin}/reset-password`
      console.log('Sending password reset email to:', email)
      console.log('Redirect URL:', redirectTo)
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.log('Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

      // Supabase v2 method
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      })

      if (error) {
        console.error('Password reset error:', error)
        setError(error.message || 'Unable to send reset email. Please try again.')
        toast({
          title: 'Reset failed',
          description: error.message || 'Unable to send reset email',
          variant: 'destructive'
        })
      } else {
        console.log('Password reset email sent successfully:', data)
        toast({
          title: 'Email sent',
          description: 'If that email exists, a password reset link was sent. Please check your email (including spam folder). Note: You may need to configure Supabase Auth email templates for the reset link to work properly.',
          duration: 8000
        })
      }
    } catch (err: any) {
      console.error('Forgot password error:', err)
      const msg = err?.message || 'Failed to send password reset email.'
      setError(msg)
      toast({ title: 'Error', description: msg, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row rounded-lg overflow-hidden shadow-lg max-w-4xl mx-auto">
            <div className="md:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#6BDFEF] to-[#8FE9F5] hidden md:block">
              <div className="relative z-10 h-full flex items-center justify-center p-8 pointer-events-none">
                <div className="text-center text-white pointer-events-none">
                  <h2 className="text-4xl md:text-5xl font-bold mb-4">Reset your password</h2>
                  <p className="text-lg text-white/90 max-w-md mx-auto leading-relaxed">Enter the email associated with your account and we'll send a secure link to reset your password.</p>
                </div>
              </div>
            </div>

            <div className="md:w-1/2 bg-white p-8 md:p-12">
              <div className="max-w-md mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot password</h1>
                <p className="text-gray-600 mb-4">No worries — we'll send a link to reset it.</p>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-6">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> Password reset emails require Supabase Auth configuration.
                    Make sure email templates are enabled in your Supabase dashboard.
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </div>
                      <Input id="email" name="email" type="email" placeholder="your.email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required disabled={loading} />
                    </div>
                  </div>

                  <HoverShadowEffect className="w-full cursor-pointer" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.15} hoverScale={1.02} hoverLift={-1} transitionDuration={150}>
                    <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Sending...' : 'Send reset link'}</Button>
                  </HoverShadowEffect>

                  <div className="text-center">
                    <p className="text-sm text-gray-600">Remembered your password? <Link href="/login" className="text-primary font-medium hover:underline">Sign in</Link></p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
