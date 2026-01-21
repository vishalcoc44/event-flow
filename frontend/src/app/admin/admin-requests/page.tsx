'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Search, CheckCircle2, XCircle, Trash2, Filter, UserCheck, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlassTile } from '@/components/ui/glass-tile'
import { motion } from 'framer-motion'

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
    const router = useRouter()
    const [requests, setRequests] = useState<AdminRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [processingRequest, setProcessingRequest] = useState<string | null>(null)
    const [reviewNotes, setReviewNotes] = useState('')
    const [selectedRequest, setSelectedRequest] = useState<AdminRequest | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | 'bulk_approve' | 'bulk_reject' | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    useEffect(() => {
        // Check if user is admin (either system admin or organization admin)
        if (!user || (user.role !== 'ADMIN' && !user.is_org_admin)) {
            // Wait a bit to ensure auth is loaded, but useAuth usually handles this
            // If user is null but loading, we might want to wait, but here we assume 'user' is the resolved state
            // or simply redirect if definitely not admin
            if (user === null) {
                // potentially loading, do nothing 
            } else {
                router.push('/login')
            }
            // For strict checking, we could rely on role mainly.
            // If user is actually loaded and not admin:
            if (user && user.role !== 'ADMIN' && !user.is_org_admin) {
                router.push('/login')
            }
        }
        if (user) {
            fetchAdminRequests()
        }
    }, [user, router])

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

    const handleBulkAction = async (action: 'approve' | 'reject') => {
        if (!user || selectedIds.length === 0) return

        try {
            setProcessingRequest('bulk')
            const promises = selectedIds.map(id =>
                supabase.rpc(action === 'approve' ? 'approve_admin_request' : 'reject_admin_request', {
                    p_request_id: id,
                    p_reviewer_id: user.id,
                    p_review_notes: reviewNotes + (action === 'approve' ? ' (Bulk Approved)' : ' (Bulk Rejected)')
                })
            )

            const results = await Promise.all(promises)
            const errors = results.filter(r => r.error)

            if (errors.length > 0) {
                toast({
                    title: "Partial Success",
                    description: `Processed ${selectedIds.length - errors.length} requests. ${errors.length} failed.`,
                    variant: "destructive"
                })
            } else {
                toast({
                    title: "Success",
                    description: `Bulk ${action}d ${selectedIds.length} requests successfully`
                })
            }

            await fetchAdminRequests()
            setIsDialogOpen(false)
            setReviewNotes('')
            setSelectedIds([])
            setReviewAction(null)
        } catch (error) {
            console.error('Bulk action error:', error)
            toast({
                title: "Error",
                description: "Failed to process bulk action",
                variant: "destructive"
            })
        } finally {
            setProcessingRequest(null)
        }
    }

    const openReviewDialog = (request: AdminRequest | 'bulk', action: 'approve' | 'reject') => {
        if (request === 'bulk') {
            setReviewAction(action === 'approve' ? 'bulk_approve' : 'bulk_reject')
            setSelectedRequest(null)
        } else {
            setSelectedRequest(request)
            setReviewAction(action)
        }
        setReviewNotes('')
        setIsDialogOpen(true)
    }

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredRequests.length) {
            setSelectedIds([])
        } else {
            setSelectedIds(filteredRequests.map(r => r.request_id))
        }
    }

    const toggleSelectRow = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const filteredRequests = requests.filter(request =>
        request.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (request.organization && request.organization.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    const getExperienceLevelColor = (level: string) => {
        switch (level) {
            case 'BEGINNER': return 'bg-blue-500/10 text-blue-700 border-blue-200'
            case 'INTERMEDIATE': return 'bg-yellow-500/10 text-yellow-700 border-yellow-200'
            case 'EXPERIENCED': return 'bg-orange-500/10 text-orange-700 border-orange-200'
            case 'EXPERT': return 'bg-green-500/10 text-green-700 border-green-200'
            default: return 'bg-gray-500/10 text-gray-700 border-gray-200'
        }
    }

    if (user?.role !== 'ADMIN') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6]">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
                    <p className="text-gray-600">You need admin privileges to access this page.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col font-sans relative overflow-hidden bg-[#f3f4f6]">
            {/* Mesh Gradient Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-purple-200/40 blur-[80px] mix-blend-multiply opacity-70 animate-blob"></div>
                <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-blue-200/40 blur-[80px] mix-blend-multiply opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-indigo-200/40 blur-[80px] mix-blend-multiply opacity-70 animate-blob animation-delay-4000"></div>
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03]"></div>
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <Header />

                <main className="flex-grow py-12">
                    <div className="container mx-auto px-4 max-w-7xl">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                            <div className="space-y-2">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100 mb-2">
                                    <Shield className="w-3 h-3" />
                                    ADMINISTRATION
                                </div>
                                <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Access Requests</h1>
                                <p className="text-gray-600 max-w-lg text-lg">
                                    Manage pending requests for administrative privileges and specialized access.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                <div className="relative group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    <Input
                                        placeholder="Search requests..."
                                        className="pl-10 w-full sm:w-64 bg-white/70 backdrop-blur-sm border-gray-200/50 focus:border-blue-400 focus:ring-blue-100 transition-all shadow-sm"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                {selectedIds.length > 0 && (
                                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                                        <Button
                                            onClick={() => openReviewDialog('bulk', 'approve')}
                                            className="bg-green-600 hover:bg-green-700 text-white gap-2 shadow-lg hover:shadow-xl transition-all"
                                            size="sm"
                                        >
                                            <CheckCircle2 className="h-4 w-4" />
                                            Approve ({selectedIds.length})
                                        </Button>
                                        <Button
                                            onClick={() => openReviewDialog('bulk', 'reject')}
                                            variant="destructive"
                                            className="gap-2 shadow-lg hover:shadow-xl transition-all"
                                            size="sm"
                                        >
                                            <XCircle className="h-4 w-4" />
                                            Reject
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedIds([])}
                                            className="text-gray-500 hover:bg-gray-100/50"
                                        >
                                            Clear
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mb-6 flex items-center gap-2 px-1">
                            <Checkbox
                                id="select-all"
                                checked={selectedIds.length === filteredRequests.length && filteredRequests.length > 0}
                                onCheckedChange={toggleSelectAll}
                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                            <label htmlFor="select-all" className="text-sm font-medium text-gray-600 cursor-pointer select-none">
                                Select All {filteredRequests.length > 0 && <span className="text-gray-400 font-normal ml-1">({filteredRequests.length} pending)</span>}
                            </label>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-24 space-y-4">
                                <div className="w-10 h-10 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
                                <p className="text-gray-500 animate-pulse">Loading requests...</p>
                            </div>
                        ) : filteredRequests.length === 0 ? (
                            <GlassTile className="py-20 flex flex-col items-center justify-center text-center opacity-80" interactive={false}>
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                    <UserCheck className="w-10 h-10 text-gray-300" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</h3>
                                <p className="text-gray-500 max-w-sm mx-auto">
                                    There are no pending admin requests matching your criteria.
                                </p>
                            </GlassTile>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredRequests.map((request, index) => (
                                    <motion.div
                                        key={request.request_id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                    >
                                        <GlassTile
                                            className={cn(
                                                "h-full flex flex-col justify-between relative group overflow-hidden border-t-4",
                                                selectedIds.includes(request.request_id)
                                                    ? "border-t-blue-500 bg-white/90 shadow-lg scale-[1.01]"
                                                    : "border-t-transparent hover:border-t-gray-300"
                                            )}
                                            interactive={true}
                                            hoverScale={1.02}
                                        >
                                            {/* Selection Overlay for entire card click handling if desired, but here we keep specific checkbox */}

                                            <div className="absolute top-4 left-4 z-20">
                                                <Checkbox
                                                    checked={selectedIds.includes(request.request_id)}
                                                    onCheckedChange={() => toggleSelectRow(request.request_id)}
                                                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 bg-white/80 backdrop-blur-sm shadow-sm"
                                                />
                                            </div>

                                            <div className="pt-2 pl-8 pr-1 space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-blue-700 transition-colors">
                                                            {request.first_name} {request.last_name}
                                                        </h3>
                                                        <p className="text-sm text-gray-500 mt-1">{request.email}</p>
                                                    </div>
                                                    <Badge variant="outline" className={cn("ml-2 whitespace-nowrap", getExperienceLevelColor(request.experience_level))}>
                                                        {request.experience_level}
                                                    </Badge>
                                                </div>

                                                <div className="space-y-3 pt-2">
                                                    {request.organization && (
                                                        <div className="bg-gray-50/80 p-2.5 rounded-lg border border-gray-100">
                                                            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Organization</div>
                                                            <div className="text-sm text-gray-800 font-medium">{request.organization}</div>
                                                        </div>
                                                    )}

                                                    <div>
                                                        <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Reason for Access</div>
                                                        <p className="text-sm text-gray-600 leading-relaxed bg-white/50 p-2.5 rounded-lg">
                                                            "{request.reason}"
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 pt-6 mt-4 border-t border-gray-100/50">
                                                <Button
                                                    onClick={() => openReviewDialog(request, 'approve')}
                                                    className="flex-1 bg-green-600/90 hover:bg-green-600 text-white shadow-sm hover:shadow"
                                                    size="sm"
                                                    disabled={processingRequest === request.request_id}
                                                >
                                                    {processingRequest === request.request_id ? (
                                                        <span className="animate-pulse">...</span>
                                                    ) : (
                                                        <>
                                                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Approve
                                                        </>
                                                    )}
                                                </Button>
                                                <Button
                                                    onClick={() => openReviewDialog(request, 'reject')}
                                                    variant="outline"
                                                    className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-100"
                                                    size="sm"
                                                    disabled={processingRequest === request.request_id}
                                                >
                                                    {processingRequest === request.request_id ? (
                                                        <span className="animate-pulse">...</span>
                                                    ) : (
                                                        <>
                                                            <XCircle className="w-3.5 h-3.5 mr-1.5" /> Reject
                                                        </>
                                                    )}
                                                </Button>
                                            </div>

                                            <div className="absolute bottom-2 right-4 text-[10px] text-gray-300 font-medium tracking-wide">
                                                {new Date(request.created_at).toLocaleDateString()}
                                            </div>
                                        </GlassTile>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>

                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    if (!processingRequest) {
                        setIsDialogOpen(open)
                        if (!open) {
                            setReviewAction(null)
                            setSelectedRequest(null)
                        }
                    }
                }}>
                    <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-xl border-gray-100 shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl">
                                {reviewAction === 'bulk_approve' ? `Bulk Approve` :
                                    reviewAction === 'bulk_reject' ? `Bulk Reject` :
                                        reviewAction === 'approve' ? 'Approve Request' : 'Reject Request'}
                            </DialogTitle>
                            <DialogDescription className="text-gray-500">
                                {selectedRequest ? (
                                    <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm">
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-gray-900">{selectedRequest.first_name} {selectedRequest.last_name}</span>
                                        </div>
                                        <div className="text-gray-500">{selectedRequest.email}</div>
                                    </div>
                                ) : (
                                    <div className="mt-2 text-sm">
                                        Processing <span className="font-bold text-gray-900">{selectedIds.length}</span> selected requests.
                                    </div>
                                )}
                                <p className={cn("mt-3 text-sm flex items-center gap-2", reviewAction?.includes('approve') ? "text-green-600" : "text-amber-600")}>
                                    {reviewAction?.includes('approve') ? <CheckCircle2 className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                                    {reviewAction?.includes('approve')
                                        ? "This grants full administrative privileges."
                                        : "Please provide a reason for the rejection notifications."}
                                </p>
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <label htmlFor="review-notes" className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Review Notes {reviewAction?.includes('reject') && <span className="text-red-500">*</span>}
                                </label>
                                <Textarea
                                    id="review-notes"
                                    placeholder={reviewAction?.includes('reject') ? "Reason for rejection (Required)" : "Add optional notes for the audit log..."}
                                    value={reviewNotes}
                                    onChange={(e) => setReviewNotes(e.target.value)}
                                    rows={3}
                                    className={cn(
                                        "bg-gray-50 border-gray-200 focus:bg-white transition-all",
                                        reviewAction?.includes('reject') && !reviewNotes.trim() ? "border-amber-300 focus:border-red-400 focus:ring-red-100" : ""
                                    )}
                                />
                            </div>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsDialogOpen(false)
                                    setReviewNotes('')
                                    setSelectedRequest(null)
                                    setReviewAction(null)
                                }}
                                disabled={!!processingRequest}
                                className="border-gray-200 text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </Button>

                            {reviewAction?.includes('approve') ? (
                                <Button
                                    onClick={() => reviewAction === 'bulk_approve' ? handleBulkAction('approve') : selectedRequest && handleApprove(selectedRequest.request_id)}
                                    className="bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all"
                                    disabled={!!processingRequest}
                                >
                                    {processingRequest ? 'Processing...' : 'Confirm Approval'}
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => reviewAction === 'bulk_reject' ? handleBulkAction('reject') : selectedRequest && handleReject(selectedRequest.request_id)}
                                    variant="destructive"
                                    disabled={!!processingRequest || (reviewAction?.includes('reject') && !reviewNotes.trim())}
                                    className="shadow-md hover:shadow-lg transition-all"
                                >
                                    {processingRequest ? 'Processing...' : 'Confirm Rejection'}
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Footer />
            </div>
        </div>
    )
}