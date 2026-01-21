'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowRight, CheckCircle2 } from 'lucide-react'
import { BackgroundBeams } from "@/components/ui/background-beams";
import { supabase } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [succeeded, setSucceeded] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        throw error
      }

      setSucceeded(true)
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-white font-sans overflow-hidden selection:bg-blue-100 selection:text-blue-900">
      <div className="absolute top-6 left-6 z-50">
        <Link href="/auth" className="group flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-600 transition-colors">
          <div className="p-1 rounded-full bg-neutral-100 group-hover:bg-neutral-200 transition-colors">
            <ArrowRight className="h-4 w-4 rotate-180" />
          </div>
          Back to Sign In
        </Link>
      </div>

      {/* Left Side - Visual */}
      <div className="hidden lg:flex w-[45%] relative flex-col justify-center px-16 xl:px-24 overflow-hidden bg-neutral-950">
        <BackgroundBeams className="opacity-20" />

        {/* Decorative gradients */}
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
        <div className="w-full max-w-[440px]">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 mb-2">
              Reset Password
            </h2>
            <p className="text-neutral-500">
              Enter your email and we'll send you a link to reset your password.
            </p>
          </div>

          {succeeded ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 rounded-2xl bg-green-50 border border-green-100 text-center"
            >
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">Check your email</h3>
              <p className="text-sm text-neutral-600 mb-6">
                We've sent a password reset link to <span className="font-medium text-neutral-900">{email}</span>
              </p>
              <Button
                variant="outline"
                className="w-full h-11 border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800"
                onClick={() => { setSucceeded(false); setEmail(''); }}
              >
                Send another link
              </Button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 bg-neutral-50 border-neutral-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium flex items-center gap-2"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-red-600" />
                  {error}
                </motion.div>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-xl transition-all shadow-xl shadow-neutral-900/10 active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
