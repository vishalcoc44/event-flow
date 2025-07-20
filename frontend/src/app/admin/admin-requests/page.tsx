'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'

type AdminRequest = {
    request_id: string
    user_id: string
    email: string
    first_name: string
    last_name: string
    contact_number: string
    reason: string
    organization: string
    experience_level: string
    intended_use: string
    created_at: string
    username: string
}

export default function AdminRequests() {
    const { user } = useAuth()
    const { toast } = useToast()
    const [requests, setRequests] = useState<AdminRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [processingRequest, setProcessingRequest] = useState<string | null>(null)
    const [reviewNotes, setReviewNotes] = useState('')
    const [selectedRequest, setSelectedRequest] = useState<AdminRequest | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    useEffect(() => {
        if (user?.role !== 'ADMIN') {
            window.location.href = '/login'
            return
        }
        fetchAdminRequests()
    }, [user])

    const fetchAdminRequests = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase.rpc('get_pending_admin_requests')
            
            if (error) {
                console.error('Error fetching admin requests:', error)
                toast({
                    title: "Error",
                    description: "Failed to fetch admin requests",
                    variant: "destructive"
                })
                return
            }
            
            setRequests(data || [])
        } catch (error) {
            console.error('Error fetching admin requests:', error)
            toast({
                title: "Error",
                description: "Failed to fetch admin requests",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (requestId: string) => {
        if (!user) return
        
        try {
            setProcessingRequest(requestId)
            const { error } = await supabase.rpc('approve_admin_request', {
                p_request_id: requestId,
                p_reviewer_id: user.id,
                p_review_notes: reviewNotes
            })
            
            if (error) {
                console.error('Error approving request:', error)
                toast({
                    title: "Error",
                    description: "Failed to approve admin request",
                    variant: "destructive"
                })
                return
            }
            
            toast({
                title: "Success",
                description: "Admin request approved successfully"
            })
            
            // Refresh the list
            await fetchAdminRequests()
            setIsDialogOpen(false)
            setReviewNotes('')
            setSelectedRequest(null)
        } catch (error) {
            console.error('Error approving request:', error)
            toast({
                title: "Error",
                description: "Failed to approve admin request",
                variant: "destructive"
            })
        } finally {
            setProcessingRequest(null)
        }
    }

    const handleReject = async (requestId: string) => {
        if (!user || !reviewNotes.trim()) {
            toast({
                title: "Error",
                description: "Please provide a reason for rejection",
                variant: "destructive"
            })
            return
        }
        
        try {
            setProcessingRequest(requestId)
            const { error } = await supabase.rpc('reject_admin_request', {
                p_request_id: requestId,
                p_reviewer_id: user.id,
                p_review_notes: reviewNotes
            })
            
            if (error) {
                console.error('Error rejecting request:', error)
                toast({
                    title: "Error",
                    description: "Failed to reject admin request",
                    variant: "destructive"
                })
                return
            }
            
            toast({
                title: "Success",
                description: "Admin request rejected successfully"
            })
            
            // Refresh the list
            await fetchAdminRequests()
            setIsDialogOpen(false)
            setReviewNotes('')
            setSelectedRequest(null)
        } catch (error) {
            console.error('Error rejecting request:', error)
            toast({
                title: "Error",
                description: "Failed to reject admin request",
                variant: "destructive"
            })
        } finally {
            setProcessingRequest(null)
        }
    }

    const openReviewDialog = (request: AdminRequest, action: 'approve' | 'reject') => {
        setSelectedRequest(request)
        setReviewNotes('')
        setIsDialogOpen(true)
    }

    const getExperienceLevelColor = (level: string) => {
        switch (level) {
            case 'BEGINNER': return 'bg-blue-100 text-blue-800'
            case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800'
            case 'EXPERIENCED': return 'bg-orange-100 text-orange-800'
            case 'EXPERT': return 'bg-green-100 text-green-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    if (user?.role !== 'ADMIN') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
                    <p className="text-gray-600">You need admin privileges to access this page.</p>
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
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Requests</h1>
                        <p className="text-gray-600">Review and manage requests for admin privileges</p>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : requests.length === 0 ? (
                        <Card>
                            <CardContent className="py-12">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Requests</h3>
                                    <p className="text-gray-600">All admin requests have been processed.</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6">
                            {requests.map((request) => (
                                <Card key={request.request_id} className="hover:shadow-md transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="flex items-center gap-2">
                                                    {request.first_name} {request.last_name}
                                                    <Badge variant="outline" className={getExperienceLevelColor(request.experience_level)}>
                                                        {request.experience_level}
                                                    </Badge>
                                                </CardTitle>
                                                <CardDescription>
                                                    {request.email} • {request.contact_number}
                                                </CardDescription>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {new Date(request.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="font-medium text-gray-900 mb-1">Reason for Admin Access</h4>
                                                <p className="text-gray-600">{request.reason}</p>
                                            </div>
                                            
                                            {request.organization && (
                                                <div>
                                                    <h4 className="font-medium text-gray-900 mb-1">Organization</h4>
                                                    <p className="text-gray-600">{request.organization}</p>
                                                </div>
                                            )}
                                            
                                            {request.intended_use && (
                                                <div>
                                                    <h4 className="font-medium text-gray-900 mb-1">Intended Use</h4>
                                                    <p className="text-gray-600">{request.intended_use}</p>
                                                </div>
                                            )}
                                            
                                            <div className="flex gap-2 pt-4">
                                                <Button
                                                    onClick={() => openReviewDialog(request, 'approve')}
                                                    className="bg-green-600 hover:bg-green-700"
                                                    disabled={processingRequest === request.request_id}
                                                >
                                                    {processingRequest === request.request_id ? 'Processing...' : 'Approve'}
                                                </Button>
                                                <Button
                                                    onClick={() => openReviewDialog(request, 'reject')}
                                                    variant="destructive"
                                                    disabled={processingRequest === request.request_id}
                                                >
                                                    {processingRequest === request.request_id ? 'Processing...' : 'Reject'}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Review Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            Review Admin Request
                        </DialogTitle>
                        <DialogDescription>
                            {selectedRequest && (
                                <div className="mt-2">
                                    <p><strong>Applicant:</strong> {selectedRequest.first_name} {selectedRequest.last_name}</p>
                                    <p><strong>Email:</strong> {selectedRequest.email}</p>
                                </div>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="review-notes" className="block text-sm font-medium text-gray-700 mb-1">
                                Review Notes {selectedRequest && ' (Required for rejection)'}
                            </label>
                            <Textarea
                                id="review-notes"
                                placeholder="Add your review notes here..."
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                rows={4}
                            />
                        </div>
                    </div>
                    
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsDialogOpen(false)
                                setReviewNotes('')
                                setSelectedRequest(null)
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                if (selectedRequest) {
                                    handleApprove(selectedRequest.request_id)
                                }
                            }}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={processingRequest === selectedRequest?.request_id}
                        >
                            {processingRequest === selectedRequest?.request_id ? 'Processing...' : 'Approve'}
                        </Button>
                        <Button
                            onClick={() => {
                                if (selectedRequest) {
                                    handleReject(selectedRequest.request_id)
                                }
                            }}
                            variant="destructive"
                            disabled={processingRequest === selectedRequest?.request_id || !reviewNotes.trim()}
                        >
                            {processingRequest === selectedRequest?.request_id ? 'Processing...' : 'Reject'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            <Footer />
        </div>
    )
} 