'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, ClockIcon, UserIcon, MailIcon, CheckCircle, XCircle } from 'lucide-react';
import { GlassTile } from '@/components/ui/glass-tile';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Invitation {
  id: string;
  organization_id: string;
  organization_name: string;
  role: string;
  invited_by_name: string;
  message: string;
  invitation_token: string;
  expires_at: string;
  created_at: string;
}

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingInvitations, setProcessingInvitations] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      setLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Try RPC function first (preferred method)
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_user_organization_invitations');

        if (!rpcError && rpcData) {
          // Use RPC function result if successful
          const invitationsWithDetails = (rpcData || []).map((invitation: any) => ({
            id: invitation.id,
            organization_id: invitation.organization_id,
            organization_name: invitation.organization_name || 'Unknown Organization',
            role: invitation.role,
            invited_by_name: invitation.invited_by_name || 'Organization Admin',
            message: invitation.message,
            invitation_token: invitation.invitation_token,
            expires_at: invitation.expires_at,
            created_at: invitation.created_at
          }));

          setInvitations(invitationsWithDetails);
          setLoading(false);
          return;
        }
      } catch (rpcError) {
        console.warn('RPC function failed, falling back to direct query:', rpcError);
      }

      // Fallback: DIRECT QUERY ONLY - No RPC functions to avoid permission issues
      const { data: directData, error: directError } = await supabase
        .from('organization_invitations')
        .select(`
          id,
          organization_id,
          email,
          role,
          message,
          invitation_token,
          expires_at,
          created_at,
          organizations!inner(name)
        `)
        .eq('email', user.email)
        .eq('status', 'PENDING')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (directError) {
        console.error('Direct query failed:', directError);
        // If both RPC and direct query fail, show empty state instead of error
        setInvitations([]);
        setLoading(false);
        return;
      }

      // Use generic inviter information - completely avoid users table
      const invitationsWithSafeDetails = (directData || []).map((invitation: any) => ({
        id: invitation.id,
        organization_id: invitation.organization_id,
        organization_name: invitation.organizations?.name || 'Unknown Organization',
        role: invitation.role,
        invited_by_name: 'Organization Admin', // Safe generic name - no users table access
        message: invitation.message,
        invitation_token: invitation.invitation_token,
        expires_at: invitation.expires_at,
        created_at: invitation.created_at
      }));

      setInvitations(invitationsWithSafeDetails);
    } catch (error) {
      console.error('Error loading invitations:', error);
      toast({
        title: "Error",
        description: "Failed to load invitations. Please try again.",
        variant: "destructive",
      });
      // Set empty array on error to prevent crashes
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async (token: string, orgName: string, invitationId: string) => {
    setProcessingInvitations(prev => new Set(prev).add(invitationId));

    try {
      const { error } = await supabase.rpc('accept_organization_invitation', {
        p_invitation_token: token
      });

      if (error) throw error;

      toast({
        title: "Invitation accepted",
        description: `You have successfully joined ${orgName}!`,
      });

      // Reload invitations and redirect to organization dashboard
      await loadInvitations();

      // Small delay to show the success message before redirecting
      setTimeout(() => {
        window.location.href = '/organization/dashboard';
      }, 1500);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to accept invitation",
        variant: "destructive",
      });
    } finally {
      setProcessingInvitations(prev => {
        const next = new Set(prev);
        next.delete(invitationId);
        return next;
      });
    }
  };

  const handleRejectInvitation = async (token: string, orgName: string, invitationId: string) => {
    setProcessingInvitations(prev => new Set(prev).add(invitationId));

    try {
      const { error } = await supabase.rpc('reject_organization_invitation', {
        p_invitation_token: token
      });

      if (error) throw error;

      toast({
        title: "Invitation rejected",
        description: `You have declined the invitation to join ${orgName}`,
      });

      await loadInvitations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject invitation",
        variant: "destructive",
      });
    } finally {
      setProcessingInvitations(prev => {
        const next = new Set(prev);
        next.delete(invitationId);
        return next;
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpiringSoon = (expiresAt: string) => {
    const expiry = new Date(expiresAt);
    const now = new Date();
    const hoursUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilExpiry <= 24 && hoursUntilExpiry > 0;
  };

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
        <Header />

        <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-10 text-center"
          >
            <div className="inline-flex items-center justify-center p-3 mb-4 rounded-full bg-blue-100/50 text-blue-600 backdrop-blur-sm">
              <MailIcon className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">Organization Invitations</h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {loading
                ? 'Checking for invitations...'
                : invitations.length > 0
                  ? `You have ${invitations.length} pending invitation${invitations.length === 1 ? '' : 's'} waiting for your response.`
                  : 'Manage your organization invitations.'
              }
            </p>
          </motion.div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <div className="w-12 h-12 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
              <p className="text-gray-500 animate-pulse">Loading invitations...</p>
            </div>
          ) : invitations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <GlassTile className="py-20 flex flex-col items-center justify-center text-center opacity-80" interactive={false}>
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <MailIcon className="w-12 h-12 text-gray-300" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No pending invitations</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  When someone invites you to join their organization, the invitation will appear here for you to accept or decline.
                </p>
                <Button
                  variant="outline"
                  onClick={loadInvitations}
                  className="mt-8"
                >
                  Refresh
                </Button>
              </GlassTile>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence>
                {invitations.map((invitation, index) => {
                  const isProcessing = processingInvitations.has(invitation.id);
                  const expiringSoon = isExpiringSoon(invitation.expires_at);

                  return (
                    <motion.div
                      key={invitation.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <GlassTile className="p-0 overflow-hidden" interactive={false}>
                        <div className="p-6 md:p-8">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-2xl font-bold text-gray-900">{invitation.organization_name}</h2>
                                {expiringSoon && (
                                  <Badge variant="destructive" className="animate-pulse">Expires Soon</Badge>
                                )}
                              </div>
                              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 uppercase tracking-wide text-xs font-semibold px-2 py-0.5">
                                {invitation.role} Role
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-500 bg-white/50 px-3 py-1.5 rounded-lg border border-white/60 inline-flex items-center self-start md:self-auto">
                              <ClockIcon className="w-4 h-4 mr-2 text-gray-400" />
                              Expires: {formatDate(invitation.expires_at)}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-white/40 rounded-xl border border-white/50 mb-6">
                            <div className="space-y-3">
                              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Invitation Details</h4>
                              <div className="flex items-center gap-3 text-gray-700">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                  <UserIcon className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Invited by</p>
                                  <p className="font-medium">{invitation.invited_by_name}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 text-gray-700">
                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                  <CalendarIcon className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Received on</p>
                                  <p className="font-medium">{formatDate(invitation.created_at)}</p>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Message</h4>
                              {invitation.message ? (
                                <div className="bg-white/60 p-4 rounded-lg text-sm text-gray-600 italic border border-white/60 h-full">
                                  "{invitation.message}"
                                </div>
                              ) : (
                                <div className="text-sm text-gray-400 italic">No message provided.</div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
                            <Button
                              onClick={() => handleRejectInvitation(
                                invitation.invitation_token,
                                invitation.organization_name,
                                invitation.id
                              )}
                              disabled={isProcessing}
                              variant="outline"
                              className="border-gray-300 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              {isProcessing ? 'Processing...' : 'Decline'}
                            </Button>
                            <Button
                              onClick={() => handleAcceptInvitation(
                                invitation.invitation_token,
                                invitation.organization_name,
                                invitation.id
                              )}
                              disabled={isProcessing}
                              className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              {isProcessing ? 'Processing...' : 'Accept Invitation'}
                            </Button>
                          </div>
                        </div>
                      </GlassTile>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
}
