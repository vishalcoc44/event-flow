'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Loader2, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'
import { BackgroundBeams } from "@/components/ui/background-beams";

export default function AuthPage() {
	const [isLogin, setIsLogin] = useState(true)
	const { login, register, isLoading } = useAuth()

	// Detailed form state 
	const [isAdmin, setIsAdmin] = useState(false)
	const [formData, setFormData] = useState({
		email: '',
		password: '',
		firstName: '',
		lastName: '',
		username: '',
		contactNumber: '',
		streetAddress: '',
		city: '',
		pincode: '',
		reason: ''
	})

	const [isSubmitted, setIsSubmitted] = useState(false)
	const [error, setError] = useState('')

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')

		try {
			if (isLogin) {
				await login(formData.email, formData.password)
			} else {
				const result = await register({
					email: formData.email,
					password: formData.password,
					firstName: formData.firstName,
					lastName: formData.lastName,
					username: formData.username,
					contactNumber: formData.contactNumber,
					streetAddress: formData.streetAddress,
					city: formData.city,
					pincode: formData.pincode,
					isAdminRequest: isAdmin
				})

				if (result === 'PENDING' && isAdmin) {
					setIsSubmitted(true)
				}
			}
		} catch (err: any) {
			setError(err.message || 'Authentication failed')
		}
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setFormData({ ...formData, [e.target.id]: e.target.value })
	}

	return (
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
				<div className="w-full max-w-[440px] mt-12 mb-12">
					<AnimatePresence mode="wait">
						{isSubmitted ? (
							<motion.div
								key="success"
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								className="text-center"
							>
								<div className="mb-6 flex justify-center">
									<div className="h-20 w-20 rounded-full bg-blue-50 flex items-center justify-center">
										<Sparkles className="h-10 w-10 text-blue-600" />
									</div>
								</div>
								<h2 className="text-3xl font-bold tracking-tight text-neutral-900 mb-4">
									Request Received!
								</h2>
								<p className="text-neutral-500 mb-8 leading-relaxed">
									Your request for admin access has been submitted successfully.
									Our team will review your application and you'll receive a notification
									once your account is approved.
								</p>
								<div className="space-y-4">
									<Button
										onClick={() => {
											setIsSubmitted(false)
											setIsLogin(true)
										}}
										className="w-full h-12 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-xl transition-all"
									>
										Back to Login
									</Button>
									<p className="text-sm text-neutral-400">
										Please wait for the approval email before attempting to login.
									</p>
								</div>
							</motion.div>
						) : (
							<motion.div
								key="form"
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -20 }}
							>
								<div className="text-center mb-10">
									<h2 className="text-3xl font-bold tracking-tight text-neutral-900 mb-2">
										{isLogin ? "Welcome back" : "Create your account"}
									</h2>
									<p className="text-neutral-500">
										{isLogin ? "Enter your details to access your workspace." : "Start managing your events for free."}
									</p>
								</div>

								<form onSubmit={handleSubmit} className="space-y-5">
									<div className="space-y-4">
										{/* Animate form fields */}
										<AnimatePresence mode="popLayout" initial={false}>
											{!isLogin && (
												<motion.div
													initial={{ opacity: 0, height: 0 }}
													animate={{ opacity: 1, height: 'auto' }}
													exit={{ opacity: 0, height: 0 }}
													className="space-y-4 overflow-hidden"
												>
													<div className="grid grid-cols-2 gap-4">
														<div className="space-y-1.5">
															<Label htmlFor="firstName" className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">First Name</Label>
															<Input id="firstName" placeholder="John" value={formData.firstName} onChange={handleChange} className="h-11 bg-neutral-50 border-neutral-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
														</div>
														<div className="space-y-1.5">
															<Label htmlFor="lastName" className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Last Name</Label>
															<Input id="lastName" placeholder="Doe" value={formData.lastName} onChange={handleChange} className="h-11 bg-neutral-50 border-neutral-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
														</div>
													</div>

													<div className="space-y-1.5">
														<Label htmlFor="username" className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Username</Label>
														<Input id="username" placeholder="johndoe123" value={formData.username} onChange={handleChange} className="h-11 bg-neutral-50 border-neutral-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
													</div>

													<div className="space-y-1.5">
														<Label htmlFor="contactNumber" className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Mobile</Label>
														<Input id="contactNumber" type="tel" placeholder="+1 234 567 8900" value={formData.contactNumber} onChange={handleChange} className="h-11 bg-neutral-50 border-neutral-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
													</div>

													<div className="space-y-1.5">
														<Label htmlFor="streetAddress" className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Address</Label>
														<Input id="streetAddress" placeholder="123 Main St" value={formData.streetAddress} onChange={handleChange} className="h-11 bg-neutral-50 border-neutral-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
													</div>

													<div className="grid grid-cols-2 gap-4">
														<div className="space-y-1.5">
															<Label htmlFor="city" className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">City</Label>
															<Input id="city" placeholder="New York" value={formData.city} onChange={handleChange} className="h-11 bg-neutral-50 border-neutral-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
														</div>
														<div className="space-y-1.5">
															<Label htmlFor="pincode" className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Zip Code</Label>
															<Input id="pincode" placeholder="10001" value={formData.pincode} onChange={handleChange} className="h-11 bg-neutral-50 border-neutral-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
														</div>
													</div>

													<div className="flex items-center space-x-2 py-2">
														<input
															type="checkbox"
															id="isAdmin"
															checked={isAdmin}
															onChange={(e) => setIsAdmin(e.target.checked)}
															className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
														/>
														<Label htmlFor="isAdmin" className="text-sm font-medium text-neutral-700 cursor-pointer">Register as Admin</Label>
													</div>

													{isAdmin && (
														<motion.div
															initial={{ opacity: 0, scale: 0.95 }}
															animate={{ opacity: 1, scale: 1 }}
															className="space-y-1.5"
														>
															<Label htmlFor="reason" className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Reason for Admin Access</Label>
															<textarea
																id="reason"
																placeholder="Why do you need admin privileges?"
																value={formData.reason}
																onChange={handleChange}
																className="w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[80px]"
															/>
														</motion.div>
													)}

													<div className="h-px w-full bg-neutral-100 my-6" />
												</motion.div>
											)}
										</AnimatePresence>

										<div className="space-y-1.5">
											<Label htmlFor="email" className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Email Address</Label>
											<Input
												id="email"
												type="email"
												placeholder="name@company.com"
												value={formData.email}
												onChange={handleChange}
												required
												className="h-11 bg-neutral-50 border-neutral-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
											/>
										</div>

										<div className="space-y-1.5">
											<div className="flex items-center justify-between">
												<Label htmlFor="password" className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Password</Label>
												{isLogin && <Link href="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 font-medium">Forgot password?</Link>}
											</div>
											<Input
												id="password"
												type="password"
												placeholder="••••••••"
												value={formData.password}
												onChange={handleChange}
												required
												className="h-11 bg-neutral-50 border-neutral-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
											/>
										</div>
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
											isLogin ? "Sign In" : "Create Account"
										)}
									</Button>

									<p className="text-center text-sm text-neutral-500 mt-6">
										{isLogin ? "New to the platform?" : "Already have an account?"}{" "}
										<button
											type="button"
											onClick={() => {
												setIsLogin(!isLogin)
												setIsAdmin(false)
											}}
											className="font-semibold text-neutral-900 hover:underline underline-offset-4 focus:outline-none transition-transform active:scale-95 inline-block"
										>
											{isLogin ? "Create an account" : "Sign in"}
										</button>
									</p>
								</form>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>
		</div>
	)
}
