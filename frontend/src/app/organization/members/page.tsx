'use client';

import { useState, useEffect } from 'react';
import { useOrganizationData, useOrganizationPermissions } from '@/hooks/useOrganizationData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HoverShadowEffect, CardHoverShadow } from '@/components/ui/hover-shadow-effect';
import { GradientButton } from '@/components/ui/gradient-button';
import { CardContainer, CardBody, CardItem } from '@/components/ui/3d-card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'motion/react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// Icons
const UsersIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-5 h-5"}>
    <path fillRule="evenodd" d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" clipRule="evenodd" />
  </svg>
);

const EnvelopeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-5 h-5"}>
    <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
    <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
  </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-4 h-4"}>
    <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-4 h-4"}>
    <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clipRule="evenodd" />
  </svg>
);

const ExclamationTriangleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-4 h-4"}>
    <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-4 h-4"}>
    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
  </svg>
);

const ShieldCheckIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-5 h-5"}>
    <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.814 3.720 10.733 8.884 12.208a.75.75 0 0 0 .632 0C16.930 20.482 20.65 15.563 20.65 9.75a12.74 12.74 0 0 0-.635-4.11.75.75 0 0 0-.722-.515 11.209 11.209 0 0 1-7.877-3.08ZM15.75 9.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm-3 2.25a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm-1.5-1.5a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" clipRule="evenodd" />
  </svg>
);

interface Member {
  id: string;
  user_id: string;
  organization_id: string;
  role: 'owner' | 'admin' | 'user';
  status: 'active' | 'pending' | 'inactive';
  joined_at: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  invited_by: string;
  invited_at: string;
  expires_at: string;
}

export default function OrganizationMembers() {
  const { organization, orgLoading } = useOrganizationData();
  const { canManageMembers, canInviteUsers, isOwner } = useOrganizationPermissions();
  const { toast } = useToast();

  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Invitation form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'user'>('user');
  const [isInviting, setIsInviting] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  // Member management state
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [newRole, setNewRole] = useState<string>('');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    if (organization) {
      loadMembers();
      loadInvitations();
    }
  }, [organization]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      if (!organization) return;
      // Fetch real organization members from users table
      const { data, error } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, organization_id, role_in_org, is_org_admin, joined_at')
        .eq('organization_id', organization.id);
      if (error) throw error;
      const membersData: Member[] = (data || []).map((user: any) => ({
        id: user.id,
        user_id: user.id,
        organization_id: user.organization_id,
        role: user.role_in_org ? user.role_in_org.toLowerCase() : 'user',
        status: 'active',
        joined_at: user.joined_at,
        user: {
          id: user.id,
          email: user.email,
          full_name: [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email,
          avatar_url: undefined // You can add avatar support if you have it
        }
      }));
      setMembers(membersData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load members.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadInvitations = async () => {
    if (!organization) return;

    try {
      // Load organization invitations with a simple query to avoid permission issues
      const { data, error } = await supabase
        .from('organization_invitations')
        .select(`
          id,
          email,
          role,
          status,
          message,
          created_at,
          expires_at
        `)
        .eq('organization_id', organization.id)
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading invitations:', error);
        // If there's an error, set empty array instead of throwing
        setInvitations([]);
        return;
      }

      // Use generic inviter information to avoid permission issues
      const invitationsWithGenericDetails = (data || []).map((invitation) => ({
        id: invitation.id,
        email: invitation.email,
        role: invitation.role.toLowerCase(),
        status: invitation.status,
        invited_by: 'Organization Admin', // Generic name to avoid permission issues
        invited_at: invitation.created_at,
        expires_at: invitation.expires_at
      }));

      setInvitations(invitationsWithGenericDetails);
    } catch (error) {
      console.error('Error loading invitations:', error);
      // Don't show error toast for invitations, just log it
      // This prevents spam if invitations fail but other functionality works
    }
  };

  const handleInviteUser = async () => {
    try {
      setIsInviting(true);

      // Basic validation
      if (!inviteEmail.trim()) {
        toast({
          title: "Error",
          description: "Please enter an email address.",
          variant: "destructive",
        });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(inviteEmail)) {
        toast({
          title: "Error",
          description: "Please enter a valid email address.",
          variant: "destructive",
        });
        return;
      }

      // TODO: Implement actual invitation API call
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

      toast({
        title: "Invitation sent",
        description: `Invitation sent to ${inviteEmail}`,
      });

      setInviteEmail('');
      setShowInviteDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleUpdateMemberRole = async () => {
    if (!selectedMember || !newRole) return;

    try {
      setIsUpdatingRole(true);

      // TODO: Implement API call to update member role
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API call

      setMembers(prev => prev.map(member =>
        member.id === selectedMember.id
          ? { ...member, role: newRole as 'owner' | 'admin' | 'user' }
          : member
      ));

      toast({
        title: "Role updated",
        description: `${selectedMember.user.full_name}'s role has been updated to ${newRole}.`,
      });

      setSelectedMember(null);
      setNewRole('');
      setShowRoleDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update member role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!selectedMember) return;

    try {
      setIsRemoving(true);

      // TODO: Implement API call to remove member
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API call

      setMembers(prev => prev.filter(member => member.id !== selectedMember.id));

      toast({
        title: "Member removed",
        description: `${selectedMember.user.full_name} has been removed from the organization.`,
      });

      setSelectedMember(null);
      setShowRemoveDialog(false);
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRemoving(false);
    }
  };

  const handleResendInvitation = async (invitation: Invitation) => {
    try {
      // TODO: Implement API call to resend invitation
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API call

      toast({
        title: "Invitation resent",
        description: `Invitation resent to ${invitation.email}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend invitation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancelInvitation = async (invitation: Invitation) => {
    try {
      // TODO: Implement API call to cancel invitation
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API call

      setInvitations(prev => prev.filter(inv => inv.id !== invitation.id));

      toast({
        title: "Invitation cancelled",
        description: `Invitation to ${invitation.email} has been cancelled.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel invitation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner': return 'default';
      case 'admin': return 'secondary';
      case 'user': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'pending': return 'secondary';
      case 'inactive': return 'destructive';
      default: return 'outline';
    }
  };

  if (orgLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 py-8 relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="animate-pulse"
          >
            <div className="h-12 bg-gray-200 rounded-2xl w-1/3 mb-8"></div>
            <div className="h-16 bg-gray-200 rounded-3xl w-2/3 mb-8"></div>
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-white/60 rounded-2xl shadow-sm"></div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 py-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto mt-16"
          >
            <CardHoverShadow>
              <Card className="bg-white border-gray-200 rounded-3xl">
                <CardContent className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <UsersIcon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">No Organization Found</h2>
                  <p className="text-gray-600 mb-8">You need to be part of an organization to access member management.</p>
                  <HoverShadowEffect className="inline-block" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.1} hoverScale={1.02} hoverLift={-1} transitionDuration={150}>
                    <GradientButton href="/create-organization" variant="primary">
                      Create Organization
                    </GradientButton>
                  </HoverShadowEffect>
                </CardContent>
              </Card>
            </CardHoverShadow>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!canManageMembers) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 py-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto mt-16"
          >
            <CardHoverShadow>
              <Card className="bg-white border-gray-200 rounded-3xl">
                <CardContent className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                  <p className="text-gray-600 mb-8">You don't have permission to manage organization members.</p>
                  <HoverShadowEffect className="inline-block" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.1} hoverScale={1.02} hoverLift={-1} transitionDuration={150}>
                    <GradientButton href="/organization/dashboard" variant="outline">
                      Back to Dashboard
                    </GradientButton>
                  </HoverShadowEffect>
                </CardContent>
              </Card>
            </CardHoverShadow>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-yellow-200/10 to-pink-200/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-center lg:text-left"
            >
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-3">
                Organization Members
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                Manage your organization's members, roles, and invitations
              </p>
            </motion.div>
          </div>

          <div className="flex justify-center lg:justify-end mb-8">
            <div className="flex items-center gap-4">
              {canInviteUsers && (
                <HoverShadowEffect className="inline-block" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.1} hoverScale={1.02} hoverLift={-1} transitionDuration={150}>
                  <GradientButton
                    onClick={() => setShowInviteDialog(true)}
                    variant="primary"
                    className="flex items-center gap-2"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Invite User
                  </GradientButton>
                </HoverShadowEffect>
              )}

              <HoverShadowEffect className="inline-block" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.1} hoverScale={1.02} hoverLift={-1} transitionDuration={150}>
                <GradientButton
                  href="/organization/dashboard"
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  ← Back to Dashboard
                </GradientButton>
              </HoverShadowEffect>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Tabs defaultValue="members" className="w-full">
            <div className="flex justify-start">
              <TabsList className="flex gap-2 bg-white border-gray-200 p-2 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200">
                <TabsTrigger value="members" className="px-4 py-2 text-sm rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-teal-500 data-[state=active]:text-white hover:bg-gray-50 transition-all duration-200">Members ({members.length})</TabsTrigger>
                <TabsTrigger value="invitations" className="px-4 py-2 text-sm rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-teal-500 data-[state=active]:text-white hover:bg-gray-50 transition-all duration-200">Invitations ({invitations.length})</TabsTrigger>
              </TabsList>
            </div>

            {/* Members Tab */}
            <TabsContent value="members" className="mt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <CardHoverShadow theme="blue" className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Team Members</h2>
                      <p className="text-gray-600">Manage your organization's members and their roles.</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 max-w-xs">
                        <Input
                          placeholder="Search members..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="bg-white border-gray-200"
                        />
                      </div>
                      <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-40 bg-white border-gray-200">
                          <SelectValue placeholder="Filter by role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Roles</SelectItem>
                          <SelectItem value="owner">Owner</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Members List */}
                  <div className="space-y-4">
                    {filteredMembers.map((member) => (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CardHoverShadow theme="blue" className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center shadow-md">
                                {member.user.avatar_url ? (
                                  <img
                                    src={member.user.avatar_url}
                                    alt={member.user.full_name}
                                    className="w-12 h-12 rounded-2xl object-cover"
                                  />
                                ) : (
                                  <span className="text-sm font-semibold text-blue-600">
                                    {member.user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{member.user.full_name}</h3>
                                <p className="text-sm text-gray-600">{member.user.email}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant={getRoleBadgeVariant(member.role)} className="text-xs">
                                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                                  </Badge>
                                  <Badge variant={getStatusBadgeVariant(member.status)} className="text-xs">
                                    {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-sm text-muted-foreground">
                                Joined {new Date(member.joined_at).toLocaleDateString()}
                              </div>
                              {canManageMembers && member.role !== 'owner' && (
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedMember(member);
                                      setNewRole(member.role);
                                      setShowRoleDialog(true);
                                    }}
                                  >
                                    Change Role
                                  </Button>
                                  {isOwner && (
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedMember(member);
                                        setShowRemoveDialog(true);
                                      }}
                                    >
                                      <TrashIcon className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardHoverShadow>
                      </motion.div>
                    ))}

                    {filteredMembers.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-center py-12"
                      >
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                          <UsersIcon className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {searchTerm || roleFilter !== 'all' ? 'No matches found' : 'No team members yet'}
                        </h3>
                        <p className="text-gray-600">
                          {searchTerm || roleFilter !== 'all'
                            ? 'Try adjusting your search or filter criteria.'
                            : 'Start building your team by inviting new members.'}
                        </p>
                      </motion.div>
                    )}
                  </div>
                </CardHoverShadow>
              </motion.div>
            </TabsContent>

            {/* Invitations Tab */}
            <TabsContent value="invitations" className="mt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <CardHoverShadow theme="green" className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Pending Invitations</h2>
                      <p className="text-gray-600">Manage invitations sent to potential organization members.</p>
                    </div>
                  </div>

                  {/* Invitations List */}
                  <div className="space-y-4">
                    {invitations.map((invitation) => (
                      <motion.div
                        key={invitation.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CardHoverShadow theme="green" className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center shadow-md">
                                <EnvelopeIcon className="w-6 h-6 text-green-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{invitation.email}</h3>
                                <p className="text-sm text-gray-600">
                                  Invited by {invitation.invited_by} • {invitation.role} role
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant={getStatusBadgeVariant(invitation.status)} className="text-xs">
                                    {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                                  </Badge>
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <ClockIcon className="w-4 h-4" />
                                    Expires {new Date(invitation.expires_at).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {invitation.status === 'pending' && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleResendInvitation(invitation)}
                                  >
                                    Resend
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleCancelInvitation(invitation)}
                                  >
                                    Cancel
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </CardHoverShadow>
                      </motion.div>
                    ))}

                    {invitations.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-center py-12"
                      >
                        <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                          <EnvelopeIcon className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending invitations</h3>
                        <p className="text-gray-600">All sent invitations have been accepted or expired.</p>
                      </motion.div>
                    )}
                  </div>
                </CardHoverShadow>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Invite User Dialog */}
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite New Member</DialogTitle>
              <DialogDescription>
                Send an invitation to join your organization.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inviteEmail">Email Address</Label>
                <Input
                  id="inviteEmail"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="user@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inviteRole">Role</Label>
                <Select value={inviteRole} onValueChange={(value: 'admin' | 'user') => setInviteRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleInviteUser} disabled={isInviting}>
                {isInviting ? 'Sending...' : 'Send Invitation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Role Update Dialog */}
        <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Member Role</DialogTitle>
              <DialogDescription>
                Change the role for {selectedMember?.user.full_name}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newRole">New Role</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    {isOwner && <SelectItem value="owner">Owner</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateMemberRole} disabled={isUpdatingRole || !newRole}>
                {isUpdatingRole ? 'Updating...' : 'Update Role'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Remove Member Dialog */}
        <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove Member</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove {selectedMember?.user.full_name} from the organization?
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRemoveDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRemoveMember}
                disabled={isRemoving}
              >
                {isRemoving ? 'Removing...' : 'Remove Member'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}