'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, ClockIcon, UserIcon, MailIcon } from 'lucide-react';

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

      // DIRECT QUERY ONLY - No RPC functions to avoid permission issues
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
        throw directError;
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-gray-500">Loading invitations...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Organization Invitations</h1>
            <p className="text-gray-600">
              {invitations.length > 0 
                ? `You have ${invitations.length} pending invitation${invitations.length === 1 ? '' : 's'}`
                : 'You have no pending invitations at this time'
              }
            </p>
          </div>
          
          {invitations.length === 0 ? (
            <Card>
              <CardContent className="pt-6 pb-8">
                <div className="text-center">
                  <MailIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No pending invitations</h3>
                  <p className="text-gray-500">
                    When someone invites you to join their organization, you'll see the invitations here.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {invitations.map((invitation) => {
                const isProcessing = processingInvitations.has(invitation.id);
                const expiringSoon = isExpiringSoon(invitation.expires_at);
                
                return (
                  <Card key={invitation.id} className="overflow-hidden">
                    <CardHeader className="bg-white border-b">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl text-gray-900">
                          {invitation.organization_name}
                        </CardTitle>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="capitalize">
                            {invitation.role}
                          </Badge>
                          {expiringSoon && (
                            <Badge variant="destructive">
                              Expires Soon
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <UserIcon className="h-4 w-4" />
                            <span><strong>Invited by:</strong> {invitation.invited_by_name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <CalendarIcon className="h-4 w-4" />
                            <span><strong>Invited:</strong> {formatDate(invitation.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <ClockIcon className="h-4 w-4" />
                            <span><strong>Expires:</strong> {formatDate(invitation.expires_at)}</span>
                          </div>
                        </div>
                        
                        {invitation.message && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <strong>Message:</strong> {invitation.message}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex gap-3 pt-4">
                          <Button 
                            onClick={() => handleAcceptInvitation(
                              invitation.invitation_token, 
                              invitation.organization_name,
                              invitation.id
                            )}
                            disabled={isProcessing}
                            className="bg-green-600 hover:bg-green-700 text-white px-6"
                          >
                            {isProcessing ? 'Processing...' : 'Accept Invitation'}
                          </Button>
                          <Button 
                            onClick={() => handleRejectInvitation(
                              invitation.invitation_token, 
                              invitation.organization_name,
                              invitation.id
                            )}
                            disabled={isProcessing}
                            variant="outline"
                            className="px-6"
                          >
                            {isProcessing ? 'Processing...' : 'Decline'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
          
          <div className="mt-8 text-center">
            <Button 
              variant="outline" 
              onClick={loadInvitations}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh Invitations'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
