'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { GlassTile } from '@/components/ui/glass-tile'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Clock, AlertCircle, FileText, Building, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'

type AdminRequestStatus = {
    request_id: string
    status: string
    reason: string
    organization: string
    experience_level: string
    created_at: string
    reviewed_at: string | null
    review_notes: string | null
}

export default function AdminRequestStatus() {
    const { user } = useAuth()
    const { toast } = useToast()
    const [requestStatus, setRequestStatus] = useState<AdminRequestStatus | null>(null)
    const [loading, setLoading] = useState(true)
    const [cancelling, setCancelling] = useState(false)

    useEffect(() => {
        if (user) {
            fetchAdminRequestStatus()
        }
    }, [user])

    const fetchAdminRequestStatus = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase.rpc('get_user_admin_request_status', {
                p_user_id: user!.id
            })

            if (error) {
                console.error('Error fetching admin request status:', error.message || error)
                toast({
                    title: "Error",
                    description: error.message || "Failed to fetch admin request status",
                    variant: "destructive"
                })
                return
            }

            setRequestStatus(data?.[0] || null)
        } catch (error: any) {
            console.error('Error fetching admin request status:', error.message || error)
            toast({
                title: "Error",
                description: error.message || "Failed to fetch admin request status",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    const handleCancelRequest = async () => {
        if (!user) return

        try {
            setCancelling(true)
            const { error } = await supabase.rpc('cancel_admin_request', {
                p_user_id: user.id
            })

            if (error) {
                console.error('Error cancelling request:', error.message || error)
                toast({
                    title: "Error",
                    description: error.message || "Failed to cancel admin request",
                    variant: "destructive"
                })
                return
            }

            toast({
                title: "Success",
                description: "Admin request cancelled successfully"
            })

            // Refresh the status
            await fetchAdminRequestStatus()
        } catch (error: any) {
            console.error('Error cancelling request:', error.message || error)
            toast({
                title: "Error",
                description: error.message || "Failed to cancel admin request",
                variant: "destructive"
            })
        } finally {
            setCancelling(false)
        }
    }

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'PENDING':
                return {
                    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                    icon: <Clock className="w-6 h-6 text-yellow-600" />,
                    title: 'Under Review',
                    description: 'Your request is currently being reviewed by our administrators.',
                    gradient: 'from-yellow-50 to-orange-50'
                }
            case 'APPROVED':
                return {
                    color: 'bg-green-100 text-green-800 border-green-200',
                    icon: <CheckCircle className="w-6 h-6 text-green-600" />,
                    title: 'Request Approved',
                    description: 'Congratulations! Your admin privileges have been granted.',
                    gradient: 'from-green-50 to-emerald-50'
                }
            case 'REJECTED':
                return {
                    color: 'bg-red-100 text-red-800 border-red-200',
                    icon: <XCircle className="w-6 h-6 text-red-600" />,
                    title: 'Request Rejected',
                    description: 'Your request was not approved at this time.',
                    gradient: 'from-red-50 to-pink-50'
                }
            case 'CANCELLED':
                return {
                    color: 'bg-gray-100 text-gray-800 border-gray-200',
                    icon: <AlertCircle className="w-6 h-6 text-gray-600" />,
                    title: 'Request Cancelled',
                    description: 'You have cancelled this request.',
                    gradient: 'from-gray-50 to-slate-50'
                }
            default:
                return {
                    color: 'bg-gray-100 text-gray-800 border-gray-200',
                    icon: <AlertCircle className="w-6 h-6 text-gray-600" />,
                    title: 'Unknown Status',
                    description: 'Status unknown.',
                    gradient: 'from-gray-50 to-slate-50'
                }
        }
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f3f4f6]">
                <GlassTile className="max-w-md w-full text-center py-10">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h2>
                    <p className="text-gray-600 mb-6">You need to be logged in to view your request status.</p>
                    <a href="/login" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors">
                        Log In
                    </a>
                </GlassTile>
            </div>
        )
    }

    const statusConfig = requestStatus ? getStatusConfig(requestStatus.status) : null

    return (
        <div className="min-h-screen flex flex-col font-sans relative overflow-hidden bg-[#f3f4f6]">
            {/* Mesh Gradient Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-200/40 blur-[80px] mix-blend-multiply opacity-60 animate-blob"></div>
                <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-200/40 blur-[80px] mix-blend-multiply opacity-60 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-cyan-200/40 blur-[80px] mix-blend-multiply opacity-60 animate-blob animation-delay-4000"></div>
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03]"></div>
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <Header user={user ? { ...user, role: user.role === 'USER' ? 'customer' : user.role } : null} />

                <main className="flex-grow py-12 container mx-auto px-4 max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8 text-center"
                    >
                        <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Admin Status</h1>
                        <p className="text-gray-600 text-lg">Track the progress of your administrative access request</p>
                    </motion.div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <div className="w-12 h-12 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
                            <p className="text-gray-500 animate-pulse">Checking status...</p>
                        </div>
                    ) : !requestStatus ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <GlassTile className="py-16 flex flex-col items-center justify-center text-center" interactive={false}>
                                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-blue-100">
                                    <Briefcase className="w-10 h-10 text-blue-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Request</h3>
                                <p className="text-gray-500 max-w-md mx-auto mb-8">
                                    You haven't submitted a request for admin access yet. If you'd like to become an administrator, you can submit a new request.
                                </p>
                                <Button
                                    onClick={() => window.location.href = '/register'}
                                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 px-8 py-6 h-auto text-lg rounded-xl"
                                >
                                    Request Admin Access
                                </Button>
                            </GlassTile>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <GlassTile className="p-0 overflow-hidden" interactive={false}>
                                {statusConfig && (
                                    <div className={cn("p-8 bg-gradient-to-br", statusConfig.gradient)}>
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className="p-3 bg-white/60 backdrop-blur-sm rounded-full shadow-sm">
                                                {statusConfig.icon}
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-gray-900">{statusConfig.title}</h2>
                                                <p className="text-gray-600">{statusConfig.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="p-8 space-y-8">
                                    {/* Request Details Section */}
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                                            <FileText className="w-4 h-4 mr-2" /> Request Details
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-4 bg-white/40 border border-white/60 rounded-xl">
                                                <span className="text-xs text-gray-500 block mb-1">Experience Level</span>
                                                <span className="font-semibold text-gray-900">{requestStatus.experience_level}</span>
                                            </div>
                                            {requestStatus.organization && (
                                                <div className="p-4 bg-white/40 border border-white/60 rounded-xl">
                                                    <span className="text-xs text-gray-500 block mb-1 flex items-center"><Building className="w-3 h-3 mr-1" /> Organization</span>
                                                    <span className="font-semibold text-gray-900">{requestStatus.organization}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-4 p-5 bg-white/40 border border-white/60 rounded-xl">
                                            <span className="text-xs text-gray-500 block mb-2">Reason for Request</span>
                                            <p className="text-gray-700 italic">"{requestStatus.reason}"</p>
                                        </div>
                                        <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 justify-end">
                                            <Clock className="w-4 h-4" />
                                            <span>Submitted on {new Date(requestStatus.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    {/* Review Info Section */}
                                    {requestStatus.reviewed_at && (
                                        <div className="border-t border-gray-100 pt-8">
                                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Review Information</h3>
                                            <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-100">
                                                <div className="mb-4">
                                                    <span className="text-xs text-gray-500 block mb-1">Reviewed on</span>
                                                    <span className="font-semibold text-gray-900">{new Date(requestStatus.reviewed_at).toLocaleDateString()}</span>
                                                </div>
                                                {requestStatus.review_notes && (
                                                    <div>
                                                        <span className="text-xs text-gray-500 block mb-2">Reviewer Notes</span>
                                                        <p className="text-gray-700">{requestStatus.review_notes}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions Section */}
                                    <div className="border-t border-gray-100 pt-6 flex justify-end">
                                        {requestStatus.status === 'PENDING' && (
                                            <Button
                                                variant="destructive"
                                                onClick={handleCancelRequest}
                                                disabled={cancelling}
                                                className="bg-red-50 text-red-600 hover:bg-red-100 border-red-100 hover:border-red-200 shadow-none hover:shadow-sm"
                                            >
                                                {cancelling ? 'Cancelling...' : 'Cancel Request'}
                                            </Button>
                                        )}

                                        {requestStatus.status === 'APPROVED' && (
                                            <Button
                                                onClick={() => window.location.href = '/admin/dashboard'}
                                                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 px-8"
                                            >
                                                Go to Admin Dashboard
                                            </Button>
                                        )}

                                        {requestStatus.status === 'CANCELLED' && (
                                            <Button
                                                onClick={() => window.location.href = '/register'}
                                                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
                                            >
                                                Submit New Request
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </GlassTile>
                        </motion.div>
                    )}
                </main>

                <Footer />
            </div>
        </div>
    )
}