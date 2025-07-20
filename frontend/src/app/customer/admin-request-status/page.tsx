'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'

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
                console.error('Error fetching admin request status:', error)
                toast({
                    title: "Error",
                    description: "Failed to fetch admin request status",
                    variant: "destructive"
                })
                return
            }
            
            setRequestStatus(data?.[0] || null)
        } catch (error) {
            console.error('Error fetching admin request status:', error)
            toast({
                title: "Error",
                description: "Failed to fetch admin request status",
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
                console.error('Error cancelling request:', error)
                toast({
                    title: "Error",
                    description: "Failed to cancel admin request",
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
        } catch (error) {
            console.error('Error cancelling request:', error)
            toast({
                title: "Error",
                description: "Failed to cancel admin request",
                variant: "destructive"
            })
        } finally {
            setCancelling(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800'
            case 'APPROVED': return 'bg-green-100 text-green-800'
            case 'REJECTED': return 'bg-red-100 text-red-800'
            case 'CANCELLED': return 'bg-gray-100 text-gray-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING':
                return (
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )
            case 'APPROVED':
                return (
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                )
            case 'REJECTED':
                return (
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                )
            case 'CANCELLED':
                return (
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                )
            default:
                return null
        }
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h1>
                    <p className="text-gray-600">You need to be logged in to view this page.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            
            <main className="flex-grow py-8">
                <div className="container mx-auto px-4">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Request Status</h1>
                        <p className="text-gray-600">Check the status of your admin privilege request</p>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : !requestStatus ? (
                        <Card>
                            <CardContent className="py-12">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Admin Request Found</h3>
                                    <p className="text-gray-600 mb-4">You haven't submitted an admin request yet.</p>
                                    <Button onClick={() => window.location.href = '/register'}>
                                        Request Admin Access
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="max-w-2xl mx-auto">
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    {getStatusIcon(requestStatus.status)}
                                    <div>
                                        <CardTitle>Admin Request Status</CardTitle>
                                        <CardDescription>
                                            Request submitted on {new Date(requestStatus.created_at).toLocaleDateString()}
                                        </CardDescription>
                                    </div>
                                    <Badge className={getStatusColor(requestStatus.status)}>
                                        {requestStatus.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Request Details</h4>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-gray-700 mb-2">
                                            <strong>Reason:</strong> {requestStatus.reason}
                                        </p>
                                        {requestStatus.organization && (
                                            <p className="text-gray-700 mb-2">
                                                <strong>Organization:</strong> {requestStatus.organization}
                                            </p>
                                        )}
                                        <p className="text-gray-700">
                                            <strong>Experience Level:</strong> {requestStatus.experience_level}
                                        </p>
                                    </div>
                                </div>

                                {requestStatus.reviewed_at && (
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Review Information</h4>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-gray-700 mb-2">
                                                <strong>Reviewed on:</strong> {new Date(requestStatus.reviewed_at).toLocaleDateString()}
                                            </p>
                                            {requestStatus.review_notes && (
                                                <p className="text-gray-700">
                                                    <strong>Review Notes:</strong> {requestStatus.review_notes}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {requestStatus.status === 'PENDING' && (
                                    <div className="border-t pt-6">
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                            <div className="flex">
                                                <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                <div>
                                                    <h4 className="text-sm font-medium text-yellow-800">Request Under Review</h4>
                                                    <p className="text-sm text-yellow-700 mt-1">
                                                        Your admin request is currently being reviewed by our administrators. 
                                                        You will be notified once a decision has been made.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <Button
                                            variant="outline"
                                            onClick={handleCancelRequest}
                                            disabled={cancelling}
                                            className="w-full"
                                        >
                                            {cancelling ? 'Cancelling...' : 'Cancel Request'}
                                        </Button>
                                    </div>
                                )}

                                {requestStatus.status === 'APPROVED' && (
                                    <div className="border-t pt-6">
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <div className="flex">
                                                <svg className="w-5 h-5 text-green-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <div>
                                                    <h4 className="text-sm font-medium text-green-800">Request Approved!</h4>
                                                    <p className="text-sm text-green-700 mt-1">
                                                        Congratulations! Your admin request has been approved. 
                                                        You now have admin privileges and can access the admin dashboard.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <Button
                                            onClick={() => window.location.href = '/admin/dashboard'}
                                            className="w-full mt-4"
                                        >
                                            Go to Admin Dashboard
                                        </Button>
                                    </div>
                                )}

                                {requestStatus.status === 'REJECTED' && (
                                    <div className="border-t pt-6">
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                            <div className="flex">
                                                <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                                <div>
                                                    <h4 className="text-sm font-medium text-red-800">Request Rejected</h4>
                                                    <p className="text-sm text-red-700 mt-1">
                                                        Your admin request has been rejected. Please contact support for more information.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {requestStatus.status === 'CANCELLED' && (
                                    <div className="border-t pt-6">
                                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                            <div className="flex">
                                                <svg className="w-5 h-5 text-gray-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-800">Request Cancelled</h4>
                                                    <p className="text-sm text-gray-700 mt-1">
                                                        Your admin request has been cancelled. You can submit a new request if needed.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <Button
                                            onClick={() => window.location.href = '/register'}
                                            className="w-full mt-4"
                                        >
                                            Submit New Request
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>
            
            <Footer />
        </div>
    )
} 