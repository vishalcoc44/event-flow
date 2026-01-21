'use client';

import React, { useState, useEffect } from 'react';
import { useOrganizationData, useOrganizationPermissions } from '@/hooks/useOrganizationData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { GlassTile } from '@/components/ui/glass-tile';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Trash2,
  Mail,
  Clock,
  ArrowLeft,
  Search,
  Filter,
  MoreVertical,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronLeft,
  Search as SearchIcon,
  ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const { user } = useAuth();

  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'user'>('user');
  const [isInviting, setIsInviting] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [newRole, setNewRole] = useState<string>('');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

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
      const { data, error } = await supabase
        .from('users')
        .select(`
          id, 
          email, 
          first_name, 
          last_name, 
          organization_id, 
          role_in_org, 
          is_org_admin, 
          joined_at,
          user_profiles (
            profile_image_url
          )
        `)
        .eq('organization_id', organization.id);
      if (error) throw error;
      const membersData: Member[] = (data || []).map((user: any) => ({
        id: user.id,
        user_id: user.id,
        organization_id: user.organization_id,
        role: (user.role_in_org?.toLowerCase() || 'user') as any,
        status: 'active',
        joined_at: user.joined_at,
        user: {
          id: user.id,
          email: user.email || '',
          full_name: [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || 'Anonymous Operative',
          avatar_url: user.user_profiles?.[0]?.profile_image_url || user.user_profiles?.profile_image_url
        }
      }));
      setMembers(membersData);
    } catch (error) {
      toast({ title: "System Failure", description: "Could not retrieve syndicate members.", variant: "destructive" });
    } finally { setLoading(false); }
  };

  const loadInvitations = async () => {
    if (!organization) return;
    try {
      const { data, error } = await supabase
        .from('organization_invitations')
        .select('id, email, role, status, created_at, expires_at')
        .eq('organization_id', organization.id)
        .eq('status', 'PENDING');
      if (error) return;
      setInvitations((data || []).map(invitation => ({
        id: invitation.id,
        email: invitation.email,
        role: invitation.role.toLowerCase(),
        status: invitation.status,
        invited_by: 'Syndicate Admin',
        invited_at: invitation.created_at,
        expires_at: invitation.expires_at
      })));
    } catch (error) { console.error('Error loading invitations:', error); }
  };

  const handleInviteUser = async () => {
    // Enhanced email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!inviteEmail.trim() || !emailRegex.test(inviteEmail)) {
      toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }

    // Prevent double submission
    if (isInviting) return;
    setIsInviting(true);

    try {
      const { error } = await supabase.rpc('send_organization_invitation', {
        p_organization_id: organization!.id,
        p_email: inviteEmail.trim(),
        p_role: inviteRole.toUpperCase(),
        p_message: `You've been invited to join ${organization!.name}`
      });

      if (error) {
        // Differentiate error types
        if (error.message?.includes('already')) {
          throw new Error('This user has already been invited or is a member.');
        }
        throw error;
      }

      toast({ title: "Invitation Sent", description: `Invitation sent to ${inviteEmail}.` });
      setInviteEmail('');
      setShowInviteDialog(false);
      loadInvitations();
    } catch (error: any) {
      toast({
        title: "Invitation Failed",
        description: error.message || "Failed to send invitation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleUpdateMemberRole = async () => {
    if (!selectedMember || !newRole) return;
    if (isUpdatingRole) return; // Prevent double-click
    setIsUpdatingRole(true);

    try {
      const { error } = await supabase
        .from('users')
        .update({
          role_in_org: newRole.toUpperCase(),
          is_org_admin: newRole === 'owner' || newRole === 'admin'
        })
        .eq('id', selectedMember.user_id)
        .eq('organization_id', organization!.id);

      if (error) throw error;

      // Update local state
      setMembers(prev => prev.map(m =>
        m.id === selectedMember.id ? { ...m, role: newRole as any } : m
      ));
      toast({ title: "Role Updated", description: `${selectedMember.user.full_name}'s role changed to ${newRole}.` });
      setShowRoleDialog(false);
      setSelectedMember(null);
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update member role.",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!selectedMember) return;
    if (isRemoving) return; // Prevent double-click
    setIsRemoving(true);

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('You must be logged in');

      const { error } = await supabase.rpc('remove_user_from_organization', {
        p_user_id: selectedMember.user_id,
        p_organization_id: organization!.id,
        p_removed_by: currentUser.id
      });

      if (error) throw error;

      // Update local state
      setMembers(prev => prev.filter(m => m.id !== selectedMember.id));
      toast({ title: "Member Removed", description: `${selectedMember.user.full_name} has been removed from the organization.` });
      setShowRemoveDialog(false);
      setSelectedMember(null);
    } catch (error: any) {
      toast({
        title: "Removal Failed",
        description: error.message || "Failed to remove member.",
        variant: "destructive"
      });
    } finally {
      setIsRemoving(false);
    }
  };

  const filteredMembers = members.filter(m => {
    const matchesSearch = !searchTerm || m.user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || m.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);

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

  if (!organization || !canManageMembers) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <GlassTile className="p-16 max-w-md text-center" interactive={false}>
          <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center text-red-500 mx-auto mb-8">
            <ShieldAlert className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-black tracking-tighter mb-4">Access Restricted.</h2>
          <p className="text-neutral-500 mb-10 font-medium leading-relaxed">
            You do not possess the clearance to manage this collective's syndicate.
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
      {/* Mesh Background */}
      <div className="fixed inset-0 z-[-1] opacity-30 dark:opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />

      <main className="flex-grow pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                  <Users className="h-5 w-5" />
                </div>
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-blue-500">Team Management</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9] mb-3">
                Team Members.
              </h1>
              <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">
                Organization Member Hub / {organization?.name}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={() => setShowInviteDialog(true)}
                className="h-14 px-8 rounded-2xl gap-3 font-black text-xs uppercase tracking-widest bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20 transition-all border-0"
              >
                <UserPlus className="h-4 w-4" /> Invite Member
              </Button>
              <Button asChild variant="ghost" className="h-14 px-6 rounded-2xl gap-3 font-bold uppercase tracking-widest text-[10px] bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/5">
                <Link href="/organization/dashboard"><ArrowLeft className="h-4 w-4" /> Dashboard</Link>
              </Button>
            </div>
          </motion.div>

          <Tabs defaultValue="members" className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <TabsList className="bg-neutral-100 dark:bg-white/5 p-2 rounded-3xl w-fit backdrop-blur-md">
                <TabsTrigger value="members" className="h-12 px-8 rounded-2xl font-black tracking-tighter uppercase text-[10px] data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-xl">Members ({members.length})</TabsTrigger>
                <TabsTrigger value="invitations" className="h-12 px-8 rounded-2xl font-black tracking-tighter uppercase text-[10px] data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-xl">Invitations ({invitations.length})</TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-4">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    placeholder="Filter by ID or Email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-14 w-full md:w-72 rounded-2xl pl-12 bg-white/50 dark:bg-white/5 border-neutral-200 dark:border-white/10 font-bold focus:ring-blue-500/50"
                  />
                </div>
                <div className="relative">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="h-14 px-6 rounded-2xl bg-white/50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 font-bold text-xs uppercase tracking-widest appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="all">All Roles</option>
                    <option value="owner">Owners</option>
                    <option value="admin">Admins</option>
                    <option value="user">Members</option>
                  </select>
                </div>
              </div>
            </div>

            <TabsContent value="members" className="space-y-4">
              <AnimatePresence mode="popLayout">
                {paginatedMembers.length > 0 ? (
                  paginatedMembers.map((member, index) => (
                    <motion.div
                      key={member.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <GlassTile className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6" interactive={false}>
                        <div className="flex items-center gap-6 w-full md:w-auto">
                          <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-black shadow-lg">
                              {member.user.full_name.charAt(0)}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-white dark:bg-neutral-900 border-4 border-background flex items-center justify-center">
                              <div className={cn("w-2 h-2 rounded-full", member.status === 'active' ? "bg-green-500" : "bg-neutral-400")} />
                            </div>
                          </div>
                          <div>
                            <h3 className="text-xl font-black tracking-tighter leading-none mb-1 group-hover:text-blue-500 transition-colors uppercase">
                              {member.user.full_name}
                            </h3>
                            <p className="text-neutral-500 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
                              <Mail className="h-3 w-3" /> {member.user.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-8 w-full md:w-auto justify-between">
                          <div className="flex flex-col gap-1 items-start md:items-center">
                            <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Role</span>
                            <Badge className={cn(
                              "px-3 h-7 rounded-lg font-black uppercase tracking-tighter text-[10px] border-0",
                              member.role === 'owner' ? "bg-blue-500/10 text-blue-500" :
                                member.role === 'admin' ? "bg-purple-500/10 text-purple-500" :
                                  "bg-neutral-500/10 text-neutral-400"
                            )}>
                              {member.role}
                            </Badge>
                          </div>

                          <div className="flex flex-col gap-1 items-start md:items-center">
                            <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Join Date</span>
                            <span className="text-xs font-bold font-mono">
                              {member.joined_at ? new Date(member.joined_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : '---'}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            {canManageMembers && member.role !== 'owner' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10 rounded-xl hover:bg-blue-500/10 hover:text-blue-500 transition-all border border-transparent hover:border-blue-500/20"
                                  onClick={() => {
                                    setSelectedMember(member);
                                    setNewRole(member.role);
                                    setShowRoleDialog(true);
                                  }}
                                >
                                  <ShieldCheck className="h-4 w-4" />
                                </Button>
                                {isOwner && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all border border-transparent hover:border-red-500/20"
                                    onClick={() => {
                                      setSelectedMember(member);
                                      setShowRemoveDialog(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </GlassTile>
                    </motion.div>
                  ))
                ) : (
                  <GlassTile className="p-16 text-center" interactive={false}>
                    <Users className="h-12 w-12 text-neutral-500/30 mx-auto mb-4" />
                    <h3 className="text-xl font-black tracking-tighter mb-2 uppercase">No operatives found.</h3>
                    <p className="text-neutral-500 font-medium text-sm">Modify your search parameters or invite new team members.</p>
                  </GlassTile>
                )}
              </AnimatePresence>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-8 mt-4 border-t border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredMembers.length)} of {filteredMembers.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-xl"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-1">
                      {[...Array(totalPages)].map((_, i) => (
                        <Button
                          key={i + 1}
                          variant={currentPage === i + 1 ? "default" : "ghost"}
                          className={cn(
                            "h-10 w-10 rounded-xl font-black text-xs",
                            currentPage === i + 1 ? "bg-blue-600 text-white" : ""
                          )}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </Button>
                      ))}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-xl"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="invitations" className="space-y-4">
              <AnimatePresence mode="popLayout">
                {invitations.map((inv, index) => (
                  <motion.div
                    key={inv.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <GlassTile className="p-6 flex items-center justify-between" interactive={false}>
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/5 flex items-center justify-center text-neutral-400">
                          <Mail className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-black text-lg tracking-tight leading-none mb-1">{inv.email}</h4>
                          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Invitation Pending / {inv.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="flex flex-col gap-1 items-center">
                          <span className="text-[8px] font-black uppercase tracking-widest text-neutral-400">Expires</span>
                          <span className="text-[10px] font-bold">{new Date(inv.expires_at).toLocaleDateString()}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl font-black uppercase text-[10px] tracking-widest text-red-500 hover:bg-red-500/10">Abort</Button>
                      </div>
                    </GlassTile>
                  </motion.div>
                ))}
              </AnimatePresence>

              {invitations.length === 0 && (
                <GlassTile className="p-20 text-center" interactive={false}>
                  <Clock className="h-16 w-16 text-neutral-200 dark:text-white/10 mx-auto mb-6" />
                  <h3 className="text-2xl font-black tracking-tighter mb-2">No Invitations.</h3>
                  <p className="text-neutral-500 font-medium">No pending invitations at this time.</p>
                </GlassTile>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Dialogs */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="rounded-3xl border-white/20 backdrop-blur-2xl bg-background/80">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tighter">New Member.</DialogTitle>
            <DialogDescription className="font-bold text-neutral-500">Send a secure invitation to a new team member.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label className="uppercase tracking-[0.2em] text-[10px] font-black opacity-50">Member Email</Label>
              <Input
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="member@example.com"
                className="h-14 rounded-2xl bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 font-bold px-6"
              />
            </div>
            <div className="space-y-2">
              <Label className="uppercase tracking-[0.2em] text-[10px] font-black opacity-50">Assigned Role</Label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="h-14 w-full rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 font-bold px-6 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="user">Member</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>
          <DialogFooter className="pt-8">
            <Button variant="ghost" onClick={() => setShowInviteDialog(false)} className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px]">Cancel</Button>
            <Button onClick={handleInviteUser} disabled={isInviting} className="h-14 px-8 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-500/20">
              {isInviting ? "Sending..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Update Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="rounded-3xl border-white/20 backdrop-blur-2xl bg-background/80">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tighter">Update Role.</DialogTitle>
            <DialogDescription className="font-bold text-neutral-500">Updating the role for {selectedMember?.user.full_name}.</DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <Label className="uppercase tracking-[0.2em] text-[10px] font-black opacity-50 mb-3 block">Assigned Role</Label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="h-14 w-full rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 font-bold px-6 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="user">Member</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowRoleDialog(false)} className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px]">Cancel</Button>
            <Button onClick={handleUpdateMemberRole} disabled={isUpdatingRole} className="h-14 px-8 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-[10px]">
              Save Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Dialog */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent className="rounded-3xl border-red-500/20 backdrop-blur-2xl bg-background/80">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tighter text-red-500">Remove Member.</DialogTitle>
            <DialogDescription className="font-bold text-neutral-500">Remove {selectedMember?.user.full_name} from your organization?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-8 gap-4">
            <Button variant="ghost" onClick={() => setShowRemoveDialog(false)} className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px]">Abort</Button>
            <Button onClick={handleRemoveMember} disabled={isRemoving} variant="destructive" className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-500/20">
              {isRemoving ? "Removing..." : "Confirm Removal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}