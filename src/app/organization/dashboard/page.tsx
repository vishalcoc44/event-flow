'use client';

import { useEffect, useState } from 'react';
import { useOrganizationPermissions, useSubscriptionInfo } from '@/hooks/useOrganizationData';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { organizationAPI } from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { GlassTile } from '@/components/ui/glass-tile';
import {
  Building2,
  Calendar,
  Users,
  Plus,
  Mail,
  LogOut,
  Settings,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Lock,
  Clock,
  MapPin,
  Share2,
  Activity,
  Ticket,
  DollarSign
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { ActivityLog } from '@/components/organization/ActivityLog';

export default function OrganizationDashboard() {
  const { organization, stats, isLoading: orgLoading } = useOrganization();
  const { canCreateEvents, canInviteUsers, isOwner } = useOrganizationPermissions();
  const subscription = useSubscriptionInfo();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  // Redirect to auth page if user is not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  // Leave organization state
  const [isLeavingOrg, setIsLeavingOrg] = useState(false);
  const [leaveConfirmation, setLeaveConfirmation] = useState('');
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  const handleLeaveOrganization = async () => {
    if (!organization || !user) return;

    if (leaveConfirmation !== organization.name) {
      toast({
        title: "Confirmaton Mismatch",
        description: "Please enter the exact organization name to proceed.",
        variant: "destructive",
      });
      return;
    }

    setIsLeavingOrg(true);
    try {
      await organizationAPI.leaveOrganization();
      toast({
        title: "Exit Successful",
        description: `You have officially left ${organization.name}.`,
      });
      setLeaveConfirmation('');
      setShowLeaveDialog(false);
      if (user?.id) {
        router.push(user.role === 'ADMIN' ? '/admin/dashboard' : '/customer/dashboard');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to leave organization",
        variant: "destructive",
      });
    } finally {
      setIsLeavingOrg(false);
    }
  };

  if (orgLoading || authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-sm font-bold uppercase tracking-widest text-neutral-500 animate-pulse">
            Syncing Workspace...
          </p>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <GlassTile className="p-16 max-w-md text-center" interactive={false}>
          <div className="w-20 h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center text-blue-500 mx-auto mb-8">
            <Building2 className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-black tracking-tighter mb-4">No Organization.</h2>
          <p className="text-neutral-500 mb-10 font-medium leading-relaxed">
            You are not currently part of any organization. Create a new organization or join an existing one to get started.
          </p>
          <Button asChild className="h-14 px-8 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-black tracking-tight hover:scale-[1.02] transition-transform shadow-2xl w-full">
            <Link href="/create-organization">Create Organization</Link>
          </Button>
        </GlassTile>
      </div>
    );
  }

  // Calculate stats from organization and stats view
  const displayStats = {
    totalEvents: organization.current_events_count || 0,
    totalBookings: stats?.total_bookings || 0,
    totalMembers: organization.current_users_count || 0,
    totalRevenue: stats?.total_revenue || 0
  };

  const statItems = [
    { label: 'Total Events', val: displayStats.totalEvents, icon: Calendar, color: 'blue' },
    { label: 'Confirmed Bookings', val: displayStats.totalBookings, icon: Ticket, color: 'green' },
    { label: 'Active Crew', val: displayStats.totalMembers, icon: Users, color: 'purple' },
    { label: 'Total Revenue', val: `$${displayStats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'amber' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-x-hidden">
      {/* Mesh Background */}
      <div className="fixed inset-0 z-[-1] opacity-30 dark:opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />

      <main className="flex-grow pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Dashboard Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                  <Building2 className="h-5 w-5" />
                </div>
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-blue-500">{organization.name}</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9]">
                Organization Dashboard.
              </h1>
              <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px] mt-2 ml-1">
                Manage your organization and team
              </p>
            </div>

            <div className="flex gap-4">
              {isOwner && (
                <Button asChild variant="ghost" className="h-14 px-6 rounded-2xl gap-3 font-bold uppercase tracking-widest text-[10px] bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/5 transition-all">
                  <Link href="/organization/settings"><Settings className="h-4 w-4" /> Settings</Link>
                </Button>
              )}
              <Button asChild variant="ghost" className="h-14 px-6 rounded-2xl gap-3 font-bold uppercase tracking-widest text-[10px] hover:bg-white/40 dark:hover:bg-white/5 transition-all">
                <Link href={user?.role === 'ADMIN' ? '/admin/dashboard' : '/customer/dashboard'}>Leave Dashboard</Link>
              </Button>
            </div>
          </motion.div>

          {/* Core Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {statItems.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <GlassTile className="p-6 relative group" interactive={false}>
                  <div className={cn(
                    "absolute top-6 right-6 w-12 h-12 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all",
                    stat.color === 'blue' && "bg-blue-500/10 text-blue-500",
                    stat.color === 'purple' && "bg-purple-500/10 text-purple-500",
                    stat.color === 'green' && "bg-green-500/10 text-green-500",
                    stat.color === 'amber' && "bg-amber-500/10 text-amber-500"
                  )}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{stat.label}</p>
                    <h4 className="text-3xl font-black tracking-tight">{stat.val}</h4>
                  </div>
                </GlassTile>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Quick Actions Matrix */}
            <div className="lg:col-span-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {canCreateEvents && (
                  <GlassTile className="p-8 flex flex-col justify-between group overflow-hidden" hoverScale={1.02}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Plus className="w-32 h-32" />
                    </div>
                    <div className="mb-12">
                      <div className="w-14 h-14 rounded-3xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center mb-6 shadow-xl">
                        <Plus className="h-8 w-8" />
                      </div>
                      <h3 className="text-2xl font-black tracking-tighter mb-2">Create Event</h3>
                      <p className="text-neutral-500 text-sm font-medium leading-relaxed">
                        Create and manage a new event for your organization.
                      </p>
                    </div>
                    <Button asChild className="w-full h-14 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-black tracking-tight">
                      <Link href="/organization/create-event">Create Event</Link>
                    </Button>
                  </GlassTile>
                )}

                {canInviteUsers && (
                  <GlassTile className="p-8 flex flex-col justify-between group overflow-hidden" hoverScale={1.02}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Users className="w-32 h-32" />
                    </div>
                    <div className="mb-12">
                      <div className="w-14 h-14 rounded-3xl bg-blue-500 text-white flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20">
                        <Mail className="h-7 w-7" />
                      </div>
                      <h3 className="text-2xl font-black tracking-tighter mb-2">Invite Members</h3>
                      <p className="text-neutral-500 text-sm font-medium leading-relaxed">
                        Invite new team members to join your organization.
                      </p>
                    </div>
                    <Button asChild variant="outline" className="w-full h-14 rounded-2xl border-neutral-200 dark:border-white/10 font-black tracking-tight hover:bg-black/5 dark:hover:bg-white/5">
                      <Link href="/organization/members">Manage Members</Link>
                    </Button>
                  </GlassTile>
                )}
              </div>

              {/* Activity Log Feed */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black tracking-tighter uppercase flex items-center gap-3">
                    <Activity className="h-6 w-6 text-blue-500" /> Activity Log
                  </h3>
                  <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-neutral-400">View Full Archive</Button>
                </div>
                <ActivityLog organizationId={organization.id} />
              </div>


              {/* Subscriptions / Usage */}
              {subscription && (
                <GlassTile className="p-10" interactive={false}>
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-black tracking-tighter">Subscription Plan</h3>
                    <Badge className={cn(
                      "h-8 px-4 rounded-xl font-black tracking-tighter uppercase text-[10px] border",
                      subscription.status === 'ACTIVE' ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                    )}>
                      {subscription.plan || 'Free Tier'} / {subscription.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                          <span>Event Capacity</span>
                          <span>{organization?.current_events_count || 0} / {organization?.max_events || '∞'}</span>
                        </div>
                        <div className="h-1.5 w-full bg-neutral-100 dark:bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 shadow-lg shadow-blue-500/20 transition-all duration-1000 ease-out"
                            style={{ width: `${Math.min(((organization?.current_events_count || 0) / (organization?.max_events || 100)) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                          <span>Member Slots</span>
                          <span>{organization?.current_users_count || 0} / {organization?.max_users || '∞'}</span>
                        </div>
                        <div className="h-1.5 w-full bg-neutral-100 dark:bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 shadow-lg shadow-purple-500/20 transition-all duration-1000 ease-out"
                            style={{ width: `${Math.min(((organization?.current_users_count || 0) / (organization?.max_users || 100)) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-neutral-100/50 dark:bg-black/20 rounded-3xl p-6 border border-neutral-100 dark:border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 flex items-center justify-center shadow-sm">
                          <Clock className="h-6 w-6 text-neutral-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Cycle Remaining</p>
                          <p className="text-xl font-black">{subscription.daysUntilExpiry !== null ? `${subscription.daysUntilExpiry} Days` : 'Infinite'}</p>
                        </div>
                      </div>
                      <Button variant="link" className="text-blue-500 font-bold uppercase tracking-widest text-[10px]">Upgrade</Button>
                    </div>
                  </div>
                </GlassTile>
              )}
            </div>

            {/* Sidebar View */}
            <div className="lg:col-span-4 space-y-8">
              {/* Tactical Overlays */}
              <GlassTile className="p-8" interactive={false}>
                <h3 className="text-xl font-black tracking-tighter mb-8 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-500" /> Quick Discovery
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Events List', href: '/organization/events', icon: Calendar },
                    { label: 'Event Spaces', href: '/organization/spaces', icon: MapPin },
                    { label: 'Community', href: '/organization/community', icon: Share2 },
                    { label: 'Team Members', href: '/organization/members', icon: ShieldCheck }
                  ].map((link) => (
                    <Link key={link.label} href={link.href}>
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/5 hover:border-blue-500/30 transition-all group">
                        <div className="flex items-center gap-3">
                          <link.icon className="h-4 w-4 text-neutral-400 group-hover:text-blue-500" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">{link.label}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-neutral-300 group-hover:text-blue-500 translate-x-0 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  ))}
                </div>

                {!isOwner && (
                  <div className="mt-12 pt-8 border-t border-neutral-100 dark:border-white/5">
                    <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" className="w-full text-red-500 hover:bg-red-500/10 h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px] gap-2">
                          <LogOut className="h-4 w-4" /> Leave Organization
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="rounded-3xl border-white/10 backdrop-blur-xl bg-background/80">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-black tracking-tighter leading-tight">Leave Organization</DialogTitle>
                          <DialogDescription className="font-medium">
                            Warning: This will remove you from {organization?.name}. You will no longer have access to this organization's data.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label className="uppercase tracking-widest text-[10px] font-bold opacity-50">Confirm Identity</Label>
                            <p className="text-sm font-bold">Type <span className="text-red-500">{organization?.name}</span> to authenticate</p>
                            <Input
                              value={leaveConfirmation}
                              onChange={(e) => setLeaveConfirmation(e.target.value)}
                              className="h-14 rounded-2xl bg-black/5 border-black/10 font-bold"
                              placeholder="Organization Name"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="destructive"
                            onClick={handleLeaveOrganization}
                            disabled={isLeavingOrg || leaveConfirmation !== organization.name}
                            className="h-12 px-8 rounded-2xl font-black tracking-tight w-full md:w-auto"
                          >
                            {isLeavingOrg ? 'Processing...' : 'Confirm Leave'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </GlassTile>

              {/* Secondary Meta Group */}
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Lock className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                  <h4 className="text-xl font-black tracking-tighter mb-2">Secure Workspace.</h4>
                  <p className="text-white/60 text-xs font-bold leading-relaxed mb-6">
                    Your data is secure and protected within your organization workspace.
                  </p>
                  <Badge className="bg-white/20 text-white border-white/20 uppercase tracking-widest text-[10px] font-bold">Encrypted</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}