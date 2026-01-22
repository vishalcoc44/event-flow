'use client';

import React, { useState, useEffect } from 'react';
import { useOrganizationData, useOrganizationPermissions } from '@/hooks/useOrganizationData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { GlassTile } from '@/components/ui/glass-tile';
import {
  RefreshCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  ArrowLeft,
  ChevronRight,
  MoreVertical,
  AlertCircle,
  ShieldAlert,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface RefundRequest {
  id: string;
  booking_id: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSED';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  booking: {
    id: string;
    event: {
      title: string;
      price: number;
    };
    user: {
      email: string;
      first_name: string;
      last_name: string;
    };
  };
}

export default function OrganizationRefunds() {
  const { organization, orgLoading } = useOrganizationData();
  const { canManageMembers: canManageRefunds } = useOrganizationPermissions();
  const { toast } = useToast();
  const { user } = useAuth();

  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsUpdating] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [targetStatus, setTargetStatus] = useState<'APPROVED' | 'REJECTED' | 'PROCESSED' | null>(null);

  useEffect(() => {
    if (organization) {
      loadRefunds();
    }
  }, [organization]);

  const loadRefunds = async () => {
    setLoading(true);
    try {
      if (!organization) return;
      
      // Get events for this organization to filter bookings
      const { data: events } = await supabase
        .from('events')
        .select('id')
        .eq('organization_id', organization.id);
      
      if (!events || events.length === 0) {
        setRefunds([]);
        return;
      }

      const eventIds = events.map(e => e.id);

      const { data, error } = await supabase
        .from('refund_requests')
        .select(`
          *,
          booking:booking_id (
            id,
            event:event_id (title, price),
            user:user_id (email, first_name, last_name)
          )
        `)
        .in('booking.event_id', eventIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRefunds(data || []);
    } catch (error) {
      console.error('Error loading refunds:', error);
      toast({ title: "System Failure", description: "Could not retrieve refund requests.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedRefund || !targetStatus) return;
    setIsUpdating(true);

    try {
      const { error } = await supabase
        .from('refund_requests')
        .update({
          status: targetStatus,
          admin_notes: adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedRefund.id);

      if (error) throw error;

      toast({ 
        title: "Status Updated", 
        description: `Refund request marked as ${targetStatus.toLowerCase()}.` 
      });
      
      loadRefunds();
      setShowStatusDialog(false);
      setSelectedRefund(null);
      setAdminNotes('');
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update refund status.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredRefunds = refunds.filter(r => {
    const userFullName = `${r.booking.user.first_name} ${r.booking.user.last_name}`.toLowerCase();
    const matchesSearch = !searchTerm || 
      userFullName.includes(searchTerm.toLowerCase()) || 
      r.booking.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.booking.event.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PROCESSED':
        return { label: 'Processed', icon: CheckCircle2, class: 'bg-green-500/10 text-green-500 border-green-500/20' };
      case 'APPROVED':
        return { label: 'Approved', icon: CheckCircle2, class: 'bg-blue-500/10 text-blue-500 border-blue-500/20' };
      case 'PENDING':
        return { label: 'Pending', icon: Clock, class: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' };
      case 'REJECTED':
        return { label: 'Rejected', icon: XCircle, class: 'bg-red-500/10 text-red-500 border-red-500/20' };
      default:
        return { label: status, icon: AlertCircle, class: 'bg-neutral-500/10 text-neutral-500 border-neutral-500/20' };
    }
  };

  if (orgLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col pt-32 px-4 animate-pulse">
        <div className="container mx-auto max-w-6xl">
          <div className="h-20 bg-white/5 rounded-3xl w-1/3 mb-12" />
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-white/5 rounded-3xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!organization || !canManageRefunds) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <GlassTile className="p-16 max-w-md text-center" interactive={false}>
          <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center text-red-500 mx-auto mb-8">
            <ShieldAlert className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-black tracking-tighter mb-4">Access Restricted.</h2>
          <p className="text-neutral-500 mb-10 font-medium leading-relaxed">
            You do not possess the clearance to manage refunds for this collective.
          </p>
          <Button asChild className="h-14 px-8 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-black tracking-tight w-full">
            <Link href="/organization/dashboard">Return to Hub</Link>
          </Button>
        </GlassTile>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-x-hidden">
      <div className="fixed inset-0 z-[-1] opacity-30 dark:opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />

      <main className="flex-grow pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                  <RefreshCcw className="h-5 w-5" />
                </div>
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-blue-500">Revenue Recovery</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9] mb-3">
                Refund Portal.
              </h1>
              <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">
                Managing {refunds.length} total recovery requests for {organization?.name}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" className="h-14 px-6 rounded-2xl gap-3 font-bold uppercase tracking-widest text-[10px] bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/5">
                <Link href="/organization/dashboard"><ArrowLeft className="h-4 w-4" /> Dashboard</Link>
              </Button>
            </div>
          </motion.div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative group flex-grow md:flex-grow-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  placeholder="Search by attendee or event..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-14 w-full md:w-80 rounded-2xl pl-12 bg-white/50 dark:bg-white/5 border-neutral-200 dark:border-white/10 font-bold focus:ring-blue-500/50"
                />
              </div>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-14 px-6 rounded-2xl bg-white/50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 font-bold text-xs uppercase tracking-widest appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="all">All States</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="PROCESSED">Processed</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredRefunds.length > 0 ? (
                filteredRefunds.map((refund, index) => {
                  const status = getStatusConfig(refund.status);
                  return (
                    <motion.div
                      key={refund.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <GlassTile className="p-6 md:p-8" interactive={false}>
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-white/5 flex items-center justify-center text-blue-500 shadow-inner">
                              <RefreshCcw className="h-8 w-8" />
                            </div>
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-xl font-black tracking-tighter leading-none uppercase">
                                  {refund.booking.user.first_name} {refund.booking.user.last_name}
                                </h3>
                                <Badge className={cn("px-2.5 py-1 rounded-lg font-black uppercase text-[8px] border-0", status.class)}>
                                  {status.label}
                                </Badge>
                              </div>
                              <p className="text-neutral-500 font-bold text-[10px] uppercase tracking-widest mb-2">
                                {refund.booking.event.title} • ${refund.booking.event.price}
                              </p>
                              <div className="flex items-center gap-2 text-neutral-400 text-[10px] font-bold uppercase tracking-widest">
                                <Clock className="h-3 w-3" /> Requested {new Date(refund.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          <div className="flex-grow max-w-md bg-neutral-50 dark:bg-black/20 p-4 rounded-2xl border border-neutral-100 dark:border-white/5">
                            <div className="text-[8px] font-black uppercase tracking-widest text-neutral-400 mb-2 flex items-center gap-1.5">
                              <MessageSquare className="h-3 w-3" /> Reason for Request
                            </div>
                            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300 line-clamp-2 italic">
                              "{refund.reason}"
                            </p>
                          </div>

                          <div className="flex items-center gap-3 self-end lg:self-center">
                            {refund.status === 'PENDING' && (
                              <>
                                <Button
                                  onClick={() => {
                                    setSelectedRefund(refund);
                                    setTargetStatus('APPROVED');
                                    setShowStatusDialog(true);
                                  }}
                                  className="h-12 px-6 rounded-xl bg-green-600 hover:bg-green-700 text-white font-black text-[10px] uppercase tracking-widest"
                                >
                                  Approve
                                </Button>
                                <Button
                                  onClick={() => {
                                    setSelectedRefund(refund);
                                    setTargetStatus('REJECTED');
                                    setShowStatusDialog(true);
                                  }}
                                  variant="ghost"
                                  className="h-12 px-6 rounded-xl text-red-500 hover:bg-red-500/10 font-black text-[10px] uppercase tracking-widest"
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            {refund.status === 'APPROVED' && (
                              <Button
                                onClick={() => {
                                  setSelectedRefund(refund);
                                  setTargetStatus('PROCESSED');
                                  setShowStatusDialog(true);
                                }}
                                className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest"
                              >
                                Mark Processed
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-neutral-400">
                              <MoreVertical className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      </GlassTile>
                    </motion.div>
                  );
                })
              ) : (
                <GlassTile className="p-20 text-center" interactive={false}>
                  <RefreshCcw className="h-16 w-16 text-neutral-200 dark:text-white/10 mx-auto mb-6" />
                  <h3 className="text-2xl font-black tracking-tighter mb-2">No Requests found.</h3>
                  <p className="text-neutral-500 font-medium">There are no refund requests matching your filters.</p>
                </GlassTile>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="rounded-3xl border-white/20 backdrop-blur-2xl bg-background/80">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tighter uppercase">
              {targetStatus} Request.
            </DialogTitle>
            <DialogDescription className="font-bold text-neutral-500 uppercase tracking-widest text-[10px]">
              Attendee: {selectedRefund?.booking.user.first_name} {selectedRefund?.booking.user.last_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="space-y-2">
              <label className="uppercase tracking-[0.2em] text-[10px] font-black opacity-50">Admin Notes (Visible to User)</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Enter details about this decision..."
                className="w-full min-h-[120px] rounded-2xl bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 font-bold p-6 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>
          <DialogFooter className="pt-8">
            <Button variant="ghost" onClick={() => setShowStatusDialog(false)} className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px]">Abort</Button>
            <Button 
              onClick={handleUpdateStatus} 
              disabled={isProcessing}
              className={cn(
                "h-14 px-8 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] shadow-xl",
                targetStatus === 'APPROVED' ? "bg-green-600 shadow-green-500/20" : 
                targetStatus === 'REJECTED' ? "bg-red-600 shadow-red-500/20" : "bg-blue-600 shadow-blue-500/20"
              )}
            >
              {isProcessing ? "Updating..." : `Confirm ${targetStatus}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}